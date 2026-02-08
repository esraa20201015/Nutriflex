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
import { HealthMetricType } from '../enums/health-metric-type.enum';

export class CreateHealthMetricDto {
  @ApiProperty({ description: 'Trainee user ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  trainee_id: string;

  @ApiProperty({ description: 'Metric type', enum: HealthMetricType, example: HealthMetricType.WEIGHT })
  @IsEnum(HealthMetricType)
  metric_type: HealthMetricType;

  @ApiProperty({ description: 'Metric value', example: 70.5 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ description: 'Metric unit', example: 'kg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit: string;

  @ApiProperty({ description: 'When this metric was recorded', example: '2026-02-04T09:00:00.000Z' })
  @IsDateString()
  recorded_date: string;
}

export class UpdateHealthMetricDto {
  @ApiProperty({ enum: HealthMetricType, required: false })
  @IsEnum(HealthMetricType)
  @IsOptional()
  metric_type?: HealthMetricType;

  @ApiProperty({ example: 71.2, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @ApiProperty({ example: 'kg', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  unit?: string;

  @ApiProperty({ example: '2026-02-05T09:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  recorded_date?: string;
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

  @ApiProperty({ enum: HealthMetricType, required: false })
  @IsEnum(HealthMetricType)
  @IsOptional()
  metric_type?: HealthMetricType;

  @ApiProperty({ description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;
}

export class SearchHealthMetricDto {
  @ApiProperty({ enum: HealthMetricType, required: false })
  @IsEnum(HealthMetricType)
  @IsOptional()
  metric_type?: HealthMetricType;

  @ApiProperty({ description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;
}

