import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class CreateBodyMeasurementDto {
  @ApiProperty({ description: 'Trainee user ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  trainee_id: string;

  @ApiProperty({ description: 'Chest circumference (cm)', example: 100.5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  chest_cm?: number | null;

  @ApiProperty({ description: 'Waist circumference (cm)', example: 80.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  waist_cm?: number | null;

  @ApiProperty({ description: 'Hips circumference (cm)', example: 95.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  hips_cm?: number | null;

  @ApiProperty({ description: 'Arm circumference (cm)', example: 35.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  arm_cm?: number | null;

  @ApiProperty({ description: 'Thigh circumference (cm)', example: 55.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  thigh_cm?: number | null;

  @ApiProperty({ description: 'Measurement date/time', example: '2026-02-04T09:00:00.000Z' })
  @IsDateString()
  measured_date: string;
}

export class UpdateBodyMeasurementDto {
  @ApiProperty({ example: 101.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  chest_cm?: number | null;

  @ApiProperty({ example: 79.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  waist_cm?: number | null;

  @ApiProperty({ example: 94.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  hips_cm?: number | null;

  @ApiProperty({ example: 36.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  arm_cm?: number | null;

  @ApiProperty({ example: 54.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  thigh_cm?: number | null;

  @ApiProperty({ example: '2026-02-05T09:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  measured_date?: string;
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

  @ApiProperty({ description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;
}

export class SearchBodyMeasurementDto {
  @ApiProperty({ description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;
}

