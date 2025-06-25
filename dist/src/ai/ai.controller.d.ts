import { JobSkillsAnalyzerService } from './services/job-skills-analyzer.service';
export declare class AiController {
    private readonly jobSkillsAnalyzerService;
    constructor(jobSkillsAnalyzerService: JobSkillsAnalyzerService);
    analyzeJob(jobTitle: string): Promise<import("./services/job-skills-analyzer.service").JobSkillsResult>;
}
