import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CoachProfile } from './entities/coach-profile.entity';

@Injectable()
export class CoachProfilesRepo extends Repository<CoachProfile> {
  constructor(private dataSource: DataSource) {
    super(CoachProfile, dataSource.createEntityManager());
  }

  async createEntity(dto: Partial<CoachProfile>) {
    try {
      const entity = this.create(dto);
      const saved = await this.save(entity);
      const result = await this.findOne({
        where: { id: saved.id },
        relations: ['user'],
      });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Coach profile created successfully',
        messageAr: 'تم إنشاء ملف المدرب بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating coach profile',
        messageAr: 'خطأ في إنشاء ملف المدرب',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: { skip?: number; take?: number; status?: boolean }) {
    try {
      const query = this.createQueryBuilder('coach_profile').leftJoinAndSelect(
        'coach_profile.user',
        'user',
      );

      if (options?.status !== undefined) {
        query.andWhere('coach_profile.status = :status', { status: options.status });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query.orderBy('coach_profile.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Coach profiles retrieved successfully',
        messageAr: 'تم استرجاع ملفات المدربين بنجاح',
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
        messageEn: 'Error retrieving coach profiles',
        messageAr: 'خطأ في استرجاع ملفات المدربين',
        error: (error as Error).message,
      };
    }
  }

  async findById(id: string) {
    try {
      const entity = await this.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Coach profile not found',
          messageAr: 'ملف المدرب غير موجود',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Coach profile retrieved successfully',
        messageAr: 'تم استرجاع ملف المدرب بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving coach profile',
        messageAr: 'خطأ في استرجاع ملف المدرب',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(id: string, dto: Partial<CoachProfile>) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Coach profile not found',
          messageAr: 'ملف المدرب غير موجود',
          data: null,
        };
      }

      Object.assign(entity, dto);
      await this.save(entity);
      const updated = await this.findOne({
        where: { id },
        relations: ['user'],
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Coach profile updated successfully',
        messageAr: 'تم تحديث ملف المدرب بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating coach profile',
        messageAr: 'خطأ في تحديث ملف المدرب',
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
          messageEn: 'Coach profile not found',
          messageAr: 'ملف المدرب غير موجود',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Coach profile deleted successfully',
        messageAr: 'تم حذف ملف المدرب بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting coach profile',
        messageAr: 'خطأ في حذف ملف المدرب',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    search?: string;
    status?: boolean;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('coach_profile').leftJoinAndSelect(
        'coach_profile.user',
        'user',
      );

      if (options.search) {
        query.andWhere(
          '(coach_profile.full_name ILIKE :search OR coach_profile.specialization ILIKE :search OR coach_profile.certifications ILIKE :search)',
          { search: `%${options.search}%` },
        );
      }

      if (options.status !== undefined) {
        query.andWhere('coach_profile.status = :status', { status: options.status });
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query.orderBy('coach_profile.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Coach profile search completed',
        messageAr: 'تم البحث في ملفات المدربين بنجاح',
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
        messageEn: 'Error searching coach profiles',
        messageAr: 'خطأ في البحث في ملفات المدربين',
        error: (error as Error).message,
      };
    }
  }

  async toggleStatus(id: string) {
    const found = await this.findById(id);
    if ((found as { status?: number }).status !== 200) return found;
    const entity = (found as { data: CoachProfile }).data;
    return this.updateEntity(id, { status: !entity.status });
  }
}
