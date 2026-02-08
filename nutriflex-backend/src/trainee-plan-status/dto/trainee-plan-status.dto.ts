import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { TraineePlanStatusEnum } from '../enums/trainee-plan-status.enum';

export class CreateTraineePlanStatusDto {
  @ApiProperty({ description: 'Trainee user ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  trainee_id: string;

  @ApiProperty({ description: 'Assigned plan ID (nutrition or exercise plan)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  plan_id: string;

  @ApiProperty({ description: 'Completion percentage (0–100)', example: 80, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  completion_percentage?: number;

  @ApiProperty({ description: 'Plan status', enum: TraineePlanStatusEnum, example: TraineePlanStatusEnum.IN_PROGRESS, required: false })
  @IsEnum(TraineePlanStatusEnum)
  @IsOptional()
  status?: TraineePlanStatusEnum;
}

export class UpdateTraineePlanStatusDto {
  @ApiProperty({ example: 90, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  completion_percentage?: number;

  @ApiProperty({ enum: TraineePlanStatusEnum, required: false })
  @IsEnum(TraineePlanStatusEnum)
  @IsOptional()
  status?: TraineePlanStatusEnum;
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

  @ApiProperty({ description: 'Filter by plan ID', required: false })
  @IsString()
  @IsOptional()
  plan_id?: string;

  @ApiProperty({ enum: TraineePlanStatusEnum, required: false })
  @IsEnum(TraineePlanStatusEnum)
  @IsOptional()
  status?: TraineePlanStatusEnum;
}

export class SearchTraineePlanStatusDto {
  @ApiProperty({ description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;

  @ApiProperty({ description: 'Filter by plan ID', required: false })
  @IsString()
  @IsOptional()
  plan_id?: string;

  @ApiProperty({ enum: TraineePlanStatusEnum, required: false })
  @IsEnum(TraineePlanStatusEnum)
  @IsOptional()
  status?: TraineePlanStatusEnum;
}

