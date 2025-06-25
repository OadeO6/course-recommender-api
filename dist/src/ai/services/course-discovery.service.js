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
var CourseGenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseGenerationService = void 0;
const common_1 = require("@nestjs/common");
const ai_base_service_1 = require("./ai-base.service");
const prompts_1 = require("@langchain/core/prompts");
const runnables_1 = require("@langchain/core/runnables");
const output_parsers_1 = require("@langchain/core/output_parsers");
const zod_1 = require("zod");
let CourseGenerationService = CourseGenerationService_1 = class CourseGenerationService {
    aiBaseService;
    logger = new common_1.Logger(CourseGenerationService_1.name);
    outputSchema = zod_1.z.object({
        badTittle: zod_1.z.boolean(),
        successful: zod_1.z.boolean(),
        data: zod_1.z.array(zod_1.z.object({
            title: zod_1.z.string(),
            description: zod_1.z.string(),
            courses: zod_1.z.array(zod_1.z.object({
                title: zod_1.z.string(),
                url: zod_1.z.string().url(),
                type: zod_1.z.enum(['Blog', 'Video', 'Course', 'Doc']),
                snippet: zod_1.z.string(),
            })),
        })),
    });
    constructor(aiBaseService) {
        this.aiBaseService = aiBaseService;
    }
    async generateCoursesForJob(jobTitle) {
        try {
            await this.aiBaseService.ensureVectorStoreReady();
            const outputParser = output_parsers_1.StructuredOutputParser.fromZodSchema(this.outputSchema);
            const prompt = prompts_1.PromptTemplate.fromTemplate(`
You are an expert career coach creating comprehensive course bundles for a {jobTitle} position.

Analyze the retrieved courses and determine if there's sufficient data to create meaningful course bundles.

If and only if {jobTitle} is verry far from looking like a job title or career aspiration in whatever field, return:
{{
  "badTittle": true,
  "successful": false,
  "data": []
}}
if it look like a job tittle with just a bit of typo, proceed

Retrieved Courses:
{context}

If there are fewer than 6 relevant courses OR the courses don't adequately cover the skills needed for {jobTitle}, return:
{{
  "badRequest": false,
  "successful": false,
  "data": []
}}
dont proceed if you are unnable to form a conrensive set of courses required for the job title

If there's sufficient data, create 3-5 different learning bundles for different learning preferences:
1. Blog-Focused Track - For readers who prefer articles and written content
2. Video-Based Track - For visual learners who prefer video tutorials
3. Mixed Learning Track - Combination of different content types
4. Hands-On Track - For practical, interactive learning
5. Structured Course Track - For traditional, comprehensive courses

IMPORTANT RULES:
- Each bundle should have 4-7 courses depending on job complexity
- Courses can appear in multiple bundles if they fit different learning styles
- Each bundle must be comprehensive enough to prepare someone for the {jobTitle} role
- Use ONLY the courses provided in the context above
- Ensure URLs are valid and types match exactly: 'Blog', 'Video', 'Course', or 'Doc'

{format_instructions}
`);
            const chain = runnables_1.RunnableSequence.from([
                {
                    context: (input) => this.aiBaseService.getNSimilarDocuments(input.jobTitle),
                    jobTitle: (input) => input.jobTitle,
                    format_instructions: () => outputParser.getFormatInstructions(),
                },
                prompt,
                this.aiBaseService.getLLM(),
                outputParser,
            ]);
            const result = await chain.invoke({ jobTitle });
            console.log('result', result);
            this.logger.log(`Generated courses for ${jobTitle}: ${result.successful ? 'Success' : 'Failed'}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error generating courses for ${jobTitle}: ${error.message}`, error.stack);
            return {
                badTittle: false,
                successful: false,
                data: []
            };
        }
    }
};
exports.CourseGenerationService = CourseGenerationService;
exports.CourseGenerationService = CourseGenerationService = CourseGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_base_service_1.AIBaseService])
], CourseGenerationService);
//# sourceMappingURL=course-discovery.service.js.map