import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class TestScraperDto {
  @ApiProperty({ example: 'Python tutorial' })
  @IsString()
  query: string;

  @ApiProperty({ example: 'blog', enum: ['pdf', 'doc', 'blog', 'video', 'course'] })
  @IsString()
  platform: 'pdf' | 'doc' | 'blog' | 'video' | 'course';

  @ApiProperty({ example: ['Python'] })
  @IsString()
  skills: string[];
}
