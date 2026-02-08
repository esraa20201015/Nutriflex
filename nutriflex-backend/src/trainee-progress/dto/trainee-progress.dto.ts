import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { TraineeProgressPeriodType } from '../enums/trainee-progress-period-type.enum';

export class CreateTraineeProgressDto {
  @ApiProperty({ description: 'Trainee user ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  trainee_id: string;

  @ApiProperty({ description: 'Period type', enum: TraineeProgressPeriodType, example: TraineeProgressPeriodType.WEEKLY })
  @IsEnum(TraineeProgressPeriodType)
  period_type: TraineeProgressPeriodType;

  @ApiProperty({ description: 'Period start date', example: '2026-02-01' })
  @IsDateString()
  period_start: string;

  @ApiProperty({ description: 'Period end date', example: '2026-02-07' })
  @IsDateString()
  period_end: string;

  @ApiProperty({ description: 'High-level progress summary', example: 'Lost 1.2 kg, improved cardio, 90% plan adherence' })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({ description: 'Optional coach notes', required: false })
  @IsString()
  @IsOptional()
  coach_notes?: string | null;
}

export class UpdateTraineeProgressDto {
  @ApiProperty({ enum: TraineeProgressPeriodType, required: false })
  @IsEnum(TraineeProgressPeriodType)
  @IsOptional()
  period_type?: TraineeProgressPeriodType;

  @ApiProperty({ example: '2026-02-01', required: false })
  @IsDateString()
  @IsOptional()
  period_start?: string;

  @ApiProperty({ example: '2026-02-07', required: false })
  @IsDateString()
  @IsOptional()
  period_end?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  coach_notes?: string | null;
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

  @ApiProperty({ enum: TraineeProgressPeriodType, required: false })
  @IsEnum(TraineeProgressPeriodType)
  @IsOptional()
  period_type?: TraineeProgressPeriodType;

  @ApiProperty({ description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;
}

export class SearchTraineeProgressDto {
  @ApiProperty({ enum: TraineeProgressPeriodType, required: false })
  @IsEnum(TraineeProgressPeriodType)
  @IsOptional()
  period_type?: TraineeProgressPeriodType;

  @ApiProperty({ description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;

  @ApiProperty({ description: 'Free-text search in summary/notes', required: false })
  @IsString()
  @IsOptional()
  search?: string;
}

