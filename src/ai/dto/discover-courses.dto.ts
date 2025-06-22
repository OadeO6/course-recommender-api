import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DiscoverCoursesDto {
  @ApiProperty({ example: 'Data Scientist' })
  @IsString()
  jobTitle: string;
} 