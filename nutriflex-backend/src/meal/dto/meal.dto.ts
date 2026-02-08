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
import { MealType } from '../enums/meal-type.enum';

export class CreateMealDto {
  @ApiProperty({ description: 'Nutrition plan ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  nutrition_plan_id: string;

  @ApiProperty({ description: 'Meal name', example: 'Oatmeal with berries' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Meal type', enum: MealType, example: MealType.BREAKFAST })
  @IsEnum(MealType)
  meal_type: MealType;

  @ApiProperty({ description: 'Calories', example: 350, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  calories?: number | null;

  @ApiProperty({ description: 'Protein (g)', example: 12, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  protein?: number | null;

  @ApiProperty({ description: 'Carbs (g)', example: 45, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  carbs?: number | null;

  @ApiProperty({ description: 'Fats (g)', example: 8, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  fats?: number | null;

  @ApiProperty({ description: 'Preparation instructions', required: false })
  @IsString()
  @IsOptional()
  instructions?: string | null;

  @ApiProperty({ description: 'Order within the plan', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  order_index?: number;
}

export class UpdateMealDto {
  @ApiProperty({ example: 'Updated meal name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ enum: MealType, required: false })
  @IsEnum(MealType)
  @IsOptional()
  meal_type?: MealType;

  @ApiProperty({ example: 400, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  calories?: number | null;

  @ApiProperty({ example: 15, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  protein?: number | null;

  @ApiProperty({ example: 50, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  carbs?: number | null;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  fats?: number | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  instructions?: string | null;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  order_index?: number;
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

  @ApiProperty({ enum: MealType, required: false })
  @IsEnum(MealType)
  @IsOptional()
  meal_type?: MealType;

  @ApiProperty({ description: 'Filter by nutrition plan ID', required: false })
  @IsString()
  @IsOptional()
  nutrition_plan_id?: string;
}

export class SearchMealDto {
  @ApiProperty({ example: 'keyword or name', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ enum: MealType, required: false })
  @IsEnum(MealType)
  @IsOptional()
  meal_type?: MealType;

  @ApiProperty({ description: 'Filter by nutrition plan ID', required: false })
  @IsString()
  @IsOptional()
  nutrition_plan_id?: string;
}
