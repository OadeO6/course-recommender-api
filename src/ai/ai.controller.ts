import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobSkillsAnalyzerService } from './services/job-skills-analyzer.service';

@ApiTags('AI Services')
@Controller('ai')
export class AiController {
  constructor(private readonly jobSkillsAnalyzerService: JobSkillsAnalyzerService) {}

  @Get('analyze-job/:jobTitle')
  @ApiOperation({ summary: 'Analyze job skills and generate search queries' })
  @ApiResponse({ status: 200, description: 'Job analysis completed (debug)' })
  async analyzeJob(@Param('jobTitle') jobTitle: string) {
    return this.jobSkillsAnalyzerService.analyzeMultipleJobSkills([jobTitle]);
  }
}
