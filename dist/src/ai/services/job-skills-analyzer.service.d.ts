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
    private llm;
    private skillsChain;
    private queryChain;
    constructor();
    private initializeChains;
    analyzeJobSkills(jobTitle: string): Promise<JobSkillsResult>;
    private generateFallbackQueries;
    private fallbackAnalysis;
    private extractSkillsFromJobTitle;
}
