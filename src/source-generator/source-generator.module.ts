import { Module } from '@nestjs/common';
import { SourceGeneratorService } from './source-generator.service';
import { DataFromScrapeService } from './data-from-scrape.service';
import { DataFromApiService } from './data-from-api.service';
import { CourseScraperService } from './course-scraper.service';
import { SourceGeneratorController } from './source-generator.controller';

@Module({
  controllers: [SourceGeneratorController],
  providers: [SourceGeneratorService, DataFromScrapeService, DataFromApiService, CourseScraperService],
  exports: [SourceGeneratorService, DataFromScrapeService, DataFromApiService, CourseScraperService],
})
export class SourceGeneratorModule {}
