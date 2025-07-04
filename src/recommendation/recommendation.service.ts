import { Injectable } from '@nestjs/common';
import {
  JobSkillsAnalyzerService,
  JobSkillsResult,
} from '../ai/services/job-skills-analyzer.service';
import {
  CourseScraperService,
  CourseResult,
} from '../source-generator/course-scraper.service';
import { Document } from '@langchain/core/documents';
import { AIBaseService } from 'src/ai/services/ai-base.service';
import { CourseGenerationService } from 'src/ai/services/course-discovery.service';
import { CustomLoggerService } from '../common/custom-logger.service';
import { DataFromApiService } from 'src/source-generator/data-from-api.service';
import { SourceGeneratorService } from 'src/source-generator/source-generator.service';

export interface CourseDiscoveryResult {
  summaries: string[][];
  courses: CourseResult[][];
}
export interface CourseRecommendationResult {
  jobTitle: string;
  skills: string[];
  recommendations: CourseResult[];
  totalRecommendations: number;
  source: 'vector_store' | 'full_process';
}

@Injectable()
export class RecommendationService {
  private readonly logger = new CustomLoggerService(RecommendationService.name);

  constructor(
    private aiBaseService: AIBaseService,
    private jobSkillsAnalyzer: JobSkillsAnalyzerService,
    private courseScraper: CourseScraperService,
    private courseGenerator: CourseGenerationService,
    private courseFromApi: DataFromApiService,
    private courseDataService: SourceGeneratorService,
  ) {}

  async testNew(jobTitles: string[]): Promise<JobSkillsResult[]> {
    await this.aiBaseService.ensureVectorStoreReady();
    const jobAnalysis: JobSkillsResult[] =
      await this.jobSkillsAnalyzer.analyzeMultipleJobSkills(jobTitles);
    this.logger.debug(
      `Job analysis results: ${JSON.stringify(jobAnalysis, null, 2)}`,
    );
    return jobAnalysis;
  }

  async seedVectorStoreTrending(): Promise<CourseDiscoveryResult[]> {
    await this.aiBaseService.ensureVectorStoreReady();
    const results: CourseDiscoveryResult[] = [];
    try {
      const jobAnalysis: JobSkillsResult[] =
        await this.jobSkillsAnalyzer.analyzeTrendingJobSkills();
      const courses: CourseResult[][] = await Promise.all(
        jobAnalysis.map(
          async (analysis) =>
            await this.courseDataService.fetchCourses(analysis.queries),
        ),
      );
      console.log('real', courses, '000000000000000000000000');
      const summaries = courses.map((c) =>
        c.map(this.aiBaseService.buildCourseSummary),
      );
      for (let i = 0; i < courses.length; i++) {
        if (courses[i][0]?.dataType == 'Course') {
          await this.aiBaseService.addDocuments(courses[i], jobAnalysis[i].jobTitle, true);
        } else {
          await this.aiBaseService.addDocuments(courses[i], jobAnalysis[i].jobTitle);
        }
      }
      results.push({
        courses,
        summaries,
      });
    } catch (error) {
      results.push({ courses: [], summaries: [[]] });
    }
    this.logger.info(
      `Trending vector store seeding results: ${JSON.stringify(results, null, 2)}`,
    );
    return results;
  }

  async seedVectorStore(jobTitles: string[]): Promise<CourseDiscoveryResult[]> {
    await this.aiBaseService.ensureVectorStoreReady();
    const results: CourseDiscoveryResult[] = [];
    this.logger.info('Starting seeding');
    try {
      const jobAnalysis: JobSkillsResult[] =
        await this.jobSkillsAnalyzer.analyzeMultipleJobSkills(jobTitles);
      // const courses: CourseResult[][] = await Promise.all(
      //   jobAnalysis.map(
      //     async (analysis) =>
      //       await this.courseScraper.scrapeCourses(analysis.queries),
      //   ),
      // );
      const courses: CourseResult[][] = await Promise.all(
        jobAnalysis.map(
          async (analysis) =>
            await this.courseDataService.fetchCourses(analysis.queries),
        ),
      );
      // console.log('real', courses, '000000000000000000000000');
      const summaries = courses.map((c) =>
        c.map(this.aiBaseService.buildCourseSummary),
      );
      console.log('in test');
      for (let i = 0; i < courses.length; i++) {
        if (courses[i][0]?.dataType == 'Course') {
          await this.aiBaseService.addDocuments(courses[i], jobTitles[i], true);
        } else {
          await this.aiBaseService.addDocuments(courses[i], jobTitles[i]);
        }
      }
      console.log('out test');
      results.push({
        courses,
        summaries,
      });
    } catch (error) {
      console.log(error);
      results.push({ courses: [], summaries: [[]] });
    }
    this.logger.info(
      `Vector store seeding results: ${JSON.stringify(results, null, 2)}`,
    );
    return results;
  }

  async halfProcess(
    jobTitle: string,
    limit: number = 5,
  ): Promise<CourseRecommendationResult> {
    await this.aiBaseService.ensureVectorStoreReady();
    try {
      const jobAnalysis: JobSkillsResult =
        await this.jobSkillsAnalyzer.analyzeJobSkills(jobTitle);
      const courses: CourseResult[] = await this.courseScraper.scrapeCourses(
        jobAnalysis.queries,
      );
      await this.aiBaseService.addDocuments(courses, jobTitle);
      if (courses[0].dataType == 'Course') {
        await this.aiBaseService.addDocuments(courses, jobTitle, true);
      } else {
        await this.aiBaseService.addDocuments(courses, jobTitle);
      }
      return {
        jobTitle,
        skills: jobAnalysis.skills,
        recommendations: courses.slice(0, limit),
        totalRecommendations: courses.length,
        source: 'full_process',
      };
    } catch (error) {
      return {
        jobTitle,
        skills: [],
        recommendations: [],
        totalRecommendations: 0,
        source: 'full_process',
      };
    }
  }

  async vectorStoreOnly(jobTitle: string, limit: number = 5): Promise<any> {
    await this.aiBaseService.ensureVectorStoreReady();
    const res = await this.courseGenerator.generateCoursesForJob(jobTitle);
    return res;
  }

  async getAllVectorStoreDocuments(): Promise<any[]> {
    await this.aiBaseService.ensureVectorStoreReady();
    const collection = this.aiBaseService.getCollections();
    const rawDocs = await collection.get();
    this.logger.debug(
      `Vector store documents: ${JSON.stringify(rawDocs.documents, null, 2)}`,
    );
    this.logger.debug(
      `Vector store metadatas: ${JSON.stringify(rawDocs.metadatas, null, 2)}`,
    );
    return rawDocs.documents;
  }
}
