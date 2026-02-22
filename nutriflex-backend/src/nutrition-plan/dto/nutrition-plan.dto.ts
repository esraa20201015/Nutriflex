import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NutritionPlanStatus } from '../enums/nutrition-plan-status.enum';
import { ExerciseType } from '../../exercise/enums/exercise-type.enum';
import { MealType } from '../../meal/enums/meal-type.enum';

export class CreateNutritionPlanDto {
  @ApiProperty({ description: 'Coach user ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  coach_id: string;

  @ApiProperty({ description: 'Trainee user ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  trainee_id: string;

  @ApiProperty({ description: 'Plan title', example: 'High Protein Diet' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Plan description', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'Target daily calories', example: 2000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  daily_calories?: number | null;

  @ApiProperty({ description: 'Plan start date', example: '2026-02-03T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ description: 'Plan end date', example: '2026-12-31T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  end_date?: string | null;

  @ApiProperty({ description: 'Plan status', example: NutritionPlanStatus.DRAFT, enum: NutritionPlanStatus, required: false })
  @IsEnum(NutritionPlanStatus)
  @IsOptional()
  status?: NutritionPlanStatus;
}

export class UpdateNutritionPlanDto {
  @ApiProperty({ example: 'Updated Title', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ example: 2200, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  daily_calories?: number | null;

  @ApiProperty({ example: '2026-02-03T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ example: '2026-12-31T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  end_date?: string | null;

  @ApiProperty({ example: NutritionPlanStatus.ACTIVE, enum: NutritionPlanStatus, required: false })
  @IsEnum(NutritionPlanStatus)
  @IsOptional()
  status?: NutritionPlanStatus;
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

  @ApiProperty({ example: NutritionPlanStatus.ACTIVE, enum: NutritionPlanStatus, required: false })
  @IsEnum(NutritionPlanStatus)
  @IsOptional()
  status?: NutritionPlanStatus;
}

export class SearchNutritionPlanDto {
  @ApiProperty({ example: 'keyword or title', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: NutritionPlanStatus.ACTIVE, enum: NutritionPlanStatus, required: false })
  @IsEnum(NutritionPlanStatus)
  @IsOptional()
  status?: NutritionPlanStatus;

  @ApiProperty({ example: 'uuid', description: 'Filter by coach ID', required: false })
  @IsString()
  @IsOptional()
  coach_id?: string;

  @ApiProperty({ example: 'uuid', description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;
}

/**
 * Nested DTOs for the coach plan flow (exercises & meals).
 */
export class PlanExerciseDto {
  @ApiProperty({ description: 'Optional existing exercise ID (from master exercise list)', required: false })
  @IsString()
  @IsOptional()
  exercise_id?: string;

  @ApiProperty({ description: 'Display name for the exercise', example: 'Treadmill Run' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Exercise type',
    enum: ExerciseType,
    example: ExerciseType.CARDIO,
  })
  @IsEnum(ExerciseType)
  exercise_type!: ExerciseType;

  @ApiProperty({ description: 'Day index within the plan (1-based)', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  day_index?: number;

  @ApiProperty({ description: 'Number of sets', example: 4, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  sets?: number | null;

  @ApiProperty({ description: 'Number of repetitions', example: 12, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  reps?: number | null;

  @ApiProperty({ description: 'Duration in minutes', example: 20, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  duration_minutes?: number | null;

  @ApiProperty({ description: 'Optional notes/instructions', required: false })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiProperty({ description: 'Optional guide image as Base64 for trainee reference', required: false })
  @IsString()
  @IsOptional()
  guide_image_base64?: string | null;

  @ApiProperty({ description: 'Optional guide video as Base64 for trainee reference', required: false })
  @IsString()
  @IsOptional()
  guide_video_base64?: string | null;

  @ApiProperty({ description: 'Display order within the plan', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  order_index?: number;
}

export class PlanMealDto {
  @ApiProperty({ description: 'Meal type (Breakfast, Lunch, Dinner)', enum: MealType })
  @IsEnum(MealType)
  meal_type!: MealType;

  @ApiProperty({ description: 'Meal name/label', example: 'Breakfast' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ description: 'Total calories for the meal', example: 550, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  calories?: number | null;

  @ApiProperty({
    description: 'Free-text ingredients and notes (frontend can format per-row ingredients)',
    required: false,
  })
  @IsString()
  @IsOptional()
  instructions?: string | null;

  @ApiProperty({ description: 'Display order within the plan', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  order_index?: number;
}

/**
 * Create a nutrition plan together with exercises & meals in one request.
 */
export class CreatePlanWithDetailsDto extends CreateNutritionPlanDto {
  @ApiProperty({
    description: 'Exercises to attach to this plan',
    type: [PlanExerciseDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanExerciseDto)
  @IsOptional()
  exercises?: PlanExerciseDto[];

  @ApiProperty({
    description: 'Meals (Breakfast, Lunch, Dinner) to attach to this plan',
    type: [PlanMealDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanMealDto)
  @IsOptional()
  meals?: PlanMealDto[];
}

