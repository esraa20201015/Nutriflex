import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleStatus } from './enums/role-status.enum';

@Injectable()
export class RolesRepo extends Repository<Role> {
  constructor(private dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async createEntity(dto: {
    name: string;
    description?: string | null;
    status?: RoleStatus;
    createdBy?: string | null;
  }) {
    try {
      const entity = this.create({
        name: dto.name.trim().toUpperCase(),
        description: dto.description?.trim() ?? null,
        status: dto.status ?? RoleStatus.ACTIVE,
        createdBy: dto.createdBy ?? null,
      });
      const saved = await this.save(entity);
      const result = await this.findOne({ where: { id: saved.id } });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Role created successfully',
        messageAr: 'تم إنشاء الدور بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating role',
        messageAr: 'خطأ في إنشاء الدور',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: { skip?: number; take?: number; status?: RoleStatus }) {
    try {
      const query = this.createQueryBuilder('role');

      if (options?.status !== undefined) {
        query.andWhere('role.status = :status', { status: options.status });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query.orderBy('role.createdAt', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Roles retrieved successfully',
        messageAr: 'تم استرجاع الأدوار بنجاح',
        data: rows,
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
        messageEn: 'Error retrieving roles',
        messageAr: 'خطأ في استرجاع الأدوار',
        error: (error as Error).message,
      };
    }
  }

  async findById(id: string) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Role not found',
          messageAr: 'الدور غير موجود',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Role retrieved successfully',
        messageAr: 'تم استرجاع الدور بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving role',
        messageAr: 'خطأ في استرجاع الدور',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(
    id: string,
    dto: Partial<Pick<Role, 'name' | 'description' | 'status' | 'updatedBy'>>,
  ) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Role not found',
          messageAr: 'الدور غير موجود',
          data: null,
        };
      }

      if (dto.name !== undefined) entity.name = dto.name.trim().toUpperCase();
      if (dto.description !== undefined) entity.description = dto.description?.trim() ?? null;
      if (dto.status !== undefined) entity.status = dto.status;
      if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy;

      await this.save(entity);
      const updated = await this.findOne({ where: { id } });

      return {
        status: HttpStatus.OK,
        messageEn: 'Role updated successfully',
        messageAr: 'تم تحديث الدور بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating role',
        messageAr: 'خطأ في تحديث الدور',
        error: (error as Error).message,
      };
    }
  }

  async deleteEntity(id: string) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Role not found',
          messageAr: 'الدور غير موجود',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Role deleted successfully',
        messageAr: 'تم حذف الدور بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting role',
        messageAr: 'خطأ في حذف الدور',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    search?: string;
    status?: RoleStatus;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('role');

      if (options.search) {
        query.andWhere(
          '(role.name ILIKE :search OR role.description ILIKE :search)',
          {
            search: `%${options.search}%`,
          },
        );
      }

      if (options.status !== undefined) {
        query.andWhere('role.status = :status', { status: options.status });
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query.orderBy('role.createdAt', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Role search completed',
        messageAr: 'تم البحث في الأدوار بنجاح',
        data: rows,
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
        messageEn: 'Error searching roles',
        messageAr: 'خطأ في البحث في الأدوار',
        error: (error as Error).message,
      };
    }
  }

  async toggleStatus(id: string) {
    const found = await this.findById(id);
    if ((found as { status?: number }).status !== 200) return found;
    const entity = (found as { data: Role }).data;
    const newStatus =
      entity.status === RoleStatus.ACTIVE ? RoleStatus.INACTIVE : RoleStatus.ACTIVE;
    return this.updateEntity(id, { status: newStatus });
  }
}
