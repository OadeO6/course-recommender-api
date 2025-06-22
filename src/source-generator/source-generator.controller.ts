import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CourseScraperService } from './course-scraper.service';
import { TestScraperDto } from './dto/test-scraper.dto';

@ApiTags('source-generator')
@Controller('source-generator')
export class SourceGeneratorController {
  constructor(private readonly courseScraper: CourseScraperService) {}

  @Post('test-scraper')
  @ApiBody({ type: TestScraperDto })
  async testScraper(@Body() body: TestScraperDto) {
    const searchQuery = {
      skill: body.skill,
      type: body.platform,
      query: body.query,
    };
    
    const results = await this.courseScraper.scrapeCourses([searchQuery]);
    
    return {
      query: body.query,
      platform: body.platform,
      skill: body.skill,
      results,
      totalResults: results.length,
    };
  }
} 