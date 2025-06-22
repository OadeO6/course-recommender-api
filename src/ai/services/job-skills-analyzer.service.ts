import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

export interface JobSkillsResult {
  jobTitle: string;
  skills: string[];
  queries: SearchQuery[];
}

export interface SearchQuery {
  skill: string;
  type: 'pdf' | 'doc' | 'blog' | 'video' | 'course';
  query: string;
  targetSite?: string;
}

@Injectable()
export class JobSkillsAnalyzerService {
  private llm: ChatGoogleGenerativeAI;
  private skillsChain: RunnableSequence;
  private queryChain: RunnableSequence;

  constructor() {
    this.llm = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-pro',
      temperature: 0.1,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    this.initializeChains();
  }

  private initializeChains() {
    // Skills extraction chain
    const skillsPrompt = PromptTemplate.fromTemplate(`
      Analyze the job title: "{jobTitle}"
      
      Extract 5-8 key technical skills required for this role.
      Return only the skill names, separated by commas.
      
      Example: "Python, SQL, Machine Learning, Data Visualization"
    `);

    this.skillsChain = RunnableSequence.from([
      skillsPrompt,
      this.llm,
    ]);

    // Query generation chain
    const queryPrompt = PromptTemplate.fromTemplate(`
      Generate optimized search queries for job title: "{jobTitle}" and skills: {skills}
      
      Create search queries that use filetype: and site: filters. Each query should target one specific site or filetype.
      
      Generate queries like:
      - filetype:pdf "job title" guide tutorial
      - site:dev.to "job title" tutorial
      - site:youtube.com "skill name" tutorial
      - site:coursera.org "job title" course
      - filetype:video "job title" tutorial
      
      For each skill, also generate:
      - site:dev.to "skill name" tutorial
      - site:youtube.com "skill name" tutorial
      
      Return as JSON array with format:
      [
        {{"skill": "General", "type": "pdf", "query": "filetype:pdf \\"job title\\" guide"}},
        {{"skill": "General", "type": "blog", "query": "site:dev.to \\"job title\\" tutorial", "targetSite": "dev.to"}},
        {{"skill": "skill name", "type": "video", "query": "site:youtube.com \\"skill name\\" tutorial", "targetSite": "youtube.com"}}
      ]
    `);

    this.queryChain = RunnableSequence.from([
      queryPrompt,
      this.llm,
    ]);
  }

  async analyzeJobSkills(jobTitle: string): Promise<JobSkillsResult> {
    try {
      // Extract skills using AI
      const skillsResponse = await this.skillsChain.invoke({ jobTitle });
      const skillsText = skillsResponse.content.toString();
      const skills = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);

      // Generate optimized queries using AI
      const queryResponse = await this.queryChain.invoke({ 
        jobTitle, 
        skills: skills.join(', ') 
      });
      
      let queries: SearchQuery[] = [];
      try {
        // Parse the JSON response from AI
        const queryText = queryResponse.content.toString();
        // Extract JSON from the response (handle markdown formatting)
        const jsonMatch = queryText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          queries = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to basic queries if parsing fails
          queries = this.generateFallbackQueries(jobTitle, skills);
        }
      } catch (parseError) {
        console.error('Error parsing AI query response:', parseError);
        queries = this.generateFallbackQueries(jobTitle, skills);
      }

      return {
        jobTitle,
        skills,
        queries,
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback to basic implementation
      return this.fallbackAnalysis(jobTitle);
    }
  }

  private generateFallbackQueries(jobTitle: string, skills: string[]): SearchQuery[] {
    const queries: SearchQuery[] = [];
    
    // Job-focused queries
    queries.push({
      skill: 'General',
      type: 'pdf',
      query: `filetype:pdf "${jobTitle}" guide tutorial`,
    });

    queries.push({
      skill: 'General',
      type: 'video',
      query: `site:youtube.com "${jobTitle}" tutorial`,
      targetSite: 'youtube.com',
    });

    queries.push({
      skill: 'General',
      type: 'blog',
      query: `site:dev.to "${jobTitle}" tutorial`,
      targetSite: 'dev.to',
    });

    // Skill-specific queries
    skills.forEach(skill => {
      queries.push({
        skill,
        type: 'blog',
        query: `site:dev.to "${skill}" tutorial`,
        targetSite: 'dev.to',
      });

      queries.push({
        skill,
        type: 'video',
        query: `site:youtube.com "${skill}" tutorial`,
        targetSite: 'youtube.com',
      });
    });

    return queries;
  }

  private fallbackAnalysis(jobTitle: string): JobSkillsResult {
    const skills = this.extractSkillsFromJobTitle(jobTitle);
    const queries = this.generateFallbackQueries(jobTitle, skills);
    
    return {
      jobTitle,
      skills,
      queries,
    };
  }

  private extractSkillsFromJobTitle(jobTitle: string): string[] {
    const skillMap: { [key: string]: string[] } = {
      'data scientist': ['Python', 'SQL', 'Machine Learning', 'Data Analysis', 'Statistics'],
      'data analyst': ['SQL', 'Excel', 'Data Analysis', 'Python', 'Tableau'],
      'web developer': ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js'],
      'python developer': ['Python', 'Django', 'Flask', 'SQL', 'Git'],
      'machine learning engineer': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch'],
      'devops engineer': ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD'],
      'frontend developer': ['JavaScript', 'React', 'Vue.js', 'HTML', 'CSS'],
      'backend developer': ['Node.js', 'Python', 'Java', 'SQL', 'API Development'],
    };

    const lowerJobTitle = jobTitle.toLowerCase();
    
    for (const [job, skills] of Object.entries(skillMap)) {
      if (lowerJobTitle.includes(job)) {
        return skills;
      }
    }

    return ['Programming', 'Problem Solving', 'Communication'];
  }
} 