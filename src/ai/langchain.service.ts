import { Injectable } from '@nestjs/common';

@Injectable()
export class LangchainService {
  async runChain(input: string): Promise<string> {
    // Placeholder for LangChain logic
    return `LangChain processed: ${input}`;
  }
} 