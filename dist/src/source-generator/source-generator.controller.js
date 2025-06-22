"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceGeneratorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const course_scraper_service_1 = require("./course-scraper.service");
const test_scraper_dto_1 = require("./dto/test-scraper.dto");
let SourceGeneratorController = class SourceGeneratorController {
    courseScraper;
    constructor(courseScraper) {
        this.courseScraper = courseScraper;
    }
    async testScraper(body) {
        const searchQuery = {
            skill: body.skill,
            type: body.platform,
            query: body.query,
        };
        const results = await this.courseScraper.scrapeCourses([searchQuery]);
        return {
            query: body.query,
            platform: body.platform,
            skill: body.skill,
            results,
            totalResults: results.length,
        };
    }
};
exports.SourceGeneratorController = SourceGeneratorController;
__decorate([
    (0, common_1.Post)('test-scraper'),
    (0, swagger_1.ApiBody)({ type: test_scraper_dto_1.TestScraperDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [test_scraper_dto_1.TestScraperDto]),
    __metadata("design:returntype", Promise)
], SourceGeneratorController.prototype, "testScraper", null);
exports.SourceGeneratorController = SourceGeneratorController = __decorate([
    (0, swagger_1.ApiTags)('source-generator'),
    (0, common_1.Controller)('source-generator'),
    __metadata("design:paramtypes", [course_scraper_service_1.CourseScraperService])
], SourceGeneratorController);
//# sourceMappingURL=source-generator.controller.js.map