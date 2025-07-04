import { Injectable } from '@nestjs/common';
import { AIBaseService } from './ai-base.service';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { CustomLoggerService } from '../../common/custom-logger.service';

export interface JobSkillsResult {
  jobTitle: string;
  skills: string[];
  queries: SearchQuery[];
}

export interface SearchQuery {
  skills: string[];
  type: 'pdf' | 'doc' | 'blog' | 'video' | 'course';
  query: string;
  targetSite?: string;
}

@Injectable()
export class JobSkillsAnalyzerService {
  private readonly logger = new CustomLoggerService(JobSkillsAnalyzerService.name);
  private skillsChain: RunnableSequence;
  private queryChain: RunnableSequence;
  llm: any;

  // Define schemas as class properties to avoid duplication
  private skillsSchema = z.object({
    results: z.array(z.object({
      jobTitle: z.string(),
      skills: z.array(z.string())
    }))
  });

  private querySchema = z.object({
    results: z.array(z.object({
      jobTitle: z.string(),
      queries: z.array(z.object({
        skills: z.array(z.string()),
        type: z.enum(['pdf', 'doc', 'blog', 'video', 'course']),
        query: z.string(),
        targetSite: z.string().optional()
      }))
    }))
  });

  constructor(private aiBaseService: AIBaseService) {
    this.initializeChains();
    this.llm = this.aiBaseService.getLLM();
  }

  private initializeChains() {
    const llm = this.aiBaseService.getLLM();

    // Create structured output parsers using class properties
    const skillsParser = StructuredOutputParser.fromZodSchema(this.skillsSchema);
    const queryParser = StructuredOutputParser.fromZodSchema(this.querySchema);

    // Skills extraction chain with structured output
    const skillsPrompt = PromptTemplate.fromTemplate(`
      Analyze the job title: "{jobTitle}"
      Extract 5-8 key technical skills required for this role.
      {format_instructions}
    `);

    this.skillsChain = RunnableSequence.from([
      skillsPrompt,
      llm,
      skillsParser,
    ]);

    // Query generation chain with structured output
    // TODO: Work on the prompt to generate a more creative response.
    const queryPrompt = PromptTemplate.fromTemplate(`
      As an expert SEO and web scraper, generate optimized search queries for the job title: {jobTitle} and skills: {skills}
      Create search queries using filetype: and site: filters. Each query should target one specific site or filetype.
      Generate multiple queries like (but not limited to) these examples:
      - filetype:pdf "{jobTitle}" guide tutorial
      - site:dev.to "{jobTitle}" tutorial
      - site:youtube.com {skills} tutorial
      - site:coursera.org "{skills}" tutorial
      - site:coursera.org "{jobTitle}" course
      - filetype:video [clouse like  advance guid to] {jobTitle} tutorial
      Use your expertise to choose the best sites based on the job. For example:
      - For a Python job: realpython.com
      - For a data science job: towardsdatascience.com
      {format_instructions}
    `);

    this.queryChain = RunnableSequence.from([
      queryPrompt,
      llm,
      queryParser,
    ]);
  }

  async analyzeJobSkills(jobTitle: string): Promise<JobSkillsResult> {
    try {
      // Extract skills using structured output
      this.logger.info(`Analyzing job skills for: ${jobTitle}`);
      const skillsResult = await this.skillsChain.invoke({
        jobTitle,
        format_instructions: StructuredOutputParser.fromZodSchema(this.skillsSchema).getFormatInstructions()
      });

      // Add safety check for empty results
      if (!skillsResult.results || skillsResult.results.length === 0) {
        throw new Error('No skills extracted from AI response');
      }

      const skills = skillsResult.results[0].skills;
      this.logger.debug(`Extracted skills: ${JSON.stringify(skills, null, 2)}`);

      // Generate optimized queries using structured output
      const queryResult = await this.queryChain.invoke({
        jobTitle,
        skills: skills.join(', '), // This is fine as a comma-separated string
        format_instructions: StructuredOutputParser.fromZodSchema(this.querySchema).getFormatInstructions()
      });

      // Add safety check for empty query results
      if (!queryResult.results || queryResult.results.length === 0) {
        throw new Error('No queries generated from AI response');
      }

      const queries = queryResult.results[0].queries;
      this.logger.debug(`Generated queries: ${JSON.stringify(queries, null, 2)}`);

      return {
        jobTitle,
        skills,
        queries,
      };
    } catch (error) {
      this.logger.error(`AI analysis failed: ${error.message}`, error.stack);
      // Fallback to basic implementation
      return this.fallbackAnalysis(jobTitle);
    }
  }

