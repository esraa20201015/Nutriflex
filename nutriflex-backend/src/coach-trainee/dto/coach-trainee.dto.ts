import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { CoachTraineeStatus } from '../enums/coach-trainee-status.enum';

export class CreateCoachTraineeDto {
  @ApiProperty({ description: 'Coach user ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  coach_id: string;

  @ApiProperty({ description: 'Trainee user ID (UUID)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  trainee_id: string;

  @ApiProperty({ description: 'Start date of the relationship(optional)', example: '2026-02-03T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string | null;

  @ApiProperty({ description: 'End date of the relationship (optional)', example: '2026-12-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string | null;

  @ApiProperty({ description: 'Relationship status', example: CoachTraineeStatus.ACTIVE, enum: CoachTraineeStatus, required: false })
  @IsEnum(CoachTraineeStatus)
  @IsOptional()
  status?: CoachTraineeStatus;
}

export class UpdateCoachTraineeDto {
  @ApiProperty({ example: '2026-02-03T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ example: '2026-12-31T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  end_date?: string | null;

  @ApiProperty({ example: CoachTraineeStatus.ACTIVE, enum: CoachTraineeStatus, required: false })
  @IsEnum(CoachTraineeStatus)
  @IsOptional()
  status?: CoachTraineeStatus;
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

  @ApiProperty({ example: CoachTraineeStatus.ACTIVE, enum: CoachTraineeStatus, required: false })
  @IsEnum(CoachTraineeStatus)
  @IsOptional()
  status?: CoachTraineeStatus;
}

export class SearchCoachTraineeDto {
  @ApiProperty({ example: 'coach or trainee name', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: CoachTraineeStatus.ACTIVE, enum: CoachTraineeStatus, required: false })
  @IsEnum(CoachTraineeStatus)
  @IsOptional()
  status?: CoachTraineeStatus;

  @ApiProperty({ example: 'uuid', description: 'Filter by coach ID', required: false })
  @IsString()
  @IsOptional()
  coach_id?: string;

  @ApiProperty({ example: 'uuid', description: 'Filter by trainee ID', required: false })
  @IsString()
  @IsOptional()
  trainee_id?: string;
}
