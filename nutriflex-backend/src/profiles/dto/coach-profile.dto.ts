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

/**
 * Public-facing coach profile information returned to trainees/admins
 * when listing available coaches for selection.
 */
export class PublicCoachProfileDto {
  @ApiProperty({ description: 'Coach user ID', example: 'uuid' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Coach full name', example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Profile image URL or data URL', required: false })
  @IsString()
  @IsOptional()
  profileImageUrl?: string | null;

  @ApiProperty({ description: 'Specialization', example: 'Strength Training', required: false })
  @IsString()
  @IsOptional()
  specialization?: string | null;

  @ApiProperty({ description: 'Years of experience', example: 5, required: false })
  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number | null;

  @ApiProperty({
    description: 'Certifications and qualifications',
    example: 'CPR, NASM Certified Personal Trainer',
    required: false,
  })
  @IsString()
  @IsOptional()
  certifications?: string | null;

  @ApiProperty({ description: 'Short professional biography', required: false })
  @IsString()
  @IsOptional()
  bio?: string | null;

  @ApiProperty({
    description: 'Whether this coach is currently selected for the trainee in context',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSelected?: boolean;
}

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

  @ApiProperty({ description: 'Profile image URL or base64 data URL', required: false })
  @IsString()
  @IsOptional()
  profile_image_url?: string | null;

  @ApiProperty({ description: 'Profile image as base64 for upload', required: false })
  @IsString()
  @IsOptional()
  profile_image_base64?: string | null;

  @ApiProperty({ description: 'Certification document/image as base64 for upload', required: false })
  @IsString()
  @IsOptional()
  certification_document_base64?: string | null;

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
  profile_image_url?: string | null;

  @ApiProperty({ description: 'Profile image as base64 for upload', required: false })
  @IsString()
  @IsOptional()
  profile_image_base64?: string | null;

  @ApiProperty({ description: 'Certification document as base64 for upload', required: false })
  @IsString()
  @IsOptional()
  certification_document_base64?: string | null;

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
