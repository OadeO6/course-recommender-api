"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceGeneratorModule = void 0;
const common_1 = require("@nestjs/common");
const source_generator_service_1 = require("./source-generator.service");
const data_from_scrape_service_1 = require("./data-from-scrape.service");
const data_from_api_service_1 = require("./data-from-api.service");
const course_scraper_service_1 = require("./course-scraper.service");
const source_generator_controller_1 = require("./source-generator.controller");
let SourceGeneratorModule = class SourceGeneratorModule {
};
exports.SourceGeneratorModule = SourceGeneratorModule;
exports.SourceGeneratorModule = SourceGeneratorModule = __decorate([
    (0, common_1.Module)({
        controllers: [source_generator_controller_1.SourceGeneratorController],
        providers: [source_generator_service_1.SourceGeneratorService, data_from_scrape_service_1.DataFromScrapeService, data_from_api_service_1.DataFromApiService, course_scraper_service_1.CourseScraperService],
        exports: [source_generator_service_1.SourceGeneratorService, data_from_scrape_service_1.DataFromScrapeService, data_from_api_service_1.DataFromApiService, course_scraper_service_1.CourseScraperService],
    })
], SourceGeneratorModule);
//# sourceMappingURL=source-generator.module.js.map