import { forwardRef, Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { AiModule } from '../ai/ai.module';
import { SourceGeneratorModule } from '../source-generator/source-generator.module';
import { SchedulerModule } from 'src/scheduler/scheduler.module';

@Module({
  imports: [
    AiModule,
    SourceGeneratorModule,
    forwardRef(() =>SchedulerModule)
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
