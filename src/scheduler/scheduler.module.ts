import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { SchedulerService } from './scheduler.service';
import { RecommendationModule } from 'src/recommendation/recommendation.module';
import { SchedulerProcessor } from './processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: { host: 'redis', port: 6379 },
    }),
    BullModule.registerQueue({
      name: 'background-jobs',
    }),
    // Correct Bull Board configuration
    BullBoardModule.forFeature({
      name: 'background-jobs',
      adapter: BullAdapter, // This is correct for forFeature
    }),
    forwardRef(() => RecommendationModule),
  ],
  providers: [SchedulerService, SchedulerProcessor],
  exports: [SchedulerService],
})
export class SchedulerModule {}
