import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class CreateTraineeProfileDto {
  @ApiProperty({ description: 'User ID (TRAINEE role)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ description: 'Trainee full name', example: 'John Trainee' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  full_name: string;

  @ApiProperty({ description: 'Gender', example: 'male' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  gender: string;

  @ApiProperty({ description: 'Date of birth', example: '1995-05-10' })
  @IsDateString()
  date_of_birth: string;

  @ApiProperty({ description: 'Height in centimeters', example: 175.5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(300)
  height_cm?: number | null;

  @ApiProperty({ description: 'Weight in kilograms', example: 70.5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  weight_kg?: number | null;

  @ApiProperty({ description: 'Primary fitness goal', example: 'Lose 5 kg in 3 months', required: false })
  @IsString()
  @IsOptional()
  fitness_goal?: string | null;

  @ApiProperty({ description: 'Activity level', example: 'lightly_active', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  activity_level?: string | null;

  @ApiProperty({ description: 'Dietary preference', example: 'vegetarian', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  dietary_preference?: string | null;

  @ApiProperty({ description: 'Medical notes', required: false })
  @IsString()
  @IsOptional()
  medical_notes?: string | null;
}

export class UpdateTraineeProfileDto {
  @ApiProperty({ example: 'Updated Name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  full_name?: string;

  @ApiProperty({ example: 'female', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  gender?: string;

  @ApiProperty({ example: '1996-01-01', required: false })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @ApiProperty({ example: 180, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(300)
  height_cm?: number | null;

  @ApiProperty({ example: 72.3, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  weight_kg?: number | null;

  @ApiProperty({ example: 'Maintain weight', required: false })
  @IsString()
  @IsOptional()
  fitness_goal?: string | null;

  @ApiProperty({ example: 'very_active', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  activity_level?: string | null;

  @ApiProperty({ description: 'Dietary preference', example: 'normal', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  dietary_preference?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  medical_notes?: string | null;
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
}

export class SearchTraineeProfileDto {
  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  search?: string;
}

