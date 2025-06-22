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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseDiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const job_skills_analyzer_service_1 = require("./job-skills-analyzer.service");
const course_scraper_service_1 = require("../../source-generator/course-scraper.service");
const memory_1 = require("langchain/vectorstores/memory");
const google_genai_1 = require("@langchain/google-genai");
const documents_1 = require("@langchain/core/documents");
let CourseDiscoveryService = class CourseDiscoveryService {
    jobSkillsAnalyzer;
    courseScraper;
    embeddings = new google_genai_1.GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        modelName: 'embedding-001',
    });
    vectorStore = new memory_1.MemoryVectorStore(this.embeddings);
    constructor(jobSkillsAnalyzer, courseScraper) {
        this.jobSkillsAnalyzer = jobSkillsAnalyzer;
        this.courseScraper = courseScraper;
    }
    async discoverCourses(jobTitle) {
        const jobAnalysis = await this.jobSkillsAnalyzer.analyzeJobSkills(jobTitle);
        const courses = await this.courseScraper.scrapeCourses(jobAnalysis.queries);
        const summaries = courses.map(this.buildCourseSummary);
        await this.vectorStore.addDocuments(courses.map(course => new documents_1.Document({
            pageContent: this.buildCourseSummary(course),
            metadata: { ...course }
        })));
        return {
            jobTitle,
            skills: jobAnalysis.skills,
            courses: summaries,
            totalCourses: courses.length,
        };
    }
    async searchSimilarCourses(query, limit = 5) {
        const results = await this.vectorStore.similaritySearch(query, limit);
        return results.map(doc => doc.metadata);
    }
    buildCourseSummary(course) {
        let summary = `Title: ${course.title}\n`;
        summary += `URL: ${course.url}\n`;
        summary += `Skill: ${course.skill}\n`;
        summary += `Data Type: ${course.dataType}\n`;
        summary += `Query: ${course.query}\n`;
        summary += `Snippet: ${course.snippet}`;
        return summary;
    }
};
exports.CourseDiscoveryService = CourseDiscoveryService;
exports.CourseDiscoveryService = CourseDiscoveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [job_skills_analyzer_service_1.JobSkillsAnalyzerService,
        course_scraper_service_1.CourseScraperService])
], CourseDiscoveryService);
//# sourceMappingURL=course-discovery.service.js.map