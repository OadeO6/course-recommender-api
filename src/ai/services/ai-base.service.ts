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
  private collection: any;
  private retriever: any;
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

  buildCourseSummary(course: CourseResult): string {
    let summary = `Title: ${course.title}\n`;
    summary += `URL: ${course.url}\n`;
    summary += `Skill: ${course.skill}\n`;
    summary += `Data Type: ${course.dataType}\n`;
    summary += `Query: ${course.query}\n`;
    summary += `Snippet: ${course.snippet}`;
    return summary;
  }

  async addDocuments(courses: CourseResult[], jobTitle: string) {
    await this.ensureVectorStoreReady();
    const vectorStore = this.getVectorStore();

    await vectorStore.addDocuments(
      courses.map(course => new Document({
        pageContent: this.buildCourseSummary(course),
        metadata: { ...course, jobTitle }
      }))
    );
  }


  async getNSimilarDocuments(query: string, n: number =50): Promise<CourseResult[]> {
    await this.ensureVectorStoreReady();
    try {
      const embeddings = this.getEmbeddings();
      const collection = this.getCollection();

      const embedding = await embeddings.embedQuery(query);
      const results = await collection.query({
        queryEmbeddings: [embedding],
        nResults: n,
        include: ['documents', 'metadatas', 'distances']
      });

      this.logger.debug(`Similarity search results: ${JSON.stringify(results, null, 2)}`);
      const courseResults: CourseResult[] = [];
      if (results.metadatas[0]) {
        for (let i = 0; i < results.metadatas[0].length; i++) {
          const metadata = results.metadatas[0][i];
          if (metadata) {
            courseResults.push(metadata as CourseResult);
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
    this.vectorStore = await Chroma.fromExistingCollection(
      this.embeddings,
      {
        collectionName: 'courses',
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      }
    );
    this.collection = (this.vectorStore as any).collection;
    this.isVectorStoreReady = true;

    this.retriever = this.vectorStore.asRetriever({
      k: 20, // Number of documents to retrieve
      searchType: 'similarity',
    });
  }

  getRetriever(): any {
    return this.retriever;
  }

  getLLM(): ChatGoogleGenerativeAI {
    return this.llm;
  }

  getEmbeddings(): GoogleGenerativeAIEmbeddings {
    return this.embeddings;
  }

  getVectorStore(): Chroma {
    return this.vectorStore;
  }

  getCollection(): any {
    return this.collection;
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
