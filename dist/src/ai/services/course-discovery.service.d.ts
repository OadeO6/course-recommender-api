import { JobSkillsAnalyzerService } from './job-skills-analyzer.service';
import { CourseScraperService, CourseResult } from '../../source-generator/course-scraper.service';
export interface CourseDiscoveryResult {
    jobTitle: string;
    skills: string[];
    courses: string[];
    totalCourses: number;
}
export declare class CourseDiscoveryService {
    private jobSkillsAnalyzer;
    private courseScraper;
    private embeddings;
    private vectorStore;
    constructor(jobSkillsAnalyzer: JobSkillsAnalyzerService, courseScraper: CourseScraperService);
    discoverCourses(jobTitle: string): Promise<CourseDiscoveryResult>;
    searchSimilarCourses(query: string, limit?: number): Promise<CourseResult[]>;
    private buildCourseSummary;
}
