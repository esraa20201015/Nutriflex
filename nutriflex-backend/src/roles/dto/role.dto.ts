import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { RoleStatus } from '../enums/role-status.enum';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name (e.g. ADMIN, COACH, TRAINEE)', example: 'COACH' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Role description', example: 'Coach / trainer', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'Role status', example: RoleStatus.ACTIVE, enum: RoleStatus, required: false })
  @IsEnum(RoleStatus)
  @IsOptional()
  status?: RoleStatus;

  @ApiProperty({ description: 'Created by user ID', example: null, required: false })
  @IsString()
  @IsOptional()
  createdBy?: string | null;
}

export class UpdateRoleDto {
  @ApiProperty({ example: 'COACH', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ example: RoleStatus.ACTIVE, enum: RoleStatus, required: false })
  @IsEnum(RoleStatus)
  @IsOptional()
  status?: RoleStatus;

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

  @ApiProperty({ example: RoleStatus.ACTIVE, enum: RoleStatus, required: false })
  @IsEnum(RoleStatus)
  @IsOptional()
  status?: RoleStatus;
}

export class SearchRoleDto {
  @ApiProperty({ example: 'keyword or role name', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: RoleStatus.ACTIVE, enum: RoleStatus, required: false })
  @IsEnum(RoleStatus)
  @IsOptional()
  status?: RoleStatus;
}
