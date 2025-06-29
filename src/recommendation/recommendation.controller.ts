import { Controller, Post, Body, Get, Query, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { AIBaseService } from 'src/ai/services/ai-base.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { SeedVectorStoreDto } from './dto/seed-vector-store.dto';
import { FullProcessDto } from './dto/full-process.dto';
import { VectorStoreOnlyDto } from './dto/vector-store-only.dto';
import { CourseDiscoveryResultDto } from './dto/course-discovery-result.dto';
import { CourseRecommendationResultDto } from './dto/course-recommendation-result.dto';
import { SchedulerService } from 'src/scheduler/scheduler.service';

@ApiTags('Recommendations')
@Controller('recommendation')
export class RecommendationController {
  constructor(
    private aiBaseService: AIBaseService,
    @Inject(forwardRef(() => SchedulerService))
    private schedulerService: SchedulerService,
    private readonly recommendationService: RecommendationService
  ) {}

  @Post('seed-vector-store')
  @ApiOperation({ summary: 'Seed vector store with courses for multiple job titles' })
  @ApiBody({ type: SeedVectorStoreDto })
  @ApiResponse({ status: 200, description: 'Vector store seeded successfully', type: [CourseDiscoveryResultDto] })
  async seedVectorStore(@Body() body: SeedVectorStoreDto) {
    return this.recommendationService.seedVectorStore(body.jobTitles);
  }

  @Post('seed-vector-store-trending')
  @ApiOperation({ summary: 'Seed vector store with courses for multiple random trending job titles in the background' })
  @ApiResponse({ status: 200, description: 'Successfully scheduled a background seeding job'})
  async seedVectorStoreTrending() {
    try {
      await this.schedulerService.trendingCourseSeed();
      return {"message": 'Successfully scheduled a background seeding job'}
    } catch {
      throw new HttpException('Unexpected error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('half-process')
  @ApiOperation({ summary: 'Complete process: analyze job, scrape courses, and return scraping results`' })
  @ApiBody({ type: FullProcessDto })
  @ApiResponse({ status: 200, description: 'Half process completed successfully', type: CourseRecommendationResultDto })
  async halfProcess(@Body() body: FullProcessDto) {
    return this.recommendationService.halfProcess(body.jobTitle, body.limit || 5);
  }

  @Post('vector-store-only')
  @ApiOperation({ summary: 'Get recommendations using the vector store as RAG data sourse - returns error if no data exists' })
  @ApiBody({ type: VectorStoreOnlyDto })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved from vector store', type: CourseRecommendationResultDto })
  @ApiResponse({ status: 404, description: 'No relevant data found in vector store for this job title' })
  async vectorStoreOnly(@Body() body: VectorStoreOnlyDto) {
    const res = await this.recommendationService.vectorStoreOnly(body.jobTitle, body.limit || 5);
    if (res.badTittle) {
      throw new HttpException('Bad Job Title', HttpStatus.BAD_REQUEST);
    }
    if (!res.successful) {
      await this.schedulerService.courseSeed([body.jobTitle]);
      throw new HttpException('Pls Try again in a minute', HttpStatus.NOT_FOUND);
    }
    return res.data;
  }

  @Get('vector-store/all')
  @ApiOperation({ summary: 'Get all documents in the vector store (debug)' })
  async getAllVectorStoreDocs() {
    return this.recommendationService.getAllVectorStoreDocuments();
  }

  @Get('vector-store/similar')
  @ApiOperation({ summary: 'Get N most similar documents for a string (debug)' })
  async getNSimilarDocs(@Query('query') query: string, @Query('n') n: string) {
    const num = n ? parseInt(n, 10) : 5;
    if (!query) {
      throw new HttpException('Query string is required', HttpStatus.BAD_REQUEST);
    }
    return this.aiBaseService.getNSimilarDocuments(query, num);
  }

  @Post('test')
  @ApiOperation({ summary: 'Seed vector store with courses for multiple job titles (debug)' })
  @ApiBody({ type: SeedVectorStoreDto })
  @ApiResponse({ status: 200, description: 'Vector store seeded successfully', type: [CourseDiscoveryResultDto] })
  async testVectorStore(@Body() body: SeedVectorStoreDto) {
    return this.recommendationService.testNew(body.jobTitles);
  }
}
