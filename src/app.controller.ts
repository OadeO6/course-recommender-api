import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SourceGeneratorService } from './source-generator/source-generator.service';
import { LangchainService } from './ai/langchain.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly sourceGeneratorService: SourceGeneratorService,
    private readonly langchainService: LangchainService,
  ) {}

  @Get('test')
  getTest(): string {
    return 'API is working';
  }

  @Get('scrape')
  async scrape(): Promise<string> {
    return this.sourceGeneratorService.getExampleTitle();
  }

  @Get('ai')
  async ai(): Promise<string> {
    return this.langchainService.runChain('test input');
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
