import { AppService } from './app.service';
import { SourceGeneratorService } from './source-generator/source-generator.service';
import { LangchainService } from './ai/langchain.service';
export declare class AppController {
    private readonly appService;
    private readonly sourceGeneratorService;
    private readonly langchainService;
    constructor(appService: AppService, sourceGeneratorService: SourceGeneratorService, langchainService: LangchainService);
    getTest(): string;
    scrape(): Promise<string>;
    ai(): Promise<string>;
    getHello(): string;
}
