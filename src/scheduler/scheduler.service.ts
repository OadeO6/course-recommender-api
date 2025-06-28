import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { CustomLoggerService } from '../common/custom-logger.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new CustomLoggerService(SchedulerService.name);

  constructor(@InjectQueue('background-jobs') private queue: Queue) {}

  private async isDuplicateJob(jobName: string, jobData: any): Promise<boolean> {
    // Get waiting and active jobs
    const [waitingJobs, activeJobs] = await Promise.all([
      this.queue.getWaiting(),
      this.queue.getActive()
    ]);

    const allJobs = [...waitingJobs, ...activeJobs];

    // Check if a job with same name and data already exists
    const duplicateJob = allJobs.find(job => {
      return job.name === jobName &&
             JSON.stringify(job.data) === JSON.stringify(jobData);
    });

    return !!duplicateJob;
  }

  async courseSeed(jobTitles: string[]) {
    this.logger.info("Checking for duplicate course seed job...");

    const jobData = { jobTitles };
    const isDuplicate = await this.isDuplicateJob('generateCourse', jobData);

    if (isDuplicate) {
      this.logger.warn('Duplicate course seed job detected. Skipping...');
      return { skipped: true, reason: 'Duplicate job already exists' };
    }

    this.logger.info("Adding course seed job to queue...");
    const job = await this.queue.add('generateCourse', jobData);
    this.logger.info(`Course seed job added with ID: ${job.id}`);

    return { jobId: job.id, skipped: false };
  }

  async trendingCourseSeed() {
    this.logger.info("Checking for duplicate trending course job...");

    const jobData = {}; // No data for trending course job
    const isDuplicate = await this.isDuplicateJob('generateTrendingCourse', jobData);

    if (isDuplicate) {
      this.logger.warn('Duplicate trending course job detected. Skipping...');
      return { skipped: true, reason: 'Duplicate job already exists' };
    }

    this.logger.info("Adding trending course job to queue...");
    const job = await this.queue.add('generateTrendingCourse', jobData);
    this.logger.info(`Trending course job added with ID: ${job.id}`);

    return { jobId: job.id, skipped: false };
  }
}
