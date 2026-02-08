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
} from 'class-validator';
import { NutritionPlanStatus } from '../enums/nutrition-plan-status.enum';

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
