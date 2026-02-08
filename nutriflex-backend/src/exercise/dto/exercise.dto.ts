import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { ExerciseType } from '../enums/exercise-type.enum';

export class CreateExerciseDto {
  @ApiProperty({ description: 'Coach user ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  coach_id: string;

  @ApiProperty({ description: 'Trainee user ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  trainee_id: string;

  @ApiProperty({ description: 'Exercise name', example: 'Push-ups' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Exercise type', enum: ExerciseType, example: ExerciseType.STRENGTH })
  @IsEnum(ExerciseType)
  exercise_type: ExerciseType;

  @ApiProperty({ description: 'Sets', example: 3, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  sets?: number | null;

  @ApiProperty({ description: 'Reps', example: 12, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  reps?: number | null;

  @ApiProperty({ description: 'Duration (minutes)', example: 30, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  duration_minutes?: number | null;

  @ApiProperty({ description: 'Instructions', required: false })
  @IsString()
  @IsOptional()
  instructions?: string | null;
}

export class UpdateExerciseDto {
  @ApiProperty({ example: 'Updated exercise name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ enum: ExerciseType, required: false })
  @IsEnum(ExerciseType)
  @IsOptional()
  exercise_type?: ExerciseType;

  @ApiProperty({ example: 4, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  sets?: number | null;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  reps?: number | null;

  @ApiProperty({ example: 25, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  duration_minutes?: number | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  instructions?: string | null;
}

export class PaginationDto {
  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  skip?: number;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  take?: number;

  @ApiProperty({ enum: ExerciseType, required: false })
  @IsEnum(ExerciseType)
  @IsOptional()
  exercise_type?: ExerciseType;

  @ApiProperty({ description: 'Filter by coach ID', required: false })
  @IsString()
  @IsOptional()
  coach_id?: string;

  @ApiProperty({ description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;
}

export class SearchExerciseDto {
  @ApiProperty({ example: 'keyword or name', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ enum: ExerciseType, required: false })
  @IsEnum(ExerciseType)
  @IsOptional()
  exercise_type?: ExerciseType;

  @ApiProperty({ description: 'Filter by coach ID', required: false })
  @IsString()
  @IsOptional()
  coach_id?: string;

  @ApiProperty({ description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;
}

