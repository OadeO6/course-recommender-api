import { Injectable } from '@nestjs/common';

@Injectable()
export class LangchainService {
  // Remove the runChain method if not used elsewhere

  async testPrompt(prompt: string): Promise<string> {
    // Replace this with real LangChain logic if available
    return `LangChain received: ${prompt}`;
  }
} 