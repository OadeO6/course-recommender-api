export interface CourseResult {
    title: string;
    url: string;
    snippet: string;
    dataType: string;
    skill: string;
    query: string;
    jobTitle?: string;
}
export interface SearchQuery {
    skill: string;
    type: 'pdf' | 'doc' | 'blog' | 'video' | 'course';
    query: string;
    targetSite?: string;
}
export declare class CourseScraperService {
    scrapeCourses(queries: SearchQuery[]): Promise<CourseResult[]>;
    private scrapeDuckDuckGo;
    private determineDataType;
    private cleanUrl;
    private scrapeFallback;
}
