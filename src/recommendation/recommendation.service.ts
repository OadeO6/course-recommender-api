import { Injectable } from '@nestjs/common';
import { JobSkillsAnalyzerService, JobSkillsResult } from '../ai/services/job-skills-analyzer.service';
import { CourseScraperService, CourseResult } from '../source-generator/course-scraper.service';
import { Document } from '@langchain/core/documents';
import { AIBaseService } from 'src/ai/services/ai-base.service';
import { CourseGenerationService } from 'src/ai/services/course-discovery.service';

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
  constructor(
    private aiBaseService: AIBaseService,
    private jobSkillsAnalyzer: JobSkillsAnalyzerService,
    private courseScraper: CourseScraperService,
    private courseGenerator: CourseGenerationService,
  ) {}

  async addDocuments(courses: CourseResult[], jobTitle: string) {
    await this.aiBaseService.ensureVectorStoreReady();
    const vectorStore = this.aiBaseService.getVectorStore();

    await vectorStore.addDocuments(
      courses.map(course => new Document({
        pageContent: this.aiBaseService.buildCourseSummary(course),
        metadata: { ...course, jobTitle }
      }))
    );
  }

  async testNew(jobTitles: string[]): Promise<JobSkillsResult[]> {
    await this.aiBaseService.ensureVectorStoreReady();
    const jobAnalysis: JobSkillsResult[] = await this.jobSkillsAnalyzer.analyzeMultipleJobSkills(jobTitles);
    console.log(jobAnalysis);
    return jobAnalysis;
  }

  async seedVectorStoreTrending(): Promise<CourseDiscoveryResult[]> {
    await this.aiBaseService.ensureVectorStoreReady();
    const results: CourseDiscoveryResult[] = [];
    try {
        const jobAnalysis: JobSkillsResult[] = await this.jobSkillsAnalyzer.analyzeTrendingJobSkills();
        const courses: CourseResult[][] = await Promise.all(jobAnalysis.map(async (analysis) => await this.courseScraper.scrapeCourses(analysis.queries)));
        const summaries = courses.map( c => c.map(this.aiBaseService.buildCourseSummary));
        for (let i = 0; i < courses.length; i++) {
          await this.addDocuments(courses[i], jobAnalysis[i].jobTitle);
        }
        results.push({
          courses,
          summaries,
        });
    } catch (error) {
        results.push({ courses: [], summaries: [[]]});
    }
    console.log(results);
    return results;
  }

  async seedVectorStore(jobTitles: string[]): Promise<CourseDiscoveryResult[]> {
    await this.aiBaseService.ensureVectorStoreReady();
    const results: CourseDiscoveryResult[] = [];
    console.log('Starting seeding')
    try {
        const jobAnalysis: JobSkillsResult[] = await this.jobSkillsAnalyzer.analyzeMultipleJobSkills(jobTitles);
        const courses: CourseResult[][] = await Promise.all(jobAnalysis.map(async (analysis) => await this.courseScraper.scrapeCourses(analysis.queries)));
        const summaries = courses.map( c => c.map(this.aiBaseService.buildCourseSummary));
        for (let i = 0; i < courses.length; i++) {
          await this.addDocuments(courses[i], jobTitles[i]);
        }
        results.push({
          courses,
          summaries,
        });
    } catch (error) {
        results.push({ courses: [], summaries: [[]]});
    }
    console.log(results);
    return results;
  }

  async fullProcess(jobTitle: string, limit: number = 5): Promise<CourseRecommendationResult> {
    await this.aiBaseService.ensureVectorStoreReady();
    try {
      const jobAnalysis: JobSkillsResult = await this.jobSkillsAnalyzer.analyzeJobSkills(jobTitle);
      const courses: CourseResult[] = await this.courseScraper.scrapeCourses(jobAnalysis.queries);
      await this.addDocuments(courses, jobTitle);
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

  async searchSimilarCourses(query: string, limit: number = 15): Promise<CourseResult[]> {
    await this.aiBaseService.ensureVectorStoreReady();
    const vectorStore = this.aiBaseService.getVectorStore();
    const results = await vectorStore.similaritySearch(query, limit);
    console.log(results, '00000000')
    return results.map(doc => doc.metadata as CourseResult);
  }


  async getAllVectorStoreDocuments(): Promise<any[]> {
    await this.aiBaseService.ensureVectorStoreReady();
    const collection = this.aiBaseService.getCollection();
    const rawDocs = await collection.get();
    console.log(rawDocs.documents, rawDocs.metadatas);
    return rawDocs.documents;
  }
}
