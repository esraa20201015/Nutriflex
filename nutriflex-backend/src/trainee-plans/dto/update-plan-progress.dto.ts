import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class UpdatePlanProgressDto {
  @ApiProperty({
    type: [String],
    required: false,
    description: 'IDs of plan exercises marked as completed by the trainee',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  completedExerciseIds?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'IDs of plan meals marked as completed by the trainee',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  completedMealIds?: string[];
}

