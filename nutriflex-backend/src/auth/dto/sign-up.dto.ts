import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  MinLength,
  Matches,
  IsOptional,
  IsIn,
  ValidateIf,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Coach-specific fields for sign-up */
export class CoachProfileDto {
  @ApiProperty({ example: 'John Doe', description: 'Coach full name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'Experienced fitness coach specializing in strength training and nutrition', required: false })
  @IsString()
  @IsOptional()
  bio?: string | null;

  @ApiProperty({ example: 'Strength Training, Nutrition', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  specialization?: string | null;

  @ApiProperty({ example: 5, description: 'Years of professional experience', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number | null;

  @ApiProperty({ example: 'CPR, NASM Certified Personal Trainer', required: false })
  @IsString()
  @IsOptional()
  certifications?: string | null;

  @ApiProperty({ example: '/uploads/profiles/john-doe-profile.jpg', description: 'URL to profile image', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  profileImageUrl?: string | null;
}

/** Trainee-specific fields for sign-up (trainee profile) */
export class TraineeProfileDto {
  @ApiProperty({ example: 'John Trainee', description: 'Trainee full name (optional override)' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fullName?: string;

  @ApiProperty({ example: 'male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: '1995-05-10', description: 'Date of birth' })
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 175.5, description: 'Height in centimeters', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(300)
  heightCm?: number | null;

  @ApiProperty({ example: 70.5, description: 'Weight in kilograms', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(500)
  weightKg?: number | null;

  @ApiProperty({ example: 'Build muscle, lose fat', required: false })
  @IsString()
  @IsOptional()
  fitnessGoal?: string | null;

  @ApiProperty({ example: 'lightly_active', required: false })
  @IsString()
  @IsOptional()
  activityLevel?: string | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  medicalNotes?: string | null;
}

export class SignUpDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  lastName?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'SecurePass123', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({ example: 'SecurePass123' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({ example: 'COACH', enum: ['COACH', 'TRAINEE'] })
  @IsString()
  @IsIn(['COACH', 'TRAINEE'], { message: 'role must be COACH or TRAINEE' })
  role: 'COACH' | 'TRAINEE';

  @ApiProperty({ type: CoachProfileDto, required: false })
  @ValidateIf((o) => o.role === 'COACH')
  @ValidateNested()
  @Type(() => CoachProfileDto)
  @IsOptional()
  coachProfile?: CoachProfileDto;

  @ApiProperty({ type: TraineeProfileDto, required: false })
  @ValidateIf((o) => o.role === 'TRAINEE')
  @ValidateNested()
  @Type(() => TraineeProfileDto)
  @IsOptional()
  traineeProfile?: TraineeProfileDto;
}
