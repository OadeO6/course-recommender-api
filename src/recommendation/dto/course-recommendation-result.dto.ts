import { ApiProperty } from '@nestjs/swagger';

export class CourseRecommendationResultDto {
  @ApiProperty({ example: 'Data Scientist' })
  jobTitle: string;

  @ApiProperty({ example: ['Python', 'SQL', 'Machine Learning'] })
  skills: string[];

  @ApiProperty({ example: [] })
  recommendations: any[];

  @ApiProperty({ example: 5 })
  totalRecommendations: number;

  @ApiProperty({ example: 'vector_store', enum: ['vector_store', 'full_process'] })
  source: 'vector_store' | 'full_process';
} 