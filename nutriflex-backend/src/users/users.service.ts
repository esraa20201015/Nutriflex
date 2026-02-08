import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersRepo } from './users.repo';
import {
  CreateUserDto,
  UpdateUserDto,
  PaginationDto,
  SearchUserDto,
} from './dto/user.dto';
import { User } from './entities/user.entity';

/**
 * Normalize email for storage and lookup: lowercase and trim.
 */
export function normalizeEmail(email: string): string {
  return email?.trim().toLowerCase() ?? '';
}

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepo) {}

  /** For auth guard: returns User or null (do not use for API response). */
  async findUserById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  /** Returns user with role relation (e.g. for JWT payload). */
  async findUserByIdWithRole(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: ['role'] });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email: normalizeEmail(email) },
      relations: ['role'], // Load role relation for auth operations
    });
  }

  async updateLastLoginAt(userId: string): Promise<void> {
    await this.repo.update(
      { id: userId },
      { lastLoginAt: new Date() },
    );
  }

  async verifyEmailByToken(token: string): Promise<User | null> {
    const user = await this.repo.findOne({
      where: { emailVerificationToken: token },
    });
    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return null;
    }
    await this.repo.update(
      { id: user.id },
      {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    );
    return this.repo.findOne({ where: { id: user.id } });
  }

  /**
   * Generate a secure random token for email verification
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Save verification token for a user
   */
  async saveVerificationToken(userId: string, token: string, expiresInHours: number = 24): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    await this.repo.updateVerificationToken(userId, token, expiresAt);
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.repo.createEntity({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      roleId: dto.roleId,
      status: dto.status,
      isEmailVerified: dto.isEmailVerified,
      createdBy: dto.createdBy ?? null,
    });
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  async update(id: string, dto: UpdateUserDto) {
    const payload: Parameters<UsersRepo['updateEntity']>[1] = {
      fullName: dto.fullName,
      email: dto.email,
      roleId: dto.roleId,
      status: dto.status,
      isEmailVerified: dto.isEmailVerified,
      updatedBy: dto.updatedBy ?? undefined,
    };
    if (dto.password) {
      payload.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    if (dto.avatarUrl !== undefined) {
      (payload as any).avatarUrl = dto.avatarUrl;
    }
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchUserDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }

  toggleStatus(id: string) {
    return this.repo.toggleStatus(id);
  }
}
