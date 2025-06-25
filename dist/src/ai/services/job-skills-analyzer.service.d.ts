import { AIBaseService } from './ai-base.service';
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
export declare class JobSkillsAnalyzerService {
    private aiBaseService;
    private skillsChain;
    private queryChain;
    llm: any;
    private skillsSchema;
    private querySchema;
    constructor(aiBaseService: AIBaseService);
    private initializeChains;
    analyzeJobSkills(jobTitle: string): Promise<JobSkillsResult>;
    analyzeTrendingJobSkills(): Promise<JobSkillsResult[]>;
    private getFallbackTrendingJobs;
    analyzeMultipleJobSkills(jobTitles: string[]): Promise<JobSkillsResult[]>;
    private generateFallbackQueries;
    private fallbackAnalysis;
    private extractSkillsFromJobTitle;
}
