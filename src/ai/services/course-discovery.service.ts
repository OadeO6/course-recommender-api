import { Injectable } from '@nestjs/common';
import { JobSkillsAnalyzerService, JobSkillsResult } from './job-skills-analyzer.service';
import { CourseScraperService, CourseResult } from '../../source-generator/course-scraper.service';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Document } from '@langchain/core/documents';

export interface CourseDiscoveryResult {
  jobTitle: string;
  skills: string[];
  courses: string[]; // Summaries
  totalCourses: number;
}

@Injectable()
export class CourseDiscoveryService {
  private embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: 'embedding-001',
  });
  private vectorStore = new MemoryVectorStore(this.embeddings);

  constructor(
    private jobSkillsAnalyzer: JobSkillsAnalyzerService,
    private courseScraper: CourseScraperService,
  ) {}

  async discoverCourses(jobTitle: string): Promise<CourseDiscoveryResult> {
    // 1. Analyze job and generate queries
    const jobAnalysis: JobSkillsResult = await this.jobSkillsAnalyzer.analyzeJobSkills(jobTitle);

    // 2. Scrape courses using real scraper
    const courses: CourseResult[] = await this.courseScraper.scrapeCourses(jobAnalysis.queries);

    // 3. Build summaries
    const summaries = courses.map(this.buildCourseSummary);

    // 4. Store in vector DB
    await this.vectorStore.addDocuments(
      courses.map(course => new Document({
        pageContent: this.buildCourseSummary(course),
        metadata: { ...course }
      }))
    );

    return {
      jobTitle,
      skills: jobAnalysis.skills,
      courses: summaries,
      totalCourses: courses.length,
    };
  }

  async searchSimilarCourses(query: string, limit: number = 5): Promise<CourseResult[]> {
    const results = await this.vectorStore.similaritySearch(query, limit);
    return results.map(doc => doc.metadata as CourseResult);
  }

  private buildCourseSummary(course: CourseResult): string {
    let summary = `Title: ${course.title}\n`;
    summary += `URL: ${course.url}\n`;
    summary += `Skill: ${course.skill}\n`;
    summary += `Data Type: ${course.dataType}\n`;
    summary += `Query: ${course.query}\n`;
    summary += `Snippet: ${course.snippet}`;
    return summary;
  }
} 