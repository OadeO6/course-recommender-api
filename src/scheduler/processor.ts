import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { RecommendationService } from 'src/recommendation/recommendation.service';
import { CustomLoggerService } from '../common/custom-logger.service';

@Processor('background-jobs')
export class SchedulerProcessor {
  private readonly logger = new CustomLoggerService(SchedulerProcessor.name);

  constructor(private readonly recommendationService: RecommendationService) {}

  @Process('generateCourse')
  async seedWithCourses(job: Job) {
    this.logger.info(`Processing job data: ${JSON.stringify(job.data, null, 2)}`);
    this.logger.info(`Job titles: ${JSON.stringify(job.data.jobTitles, null, 2)}`);

    await this.recommendationService.seedVectorStore(job.data.jobTitles);
    this.logger.info(`Completed processing job data: ${JSON.stringify(job.data, null, 2)}`);
  }

  @Process('generateTrendingCourse')
  async seedWithTrendingCourses() {
    await this.recommendationService.seedVectorStoreTrending();
  }
}
