import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CoachTrainee } from './entities/coach-trainee.entity';
import { CoachTraineeStatus } from './enums/coach-trainee-status.enum';

@Injectable()
export class CoachTraineeRepo extends Repository<CoachTrainee> {
  constructor(private dataSource: DataSource) {
    super(CoachTrainee, dataSource.createEntityManager());
  }

  async createEntity(dto: Partial<CoachTrainee>) {
    try {
      const entity = this.create({
        coach_id: dto.coach_id,
        trainee_id: dto.trainee_id,
        start_date: dto.start_date ? new Date(dto.start_date) : new Date(),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        status: dto.status ?? CoachTraineeStatus.ACTIVE,
      });
      const saved = await this.save(entity);
      const result = await this.findOne({
        where: { id: saved.id },
        relations: ['coach', 'trainee'],
      });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Coach-trainee relationship created successfully',
        messageAr: 'تم إنشاء علاقة المدرب-المتدرب بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating coach-trainee relationship',
        messageAr: 'خطأ في إنشاء علاقة المدرب-المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    status?: CoachTraineeStatus;
    coach_id?: string;
    trainee_id?: string;
  }) {
    try {
      const query = this.createQueryBuilder('coach_trainee')
        .leftJoinAndSelect('coach_trainee.coach', 'coach')
        .leftJoinAndSelect('coach_trainee.trainee', 'trainee');

      if (options?.status !== undefined) {
        query.andWhere('coach_trainee.status = :status', { status: options.status });
      }

      if (options?.coach_id) {
        query.andWhere('coach_trainee.coach_id = :coach_id', { coach_id: options.coach_id });
      }

      if (options?.trainee_id) {
        query.andWhere('coach_trainee.trainee_id = :trainee_id', { trainee_id: options.trainee_id });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query.orderBy('coach_trainee.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Coach-trainee relationships retrieved successfully',
        messageAr: 'تم استرجاع علاقات المدرب-المتدرب بنجاح',
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
        messageEn: 'Error retrieving coach-trainee relationships',
        messageAr: 'خطأ في استرجاع علاقات المدرب-المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async findById(id: string) {
    try {
      const entity = await this.findOne({
        where: { id },
        relations: ['coach', 'trainee'],
      });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Coach-trainee relationship not found',
          messageAr: 'علاقة المدرب-المتدرب غير موجودة',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Coach-trainee relationship retrieved successfully',
        messageAr: 'تم استرجاع علاقة المدرب-المتدرب بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving coach-trainee relationship',
        messageAr: 'خطأ في استرجاع علاقة المدرب-المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(id: string, dto: Partial<CoachTrainee>) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Coach-trainee relationship not found',
          messageAr: 'علاقة المدرب-المتدرب غير موجودة',
          data: null,
        };
      }

      if (dto.start_date !== undefined) {
        entity.start_date = dto.start_date instanceof Date ? dto.start_date : new Date(dto.start_date);
      }
      if (dto.end_date !== undefined) {
        entity.end_date = dto.end_date ? (dto.end_date instanceof Date ? dto.end_date : new Date(dto.end_date)) : null;
      }
      if (dto.status !== undefined) {
        entity.status = dto.status;
      }

      await this.save(entity);
      const updated = await this.findOne({
        where: { id },
        relations: ['coach', 'trainee'],
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Coach-trainee relationship updated successfully',
        messageAr: 'تم تحديث علاقة المدرب-المتدرب بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating coach-trainee relationship',
        messageAr: 'خطأ في تحديث علاقة المدرب-المتدرب',
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
          messageEn: 'Coach-trainee relationship not found',
          messageAr: 'علاقة المدرب-المتدرب غير موجودة',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Coach-trainee relationship deleted successfully',
        messageAr: 'تم حذف علاقة المدرب-المتدرب بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting coach-trainee relationship',
        messageAr: 'خطأ في حذف علاقة المدرب-المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    search?: string;
    status?: CoachTraineeStatus;
    coach_id?: string;
    trainee_id?: string;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('coach_trainee')
        .leftJoinAndSelect('coach_trainee.coach', 'coach')
        .leftJoinAndSelect('coach_trainee.trainee', 'trainee');

      if (options.search) {
        query.andWhere(
          '(coach.full_name ILIKE :search OR trainee.full_name ILIKE :search)',
          { search: `%${options.search}%` },
        );
      }

      if (options.status !== undefined) {
        query.andWhere('coach_trainee.status = :status', { status: options.status });
      }

      if (options.coach_id) {
        query.andWhere('coach_trainee.coach_id = :coach_id', { coach_id: options.coach_id });
      }

      if (options.trainee_id) {
        query.andWhere('coach_trainee.trainee_id = :trainee_id', { trainee_id: options.trainee_id });
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query.orderBy('coach_trainee.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Coach-trainee relationship search completed',
        messageAr: 'تم البحث في علاقات المدرب-المتدرب بنجاح',
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
        messageEn: 'Error searching coach-trainee relationships',
        messageAr: 'خطأ في البحث في علاقات المدرب-المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async toggleStatus(id: string) {
    const found = await this.findById(id);
    if ((found as { status?: number }).status !== 200) return found;
    const entity = (found as { data: CoachTrainee }).data;
    const newStatus =
      entity.status === CoachTraineeStatus.ACTIVE
        ? CoachTraineeStatus.PAUSED
        : entity.status === CoachTraineeStatus.PAUSED
          ? CoachTraineeStatus.COMPLETED
          : CoachTraineeStatus.ACTIVE;
    return this.updateEntity(id, { status: newStatus });
  }

  // ======= New method to get all trainees for a coach =======
  async getTraineesByCoach(coach_id: string) {
    try {
      const result = await this.findAll({ coach_id, status: CoachTraineeStatus.ACTIVE });
      const trainees = result.data?.map(rel => ({
        traineeId: rel.trainee_id,
        fullName: rel.trainee?.fullName ?? 'Unknown',
      })) ?? [];
      return {
        status: HttpStatus.OK,
        messageEn: 'Trainees retrieved successfully',
        messageAr: 'تم استرجاع المتدربين بنجاح',
        data: trainees,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving trainees',
        messageAr: 'خطأ في استرجاع المتدربين',
        error: (error as Error).message,
      };
    }
  }
}
