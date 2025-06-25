import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class VectorStoreOnlyDto {
  @ApiProperty({
    description: 'Job title to get recommendations for from vector store',
    example: 'Data Scientist'
  })
  @IsString({ message: 'Job title is required and must be a string' })
  jobTitle: string;

  @ApiProperty({
    description: 'Maximum number of recommendations to return',
    example: 5,
    required: false,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit cannot exceed 50' })
  limit?: number;
} 