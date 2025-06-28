import { Injectable } from '@nestjs/common';
import { AIBaseService } from './ai-base.service';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { CustomLoggerService } from '../../common/custom-logger.service';

@Injectable()
export class CourseGenerationService {
  private readonly logger = new CustomLoggerService(CourseGenerationService.name);

  private readonly outputSchema = z.object({
    badTittle: z.boolean(),
    successful: z.boolean(),
    data: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        courses: z.array(
          z.object({
            title: z.string(),
            url: z.string().url(),
            type: z.enum(['Blog', 'Video', 'Course', 'Doc', 'PDF']),
            snippet: z.string(),
          })
        ),
      })
    ),
  });

  constructor(private readonly aiBaseService: AIBaseService) {}

  async generateCoursesForJob(jobTitle: string) {
    try {
      await this.aiBaseService.ensureVectorStoreReady();

      const outputParser = StructuredOutputParser.fromZodSchema(this.outputSchema);

      // TODO: fix false negative for badRequest and false positive for successful
// dont proceed if you are unnable to form a conrensive set of courses required for the job title
      const prompt = PromptTemplate.fromTemplate(`
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

      const chain = RunnableSequence.from([
        {
          context: (input: { jobTitle: string }) =>
            this.aiBaseService.getNSimilarDocuments(input.jobTitle),
          jobTitle: (input: { jobTitle: string }) => input.jobTitle,
          format_instructions: () => outputParser.getFormatInstructions(),
        },
        prompt,
        this.aiBaseService.getLLM(),
        outputParser,
      ]);

      const result = await chain.invoke({ jobTitle });
      this.logger.debug(`Generated result for ${jobTitle}: ${JSON.stringify(result, null, 2)}`);

      this.logger.info(`Generated courses for ${jobTitle}: ${result.successful ? 'Success' : 'Failed'}`);
      return result;

    } catch (error) {
      this.logger.error(`Error generating courses for ${jobTitle}: ${error.message}`, error.stack);
      return {
        badTittle: false,
        successful: false,
        data: []
      };
    }
  }
}
 