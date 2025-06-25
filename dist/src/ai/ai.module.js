"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_controller_1 = require("./ai.controller");
const job_skills_analyzer_service_1 = require("./services/job-skills-analyzer.service");
const langchain_service_1 = require("./langchain.service");
const ai_base_service_1 = require("./services/ai-base.service");
const course_discovery_service_1 = require("./services/course-discovery.service");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        controllers: [ai_controller_1.AiController],
        providers: [job_skills_analyzer_service_1.JobSkillsAnalyzerService, langchain_service_1.LangchainService, ai_base_service_1.AIBaseService, course_discovery_service_1.CourseGenerationService],
        exports: [job_skills_analyzer_service_1.JobSkillsAnalyzerService, langchain_service_1.LangchainService, ai_base_service_1.AIBaseService, course_discovery_service_1.CourseGenerationService],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map