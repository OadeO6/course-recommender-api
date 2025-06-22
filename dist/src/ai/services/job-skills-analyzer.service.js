"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSkillsAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const google_genai_1 = require("@langchain/google-genai");
const prompts_1 = require("@langchain/core/prompts");
const runnables_1 = require("@langchain/core/runnables");
let JobSkillsAnalyzerService = class JobSkillsAnalyzerService {
    llm;
    skillsChain;
    queryChain;
    constructor() {
        this.llm = new google_genai_1.ChatGoogleGenerativeAI({
            model: 'gemini-pro',
            temperature: 0.1,
            apiKey: process.env.GOOGLE_API_KEY,
        });
        this.initializeChains();
    }
    initializeChains() {
        const skillsPrompt = prompts_1.PromptTemplate.fromTemplate(`
      Analyze the job title: "{jobTitle}"
      
      Extract 5-8 key technical skills required for this role.
      Return only the skill names, separated by commas.
      
      Example: "Python, SQL, Machine Learning, Data Visualization"
    `);
        this.skillsChain = runnables_1.RunnableSequence.from([
            skillsPrompt,
            this.llm,
        ]);
        const queryPrompt = prompts_1.PromptTemplate.fromTemplate(`
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
        this.queryChain = runnables_1.RunnableSequence.from([
            queryPrompt,
            this.llm,
        ]);
    }
    async analyzeJobSkills(jobTitle) {
        try {
            const skillsResponse = await this.skillsChain.invoke({ jobTitle });
            const skillsText = skillsResponse.content.toString();
            const skills = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
            const queryResponse = await this.queryChain.invoke({
                jobTitle,
                skills: skills.join(', ')
            });
            let queries = [];
            try {
                const queryText = queryResponse.content.toString();
                const jsonMatch = queryText.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    queries = JSON.parse(jsonMatch[0]);
                }
                else {
                    queries = this.generateFallbackQueries(jobTitle, skills);
                }
            }
            catch (parseError) {
                console.error('Error parsing AI query response:', parseError);
                queries = this.generateFallbackQueries(jobTitle, skills);
            }
            return {
                jobTitle,
                skills,
                queries,
            };
        }
        catch (error) {
            console.error('AI analysis failed:', error);
            return this.fallbackAnalysis(jobTitle);
        }
    }
    generateFallbackQueries(jobTitle, skills) {
        const queries = [];
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
    fallbackAnalysis(jobTitle) {
        const skills = this.extractSkillsFromJobTitle(jobTitle);
        const queries = this.generateFallbackQueries(jobTitle, skills);
        return {
            jobTitle,
            skills,
            queries,
        };
    }
    extractSkillsFromJobTitle(jobTitle) {
        const skillMap = {
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
};
exports.JobSkillsAnalyzerService = JobSkillsAnalyzerService;
exports.JobSkillsAnalyzerService = JobSkillsAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JobSkillsAnalyzerService);
//# sourceMappingURL=job-skills-analyzer.service.js.map