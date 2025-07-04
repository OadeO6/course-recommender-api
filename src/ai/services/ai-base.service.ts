import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { CourseResult } from 'src/source-generator/course-scraper.service';
import { Document } from '@langchain/core/documents';
import { CustomLoggerService } from '../../common/custom-logger.service';

@Injectable()
export class AIBaseService {
  private readonly logger = new CustomLoggerService(AIBaseService.name);
  private llm: ChatGoogleGenerativeAI;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private vectorStore: Chroma;
  private vectorStoreCourses: Chroma;
  private collectionOthers: any;
  private collectionCourses: any;
  private isVectorStoreReady = false;

  constructor() {
    this.initializeLLM();
    this.initializeEmbeddings();
    this.initVectorStore();
  }

  private initializeLLM() {
    this.llm = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      temperature: 0.1,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  private initializeEmbeddings() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: 'embedding-001',
    });
  }

// NOTE: point 1
  buildCourseSummary(course: CourseResult): string {
    let summary = `Title: ${course.title}\n`;
    summary += `URL: ${course.url}\n`;
    summary += `Skills: ${course.skills?.join(', ') ?? ''}\n`;
    summary += `Data Type: ${course.dataType}\n`;
    summary += `Query: ${course.query}\n`;
    summary += `Discription: ${course.snippet}\n`;
    summary += `Difficulty: ${course.difficulty}\n`;
    summary += `Rating: ${course.rating}\n`;
    summary += `Reviews: ${course.reviews}\n`;
    return summary;
  }

  async addDocuments(courses: CourseResult[], jobTitle: string, altStore: boolean = false) {
    await this.ensureVectorStoreReady();
    const vectorStore = (altStore ? this.vectorStoreCourses : this.vectorStore);

    await vectorStore.addDocuments(
      courses.map(
        (course) =>
          new Document({
            pageContent: this.buildCourseSummary(course),
            metadata: {
              title: course.title,
              url: course.url,
              image: course.image ?? '',
              snippet: course.snippet ?? '',
              dataType: course.dataType ?? '',
              query: course.query,
              rating: course.rating ?? '',
              reviews: course.reviews ?? '',
              difficulty: course.difficulty ?? '',
              skills: course.skills?.join(', ') ?? '',
              jobTitle,
            },
          }),
      ),
    );
  }



  async getNSimilarDocuments(query: string, n: number = 50): Promise<CourseResult[]> {
    await this.ensureVectorStoreReady();

    try {
      const embeddings = this.getEmbeddings();
      const [collection1, collection2] = this.getCollections();

      const embedding = await embeddings.embedQuery(query);

      // Search both collections
      const [res1, res2] = await Promise.all([
        collection1.query({
          queryEmbeddings: [embedding],
          nResults: n,
          include: ['documents', 'metadatas', 'distances'],
        }),
        collection2.query({
          queryEmbeddings: [embedding],
          nResults: Math.floor(n / 2), // or any other logic
          include: ['documents', 'metadatas', 'distances'],
        }),
      ]);

      // Merge the fields manually
      const combined = {
        documents: [...(res1.documents ?? []), ...(res2.documents ?? [])],
        metadatas: [...(res1.metadatas ?? []), ...(res2.metadatas ?? [])],
        distances: [...(res1.distances ?? []), ...(res2.distances ?? [])],
      };

      // Convert metadata to CourseResult[]
      const courseResults: CourseResult[] = [];

      for (const metaArray of combined.metadatas) {
        for (const meta of metaArray) {
          if (meta) {
            courseResults.push(meta as CourseResult);
          }
        }
      }

      return courseResults;
    } catch (error) {
      this.logger.error(`Error in getNSimilarDocuments: ${error.message}`, error.stack);
      throw new Error(`Similarity search failed: ${error.message}`);
    }
  }


  private async initVectorStore() {
    this.vectorStoreCourses = await Chroma.fromExistingCollection(
      this.embeddings,
      {
        collectionName: 'courses',
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      }
    );
    this.vectorStore = await Chroma.fromExistingCollection(
      this.embeddings,
      {
        collectionName: 'others',
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      }
    );
    this.collectionOthers = (this.vectorStore as any).collection;
    this.collectionCourses = (this.vectorStoreCourses as any).collection;
    this.isVectorStoreReady = true;
  }

  getLLM(): ChatGoogleGenerativeAI {
    return this.llm;
  }

  getEmbeddings(): GoogleGenerativeAIEmbeddings {
    return this.embeddings;
  }

  getCollections(): any {
    return [this.collectionOthers, this.collectionCourses];
  }

  async ensureVectorStoreReady(): Promise<void> {
    if (!this.isVectorStoreReady) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!this.isVectorStoreReady) throw new Error('Vector store not ready');
    }
  }

  isReady(): boolean {
    return this.isVectorStoreReady;
  }
}
