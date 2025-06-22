import { CourseScraperService } from './course-scraper.service';
import { TestScraperDto } from './dto/test-scraper.dto';
export declare class SourceGeneratorController {
    private readonly courseScraper;
    constructor(courseScraper: CourseScraperService);
    testScraper(body: TestScraperDto): Promise<{
        query: string;
        platform: "pdf" | "doc" | "blog" | "video" | "course";
        skill: string;
        results: import("./course-scraper.service").CourseResult[];
        totalResults: number;
    }>;
}
