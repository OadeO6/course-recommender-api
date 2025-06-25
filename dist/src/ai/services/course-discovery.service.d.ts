import { AIBaseService } from './ai-base.service';
export declare class CourseGenerationService {
    private readonly aiBaseService;
    private readonly logger;
    private readonly outputSchema;
    constructor(aiBaseService: AIBaseService);
    generateCoursesForJob(jobTitle: string): Promise<{
        data: {
            title: string;
            courses: {
                title: string;
                url: string;
                type: "Video" | "Course" | "Blog" | "Doc";
                snippet: string;
            }[];
            description: string;
        }[];
        badTittle: boolean;
        successful: boolean;
    }>;
}