  /**
   * Generate and analyze top 20 recent/common job titles in a single ML request
   * @returns Promise<JobSkillsResult[]> Array of job analysis results for trending jobs
   */
  async analyzeTrendingJobSkills(): Promise<JobSkillsResult[]> {
    try {
      this.logger.info('Generating trending job titles and analyzing skills in single request...');

      // Create comprehensive schema for everything in one request
      const trendingJobsSchema = z.object({
        results: z.array(z.object({
          jobTitle: z.string(),
          skills: z.array(z.string()),
          queries: z.array(z.object({
            skills: z.array(z.string()),
            type: z.enum(['pdf', 'doc', 'blog', 'video', 'course']),
            query: z.string(),
            targetSite: z.string().optional()
          }))
        })).min(15).max(25)
      });

      const trendingJobsParser = StructuredOutputParser.fromZodSchema(trendingJobsSchema);

      // Single comprehensive prompt that does everything
      const comprehensiveTrendingPrompt = PromptTemplate.fromTemplate(`
        As an expert in the current job market, technology trends, and SEO, perform a complete analysis:

        1. FIRST: Generate 20 of the most in-demand, trending, and well-paying job titles for 2024-2025.

        Focus on:
        - Technology and software development roles
        - Data science and AI/ML positions
        - Digital marketing and growth roles
        - Product and project management
        - Emerging fields like blockchain, cybersecurity, cloud computing
        - Remote-first and freelance-friendly positions

        Include a mix of entry to senior level positions.

        2. THEN: For EACH job title you generated:
        - Extract 6-9 key technical skills required for that role
        - Create optimized search queries using filetype: and site: filters

        Generate multiple query types for each job:
        - filetype:pdf [jobTitle] guide tutorial
        - site:dev.to "[jobTitle]" tutorial
        - site:youtube.com "[skills]" tutorial
        - site:coursera.org [skills] course
        - site:github.com "[skills]" projects
        - filetype:video [clouse like  advance guide to] [jobTitle] tutorial

        Try to ballance between resources like (blog, pdf, vedio) and  sites that offer standard course like udemy.com among others

        Use your expertise to choose the best sites based on each job type:
        - For Python jobs: realpython.com, python.org
        - For data science: towardsdatascience.com, kaggle.com
        - For web dev: developer.mozilla.org, css-tricks.com
        - For DevOps: kubernetes.io, docker.com

        {format_instructions}
      `);

      // Single chain that does everything
      const comprehensiveChain = RunnableSequence.from([
        comprehensiveTrendingPrompt,
        this.llm,
        trendingJobsParser
      ]);

      const result = await comprehensiveChain.invoke({
        format_instructions: trendingJobsParser.getFormatInstructions()
      });

      this.logger.info(`Single-request analysis completed for ${result.results.length} trending jobs`);

      // Transform to match our interface
      const jobSkillsResults: JobSkillsResult[] = result.results.map(item => ({
        jobTitle: item.jobTitle,
        skills: item.skills,
        queries: item.queries
      }));

      return jobSkillsResults;

    } catch (error) {
      this.logger.error(`Single-request trending jobs analysis failed: ${error.message}`, error.stack);
      // Fallback to predefined trending job titles with existing analysis
      const fallbackTrendingJobs = this.getFallbackTrendingJobs();
      this.logger.debug(`Using fallback trending jobs with bulk analysis: ${JSON.stringify(fallbackTrendingJobs, null, 2)}`);
      return await this.analyzeMultipleJobSkills(fallbackTrendingJobs);
    }
  }

  /**
   * Get fallback list of trending job titles when AI generation fails
   * @returns string[] Array of trending job titles
   */
  private getFallbackTrendingJobs(): string[] {
    return [
      'AI Engineer',
      'Data Scientist',
      'Full Stack Developer',
      'DevOps Engineer',
      'Product Manager',
      'UX/UI Designer',
      'Cloud Solutions Architect',
      'Cybersecurity Analyst',
      'Machine Learning Engineer',
      'Software Engineer',
      'Digital Marketing Manager',
      'Blockchain Developer',
      'React Developer',
      'Python Developer',
      'Data Analyst',
      'Scrum Master',
      'Site Reliability Engineer',
      'Mobile App Developer',
      'Growth Hacker',
      'Technical Product Manager'
    ];
  }

