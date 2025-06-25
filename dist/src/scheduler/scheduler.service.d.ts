import { Queue } from 'bull';
export declare class SchedulerService {
    private queue;
    private readonly logger;
    constructor(queue: Queue);
    private isDuplicateJob;
    courseSeed(jobTitles: string[]): Promise<{
        skipped: boolean;
        reason: string;
        jobId?: undefined;
    } | {
        jobId: import("bull").JobId;
        skipped: boolean;
        reason?: undefined;
    }>;
    trendingCourseSeed(): Promise<{
        skipped: boolean;
        reason: string;
        jobId?: undefined;
    } | {
        jobId: import("bull").JobId;
        skipped: boolean;
        reason?: undefined;
    }>;
}
