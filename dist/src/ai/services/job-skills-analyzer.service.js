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
const ai_base_service_1 = require("./ai-base.service");
const prompts_1 = require("@langchain/core/prompts");
const runnables_1 = require("@langchain/core/runnables");
const zod_1 = require("zod");
const output_parsers_1 = require("@langchain/core/output_parsers");
let JobSkillsAnalyzerService = class JobSkillsAnalyzerService {
    aiBaseService;
    skillsChain;
    queryChain;
    llm;
    skillsSchema = zod_1.z.object({
        results: zod_1.z.array(zod_1.z.object({
            jobTitle: zod_1.z.string(),
            skills: zod_1.z.array(zod_1.z.string())
        }))
    });
    querySchema = zod_1.z.object({
        results: zod_1.z.array(zod_1.z.object({
            jobTitle: zod_1.z.string(),
            queries: zod_1.z.array(zod_1.z.object({
                skill: zod_1.z.string(),
                type: zod_1.z.enum(['pdf', 'doc', 'blog', 'video', 'course']),
                query: zod_1.z.string(),
                targetSite: zod_1.z.string().optional()
            }))
        }))
    });
    constructor(aiBaseService) {
        this.aiBaseService = aiBaseService;
        this.initializeChains();
        this.llm = this.aiBaseService.getLLM();
    }
    initializeChains() {
        const llm = this.aiBaseService.getLLM();
        const skillsParser = output_parsers_1.StructuredOutputParser.fromZodSchema(this.skillsSchema);
        const queryParser = output_parsers_1.StructuredOutputParser.fromZodSchema(this.querySchema);
        const skillsPrompt = prompts_1.PromptTemplate.fromTemplate(`
      Analyze the job title: "{jobTitle}"
      Extract 5-8 key technical skills required for this role.
      {format_instructions}
    `);
        this.skillsChain = runnables_1.RunnableSequence.from([
            skillsPrompt,
            llm,
            skillsParser,
        ]);
        const queryPrompt = prompts_1.PromptTemplate.fromTemplate(`
      As an expert SEO and web scraper, generate optimized search queries for the job title: {jobTitle} and skills: {skills}
      Create search queries using filetype: and site: filters. Each query should target one specific site or filetype.
      Generate multiple queries like (but not limited to) these examples:
      - filetype:pdf "{jobTitle}" guide tutorial
      - site:dev.to "{jobTitle}" tutorial
      - site:youtube.com "{skills}" tutorial
      - site:coursera.org "{skills}" tutorial
      - site:coursera.org "{jobTitle}" course
      - filetype:video "{jobTitle}" tutorial
      Use your expertise to choose the best sites based on the job. For example:
      - For a Python job: realpython.com
      - For a data science job: towardsdatascience.com
      {format_instructions}
    `);
        this.queryChain = runnables_1.RunnableSequence.from([
            queryPrompt,
            llm,
            queryParser,
        ]);
    }
    async analyzeJobSkills(jobTitle) {
        try {
            console.log('Analyzing job skills for:', jobTitle);
            const skillsResult = await this.skillsChain.invoke({
                jobTitle,
                format_instructions: output_parsers_1.StructuredOutputParser.fromZodSchema(this.skillsSchema).getFormatInstructions()
            });
            if (!skillsResult.results || skillsResult.results.length === 0) {
                throw new Error('No skills extracted from AI response');
            }
            const skills = skillsResult.results[0].skills;
            console.log('Extracted skills:', skills);
            const queryResult = await this.queryChain.invoke({
                jobTitle,
                skills: skills.join(', '),
                format_instructions: output_parsers_1.StructuredOutputParser.fromZodSchema(this.querySchema).getFormatInstructions()
            });
            if (!queryResult.results || queryResult.results.length === 0) {
                throw new Error('No queries generated from AI response');
            }
            const queries = queryResult.results[0].queries;
            console.log('Generated queries:', queries);
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
    async analyzeTrendingJobSkills() {
        try {
            console.log('Generating trending job titles and analyzing skills in single request...');
            const trendingJobsSchema = zod_1.z.object({
                results: zod_1.z.array(zod_1.z.object({
                    jobTitle: zod_1.z.string(),
                    skills: zod_1.z.array(zod_1.z.string()),
                    queries: zod_1.z.array(zod_1.z.object({
                        skill: zod_1.z.string(),
                        type: zod_1.z.enum(['pdf', 'doc', 'blog', 'video', 'course']),
                        query: zod_1.z.string(),
                        targetSite: zod_1.z.string().optional()
                    }))
                })).min(15).max(25)
            });
            const trendingJobsParser = output_parsers_1.StructuredOutputParser.fromZodSchema(trendingJobsSchema);
            const comprehensiveTrendingPrompt = prompts_1.PromptTemplate.fromTemplate(`
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
        - Extract 5-8 key technical skills required for that role
        - Create optimized search queries using filetype: and site: filters

        Generate multiple query types for each job:
        - filetype:pdf "[jobTitle]" guide tutorial
        - site:dev.to "[jobTitle]" tutorial
        - site:youtube.com "[skills]" tutorial
        - site:coursera.org "[skills]" course
        - site:github.com "[skills]" projects

        Use your expertise to choose the best sites based on each job type:
        - For Python jobs: realpython.com, python.org
        - For data science: towardsdatascience.com, kaggle.com
        - For web dev: developer.mozilla.org, css-tricks.com
        - For DevOps: kubernetes.io, docker.com

        {format_instructions}
      `);
            const comprehensiveChain = runnables_1.RunnableSequence.from([
                comprehensiveTrendingPrompt,
                this.llm,
                trendingJobsParser
            ]);
            const result = await comprehensiveChain.invoke({
                format_instructions: trendingJobsParser.getFormatInstructions()
            });
            console.log(`Single-request analysis completed for ${result.results.length} trending jobs`);
            const jobSkillsResults = result.results.map(item => ({
                jobTitle: item.jobTitle,
                skills: item.skills,
                queries: item.queries
            }));
            return jobSkillsResults;
        }
        catch (error) {
            console.error('Single-request trending jobs analysis failed:', error);
            const fallbackTrendingJobs = this.getFallbackTrendingJobs();
            console.log('Using fallback trending jobs with bulk analysis:', fallbackTrendingJobs);
            return await this.analyzeMultipleJobSkills(fallbackTrendingJobs);
        }
    }
    getFallbackTrendingJobs() {
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
    async analyzeMultipleJobSkills(jobTitles) {
        try {
            console.log(`Starting bulk analysis for ${jobTitles.length} job titles in single request`);
            const bulkSkillsParser = output_parsers_1.StructuredOutputParser.fromZodSchema(this.skillsSchema);
            const bulkQueryParser = output_parsers_1.StructuredOutputParser.fromZodSchema(this.querySchema);
            const bulkSkillsPrompt = prompts_1.PromptTemplate.fromTemplate(`
        Analyze the following job titles and extract 5-8 key technical skills required for each role.
        Job titles: {jobTitles}

        {format_instructions}
      `);
            const bulkQueryPrompt = prompts_1.PromptTemplate.fromTemplate(`
        As an expert SEO and web scraper, generate optimized search queries for multiple job titles and their skills.
        Job data: {jobData}

        For each job title, create search queries using filetype: and site: filters. Each query should target one specific site or filetype.
        Generate multiple queries like (but not limited to) these examples:
        - filetype:pdf "[jobTitle]" guide tutorial
        - site:dev.to "[jobTitle]" tutorial
        - site:youtube.com "[skills]" tutorial
        - site:coursera.org "[skills]" tutorial
        - site:coursera.org "[jobTitle]" course

        Use your expertise to choose the best sites based on the job. For example:
        - For Python jobs: realpython.com
        - For data science jobs: towardsdatascience.com

        {format_instructions}
      `);
            const skillsChain = runnables_1.RunnableSequence.from([
                bulkSkillsPrompt,
                this.llm,
                bulkSkillsParser
            ]);
            const skillsResult = await skillsChain.invoke({
                jobTitles: jobTitles.join(', '),
                format_instructions: bulkSkillsParser.getFormatInstructions()
            });
            console.log('Bulk skills extraction completed:', skillsResult.results?.length || 0);
            if (!skillsResult.results || skillsResult.results.length === 0) {
                throw new Error('No skills extracted from bulk AI response');
            }
            const queryChain = runnables_1.RunnableSequence.from([
                bulkQueryPrompt,
                this.llm,
                bulkQueryParser
            ]);
            const queryResult = await queryChain.invoke({
                jobData: JSON.stringify(skillsResult.results, null, 2),
                format_instructions: bulkQueryParser.getFormatInstructions()
            });
            console.log('Bulk query generation completed:', queryResult.results?.length || 0);
            if (!queryResult.results) {
                queryResult.results = [];
            }
            const results = skillsResult.results.map(skillItem => {
                const queryItem = queryResult.results.find(q => q.jobTitle === skillItem.jobTitle);
                return {
                    jobTitle: skillItem.jobTitle,
                    skills: skillItem.skills,
                    queries: queryItem?.queries || this.generateFallbackQueries(skillItem.jobTitle, skillItem.skills)
                };
            });
            console.log(`Bulk analysis completed successfully for ${results.length} job titles`);
            return results;
        }
        catch (error) {
            console.error('Bulk AI analysis failed:', error);
            return jobTitles.map(jobTitle => this.fallbackAnalysis(jobTitle));
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
    __metadata("design:paramtypes", [ai_base_service_1.AIBaseService])
], JobSkillsAnalyzerService);
//# sourceMappingURL=job-skills-analyzer.service.js.map