  /**
   * Analyze multiple job titles in a single AI request using structured output
   * @param jobTitles Array of job titles to analyze
   * @returns Promise<JobSkillsResult[]> Array of job analysis results
   */
  async analyzeMultipleJobSkills(jobTitles: string[]): Promise<JobSkillsResult[]> {
    try {
      this.logger.info(`Starting bulk analysis for ${jobTitles.length} job titles in single request`);

      // Use the same schemas as class properties for consistency
      const bulkSkillsParser = StructuredOutputParser.fromZodSchema(this.skillsSchema);
      const bulkQueryParser = StructuredOutputParser.fromZodSchema(this.querySchema);

      // Create bulk skills extraction prompt
      const bulkSkillsPrompt = PromptTemplate.fromTemplate(`
        Analyze the following job titles and extract 5-8 key technical skills required for each role.
        Job titles: {jobTitles}

        {format_instructions}
      `);

      // Fixed: Create bulk query generation prompt with correct parameters
      const bulkQueryPrompt = PromptTemplate.fromTemplate(`
        As an expert SEO and web scraper, generate optimized search queries for multiple job titles and their skills.
        Job data: {jobData}

        For each job title, create search queries using filetype: and site: filters. Each query should target one specific site or filetype.
        Generate multiple queries like (but not limited to) these format:
        - filetype:pdf "[jobTitle]" guide tutorial
        - site:dev.to [jobTitle] tutorial
        - site:dev.to "[jobTitle]" tutorial
        - site:youtube.com "[skills]" tutorial
        - site:coursera.org "[skills]" tutorial
        - site:coursera.org [skills] tutorial
        - site:coursera.org "[jobTitle]" course
        - filetype:video [clouse like  advance guide to] [jobTitle] tutorial

        Try to ballance between resources like (blog, pdf, vedio) and  sites that offer standard course like udemy.com among others

        Use your expertise to choose the best sites based on the job. For example:
        - For Python jobs: realpython.com
        - For data science jobs: towardsdatascience.com

        {format_instructions}
      `);

      // Extract skills for all job titles in one request
      const skillsChain = RunnableSequence.from([
        bulkSkillsPrompt,
        this.llm,
        bulkSkillsParser // Removed OutputFixingParser
      ]);

      const skillsResult = await skillsChain.invoke({
        jobTitles: jobTitles.join(', '),
        format_instructions: bulkSkillsParser.getFormatInstructions()
      });

      this.logger.debug(`Bulk skills extraction completed: ${skillsResult.results?.length || 0} results`);

      // Add safety check
      if (!skillsResult.results || skillsResult.results.length === 0) {
        throw new Error('No skills extracted from bulk AI response');
      }

      // Generate queries for all jobs in one request
      const queryChain = RunnableSequence.from([
        bulkQueryPrompt,
        this.llm,
        bulkQueryParser// Removed OutputFixingParser
      ]);

      // Fixed: Now using jobData parameter that matches the template
      const queryResult = await queryChain.invoke({
        jobData: JSON.stringify(skillsResult.results, null, 2),
        format_instructions: bulkQueryParser.getFormatInstructions()
      });

      this.logger.debug(`Bulk query generation completed: ${queryResult.results?.length || 0} results`);

      // Add safety check
      if (!queryResult.results) {
        queryResult.results = [];
      }

      // Combine skills and queries data
      const results: JobSkillsResult[] = skillsResult.results.map(skillItem => {
        const queryItem = queryResult.results.find(q => q.jobTitle === skillItem.jobTitle);
        return {
          jobTitle: skillItem.jobTitle,
          skills: skillItem.skills,
          queries: queryItem?.queries || this.generateFallbackQueries(skillItem.jobTitle, skillItem.skills)
        };
      });

      this.logger.info(`Bulk analysis completed successfully for ${results.length} job titles`);
      this.logger.debug(`results: ${JSON.stringify(results, null, 2)}`)
      return results;
    } catch (error) {
      this.logger.error(`Bulk AI analysis failed: ${error.message}`, error.stack);
      // Complete fallback: analyze each job title individually using fallback methods
      return jobTitles.map(jobTitle => this.fallbackAnalysis(jobTitle));
    }
  }

  private generateFallbackQueries(jobTitle: string, skills: string[]): SearchQuery[] {
    const queries: SearchQuery[] = [];

    // Job-focused queries
    queries.push({
      skills: ['General'],
      type: 'pdf',
      query: `filetype:pdf "${jobTitle}" guide tutorial`,
    });

    queries.push({
      skills: ['General'],
      type: 'video',
      query: `site:youtube.com "${jobTitle}" tutorial`,
      targetSite: 'youtube.com',
    });

    queries.push({
      skills: ['General'],
      type: 'blog',
      query: `site:dev.to "${jobTitle}" tutorial`,
      targetSite: 'dev.to',
    });

    // Skill-specific queries
    skills.forEach(skill => {
      queries.push({
        skills,
        type: 'blog',
        query: `site:dev.to "${skill}" tutorial`,
        targetSite: 'dev.to',
      });

      queries.push({
        skills,
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
