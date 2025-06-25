import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { RecommendationService } from 'src/recommendation/recommendation.service';

@Processor('background-jobs')
export class SchedulerProcessor {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Process('generateCourse')
  async seedWithCourses(job: Job) {
    console.log(job.data, 'data');
    console.log(job.data.jobTitles, 'job');

    await this.recommendationService.seedVectorStore(job.data.jobTitles);
    console.log(job.data, 'data2');
  }

  @Process('generateTrendingCourse')
  async seedWithTrendingCourses() {
    await this.recommendationService.seedVectorStoreTrending();
  }
}
