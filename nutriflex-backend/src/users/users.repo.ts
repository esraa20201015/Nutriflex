import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserStatus } from './enums/user-status.enum';

/** Remove passwordHash from user object for API responses */
function sanitizeUser<T extends Partial<User>>(user: T): Omit<T, 'passwordHash'> {
  if (!user) return user;
  const { passwordHash: _, ...rest } = user;
  return rest as Omit<T, 'passwordHash'>;
}

@Injectable()
export class UsersRepo extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createEntity(dto: {
    fullName: string;
    email: string;
    passwordHash: string;
    roleId: string;
    status?: UserStatus;
    isEmailVerified?: boolean;
    createdBy?: string | null;
  }) {
    try {
      const entity = this.create({
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        passwordHash: dto.passwordHash,
        role: { id: dto.roleId },
        status: dto.status ?? UserStatus.ACTIVE,
        isEmailVerified: dto.isEmailVerified ?? false,
        createdBy: dto.createdBy ?? null,
      });
      const saved = await this.save(entity);
      const result = await this.findOne({ where: { id: saved.id }, relations: ['role'] });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'User created successfully',
        messageAr: 'تم إنشاء المستخدم بنجاح',
        data: sanitizeUser(result!),
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating user',
        messageAr: 'خطأ في إنشاء المستخدم',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: { skip?: number; take?: number; status?: UserStatus }) {
    try {
      const query = this.createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role');

      if (options?.status !== undefined) {
        query.andWhere('user.status = :status', { status: options.status });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query.orderBy('user.createdAt', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Users retrieved successfully',
        messageAr: 'تم استرجاع المستخدمين بنجاح',
        data: rows.map((row) => sanitizeUser(row)),
        meta: {
          total,
          count: rows.length,
          skip: options?.skip ?? 0,
          take: options?.take ?? total,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving users',
        messageAr: 'خطأ في استرجاع المستخدمين',
        error: (error as Error).message,
      };
    }
  }

  async findById(id: string) {
    try {
      const entity = await this.findOne({ where: { id }, relations: ['role'] });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'User not found',
          messageAr: 'المستخدم غير موجود',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'User retrieved successfully',
        messageAr: 'تم استرجاع المستخدم بنجاح',
        data: sanitizeUser(entity),
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving user',
        messageAr: 'خطأ في استرجاع المستخدم',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(
    id: string,
    dto: Partial<
      Pick<
        User,
        | 'fullName'
        | 'email'
        | 'passwordHash'
        | 'status'
        | 'isEmailVerified'
        | 'updatedBy'
        | 'emailVerificationToken'
        | 'emailVerificationExpires'
        | 'avatarUrl'
      >
    > & { roleId?: string },
  ) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'User not found',
          messageAr: 'المستخدم غير موجود',
          data: null,
        };
      }

      if (dto.fullName !== undefined) entity.fullName = dto.fullName.trim();
      if (dto.email !== undefined) entity.email = dto.email.trim().toLowerCase();
      if (dto.passwordHash !== undefined) entity.passwordHash = dto.passwordHash;
      if (dto.roleId !== undefined) entity.role = { id: dto.roleId } as User['role'];
      if (dto.status !== undefined) entity.status = dto.status;
      if (dto.isEmailVerified !== undefined) entity.isEmailVerified = dto.isEmailVerified;
      if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy;
      if (dto.emailVerificationToken !== undefined) entity.emailVerificationToken = dto.emailVerificationToken;
      if (dto.emailVerificationExpires !== undefined) entity.emailVerificationExpires = dto.emailVerificationExpires;
      if (dto.avatarUrl !== undefined) entity.avatarUrl = dto.avatarUrl;

      await this.save(entity);
      const updated = await this.findOne({ where: { id }, relations: ['role'] });

      return {
        status: HttpStatus.OK,
        messageEn: 'User updated successfully',
        messageAr: 'تم تحديث المستخدم بنجاح',
        data: sanitizeUser(updated!),
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating user',
        messageAr: 'خطأ في تحديث المستخدم',
        error: (error as Error).message,
      };
    }
  }

  async updateVerificationToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.update(
      { id: userId },
      {
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt,
      },
    );
  }

  async deleteEntity(id: string) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'User not found',
          messageAr: 'المستخدم غير موجود',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'User deleted successfully',
        messageAr: 'تم حذف المستخدم بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting user',
        messageAr: 'خطأ في حذف المستخدم',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    search?: string;
    status?: UserStatus;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role');

      if (options.search) {
        query.andWhere('user.email ILIKE :search', {
          search: `%${options.search}%`,
        });
      }

      if (options.status !== undefined) {
        query.andWhere('user.status = :status', { status: options.status });
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query.orderBy('user.createdAt', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'User search completed',
        messageAr: 'تم البحث في المستخدمين بنجاح',
        data: rows.map((row) => sanitizeUser(row)),
        meta: {
          total,
          count: rows.length,
          skip: options?.skip ?? 0,
          take: options?.take ?? total,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error searching users',
        messageAr: 'خطأ في البحث في المستخدمين',
        error: (error as Error).message,
      };
    }
  }

  async toggleStatus(id: string) {
    const found = await this.findById(id);
    if ((found as { status?: number }).status !== 200) return found;
    const entity = (found as unknown as { data: User }).data;
    const newStatus =
      entity.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    return this.updateEntity(id, { status: newStatus });
  }
}
