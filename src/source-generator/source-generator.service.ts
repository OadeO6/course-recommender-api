import { Injectable } from '@nestjs/common';
import { CourseResult, CourseScraperService, SearchQuery } from './course-scraper.service';
import { DataFromApiService } from './data-from-api.service';

@Injectable()
export class SourceGeneratorService {
  constructor(
    private readonly dataFromScrapeService: CourseScraperService,
    private readonly dataFromApiService: DataFromApiService,
  ){}
  async fetchCourses(queries: SearchQuery[]): Promise<CourseResult[]>{
    console.log('reeeeeeeeel00000000000000000000000')
    const [res1, res2] = await Promise.all([
      this.dataFromApiService.getACoursesFromApi(queries),
      this.dataFromScrapeService.scrapeCourses(queries)
    ]);
    console.log(res1, '-000000000000000000res2', res2);
    return [...res1, ...res2];
  }
}
