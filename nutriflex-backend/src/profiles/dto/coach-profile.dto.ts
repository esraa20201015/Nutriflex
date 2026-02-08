import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateCoachProfileDto {
  @ApiProperty({ description: 'User ID (COACH role)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ description: 'Coach full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  full_name: string;

  @ApiProperty({ description: 'Professional biography', required: false })
  @IsString()
  @IsOptional()
  bio?: string | null;

  @ApiProperty({ description: 'Area of specialization', example: 'Strength Training', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  specialization?: string | null;

  @ApiProperty({ description: 'Years of professional experience', example: 5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(50)
  years_of_experience?: number | null;

  @ApiProperty({ description: 'Certifications', example: 'CPR, NASM', required: false })
  @IsString()
  @IsOptional()
  certifications?: string | null;

  @ApiProperty({ description: 'URL to profile image', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  profile_image_url?: string | null;

  @ApiProperty({ description: 'Status: true = Active, false = Inactive', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class UpdateCoachProfileDto {
  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  full_name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string | null;

  @ApiProperty({ example: 'Nutrition', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  specialization?: string | null;

  @ApiProperty({ example: 7, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(50)
  years_of_experience?: number | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  certifications?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  profile_image_url?: string | null;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
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

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class SearchCoachProfileDto {
  @ApiProperty({ example: 'keyword or name', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
