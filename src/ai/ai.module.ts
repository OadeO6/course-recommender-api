import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { JobSkillsAnalyzerService } from './services/job-skills-analyzer.service';
import { LangchainService } from './langchain.service';
import { AIBaseService } from './services/ai-base.service';
import { CourseGenerationService } from './services/course-discovery.service';

@Module({
  controllers: [AiController],
  providers: [JobSkillsAnalyzerService, LangchainService, AIBaseService, CourseGenerationService],
  exports: [JobSkillsAnalyzerService, LangchainService, AIBaseService, CourseGenerationService],
})
export class AiModule {}
