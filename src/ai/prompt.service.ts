import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptService {
  getPromptTemplate(): string {
    return 'What courses would you recommend for {topic}?';
  }
} 