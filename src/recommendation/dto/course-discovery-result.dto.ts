import { ApiProperty } from '@nestjs/swagger';

export class CourseDiscoveryResultDto {
  @ApiProperty({ example: 'Data Scientist' })
  jobTitle: string;

  @ApiProperty({ example: ['Python', 'SQL', 'Machine Learning'] })
  skills: string[];

  @ApiProperty({ example: ['Course summaries...'] })
  courses: string[];

  @ApiProperty({ example: 15 })
  totalCourses: number;
} 