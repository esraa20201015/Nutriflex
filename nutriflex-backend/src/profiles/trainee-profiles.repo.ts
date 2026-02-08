import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TraineeProfile } from './entities/trainee-profile.entity';

@Injectable()
export class TraineeProfilesRepo extends Repository<TraineeProfile> {
  constructor(private dataSource: DataSource) {
    super(TraineeProfile, dataSource.createEntityManager());
  }

  async createEntity(dto: Partial<TraineeProfile>) {
    try {
      const entity = this.create(dto);
      const saved = await this.save(entity);
      const result = await this.findOne({
        where: { id: saved.id },
        relations: ['user'],
      });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Trainee profile created successfully',
        messageAr: 'تم إنشاء ملف المتدرب بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating trainee profile',
        messageAr: 'خطأ في إنشاء ملف المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: { skip?: number; take?: number }) {
    try {
      const query = this.createQueryBuilder('trainee_profile').leftJoinAndSelect(
        'trainee_profile.user',
        'user',
      );

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query.orderBy('trainee_profile.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee profiles retrieved successfully',
        messageAr: 'تم استرجاع ملفات المتدربين بنجاح',
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
        messageEn: 'Error retrieving trainee profiles',
        messageAr: 'خطأ في استرجاع ملفات المتدربين',
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
          messageEn: 'Trainee profile not found',
          messageAr: 'ملف المتدرب غير موجود',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee profile retrieved successfully',
        messageAr: 'تم استرجاع ملف المتدرب بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving trainee profile',
        messageAr: 'خطأ في استرجاع ملف المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(id: string, dto: Partial<TraineeProfile>) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Trainee profile not found',
          messageAr: 'ملف المتدرب غير موجود',
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
        messageEn: 'Trainee profile updated successfully',
        messageAr: 'تم تحديث ملف المتدرب بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating trainee profile',
        messageAr: 'خطأ في تحديث ملف المتدرب',
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
          messageEn: 'Trainee profile not found',
          messageAr: 'ملف المتدرب غير موجود',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee profile deleted successfully',
        messageAr: 'تم حذف ملف المتدرب بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting trainee profile',
        messageAr: 'خطأ في حذف ملف المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    search?: string;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('trainee_profile')
        .leftJoinAndSelect('trainee_profile.user', 'user');

      if (options.search) {
        query.andWhere(
          '(trainee_profile.full_name ILIKE :search OR trainee_profile.fitness_goal ILIKE :search)',
          { search: `%${options.search}%` },
        );
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query.orderBy('trainee_profile.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee profile search completed',
        messageAr: 'تم البحث في ملفات المتدربين بنجاح',
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
        messageEn: 'Error searching trainee profiles',
        messageAr: 'خطأ في البحث في ملفات المتدربين',
        error: (error as Error).message,
      };
    }
  }
}

