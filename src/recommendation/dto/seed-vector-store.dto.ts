import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class SeedVectorStoreDto {
  @ApiProperty({
    description: 'Array of job titles to seed the vector store with',
    example: ['Data Scientist', 'Frontend Developer', 'DevOps Engineer'],
    type: 'array',
    items: { type: 'string' },
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one job title is required' })
  @IsString({ each: true, message: 'Each job title must be a string' })
  jobTitles: string[];
} 