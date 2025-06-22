import { Module } from '@nestjs/common';
import { LangchainService } from './langchain.service';
import { PromptService } from './prompt.service';
import { ChainManagerService } from './chain-manager.service';
import { AiController } from './ai.controller';
import { CourseDiscoveryService } from './services/course-discovery.service';
import { JobSkillsAnalyzerService } from './services/job-skills-analyzer.service';
import { SourceGeneratorModule } from '../source-generator/source-generator.module';

@Module({
  imports: [SourceGeneratorModule],
  controllers: [AiController],
  providers: [LangchainService, PromptService, ChainManagerService, CourseDiscoveryService, JobSkillsAnalyzerService],
  exports: [LangchainService, PromptService, ChainManagerService, CourseDiscoveryService, JobSkillsAnalyzerService],
})
export class AiModule {}
