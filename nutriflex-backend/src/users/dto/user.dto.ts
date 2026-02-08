import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEmail,
  MinLength,
  IsEnum,
} from 'class-validator';
import { UserStatus } from '../enums/user-status.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({ description: 'Password', example: 'SecurePass123', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Role ID (required – every user has exactly one role)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({ description: 'Email verified', example: false })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiProperty({ description: 'Status', example: UserStatus.ACTIVE, enum: UserStatus })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiProperty({ description: 'Created by user ID', example: null })
  @IsString()
  @IsOptional()
  createdBy?: string | null;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fullName?: string;

  @ApiProperty({ example: 'updated@example.com', required: false })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ description: 'Avatar image URL', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiProperty({ description: 'New password (optional)', minLength: 8, required: false })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiProperty({ example: UserStatus.ACTIVE, enum: UserStatus, required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiProperty({ description: 'Role ID', required: false })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  @IsString()
  @IsOptional()
  updatedBy?: string | null;
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

  @ApiProperty({ example: UserStatus.ACTIVE, enum: UserStatus, required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}

export class SearchUserDto {
  @ApiProperty({ example: 'keyword or email', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: UserStatus.ACTIVE, enum: UserStatus, required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
