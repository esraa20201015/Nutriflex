import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TraineeProgress } from './entities/trainee-progress.entity';
import { TraineeProgressPeriodType } from './enums/trainee-progress-period-type.enum';

@Injectable()
export class TraineeProgressRepo extends Repository<TraineeProgress> {
  constructor(private dataSource: DataSource) {
    super(TraineeProgress, dataSource.createEntityManager());
  }

  async createEntity(dto: Partial<TraineeProgress>) {
    try {
      const entity = this.create(dto);
      const saved = await this.save(entity);
      const result = await this.findOne({
        where: { id: saved.id },
        relations: ['trainee'],
      });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Trainee progress created successfully',
        messageAr: 'تم إنشاء تقدم المتدرب بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating trainee progress',
        messageAr: 'خطأ في إنشاء تقدم المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    period_type?: TraineeProgressPeriodType;
    trainee_id?: string;
  }) {
    try {
      const query = this.createQueryBuilder('trainee_progress')
        .leftJoinAndSelect('trainee_progress.trainee', 'trainee');

      if (options?.period_type !== undefined) {
        query.andWhere('trainee_progress.period_type = :period_type', {
          period_type: options.period_type,
        });
      }

      if (options?.trainee_id) {
        query.andWhere('trainee_progress.trainee_id = :trainee_id', {
          trainee_id: options.trainee_id,
        });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query
        .orderBy('trainee_progress.period_start', 'DESC')
        .addOrderBy('trainee_progress.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee progress records retrieved successfully',
        messageAr: 'تم استرجاع سجلات تقدم المتدربين بنجاح',
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
        messageEn: 'Error retrieving trainee progress records',
        messageAr: 'خطأ في استرجاع سجلات تقدم المتدربين',
        error: (error as Error).message,
      };
    }
  }

  async findById(id: string) {
    try {
      const entity = await this.findOne({
        where: { id },
        relations: ['trainee'],
      });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Trainee progress not found',
          messageAr: 'سجل تقدم المتدرب غير موجود',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee progress retrieved successfully',
        messageAr: 'تم استرجاع سجل تقدم المتدرب بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving trainee progress',
        messageAr: 'خطأ في استرجاع سجل تقدم المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(id: string, dto: Partial<TraineeProgress>) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Trainee progress not found',
          messageAr: 'سجل تقدم المتدرب غير موجود',
          data: null,
        };
      }

      if (dto.period_type !== undefined) entity.period_type = dto.period_type;
      if (dto.period_start !== undefined) entity.period_start = dto.period_start;
      if (dto.period_end !== undefined) entity.period_end = dto.period_end;
      if (dto.summary !== undefined) entity.summary = dto.summary;
      if (dto.coach_notes !== undefined) entity.coach_notes = dto.coach_notes ?? null;

      await this.save(entity);
      const updated = await this.findOne({
        where: { id },
        relations: ['trainee'],
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee progress updated successfully',
        messageAr: 'تم تحديث سجل تقدم المتدرب بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating trainee progress',
        messageAr: 'خطأ في تحديث سجل تقدم المتدرب',
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
          messageEn: 'Trainee progress not found',
          messageAr: 'سجل تقدم المتدرب غير موجود',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee progress deleted successfully',
        messageAr: 'تم حذف سجل تقدم المتدرب بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting trainee progress',
        messageAr: 'خطأ في حذف سجل تقدم المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    period_type?: TraineeProgressPeriodType;
    trainee_id?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('trainee_progress')
        .leftJoinAndSelect('trainee_progress.trainee', 'trainee');

      if (options.period_type !== undefined) {
        query.andWhere('trainee_progress.period_type = :period_type', {
          period_type: options.period_type,
        });
      }

      if (options.trainee_id) {
        query.andWhere('trainee_progress.trainee_id = :trainee_id', {
          trainee_id: options.trainee_id,
        });
      }

      if (options.search) {
        query.andWhere(
          '(trainee_progress.summary ILIKE :search OR trainee_progress.coach_notes ILIKE :search)',
          { search: `%${options.search}%` },
        );
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query
        .orderBy('trainee_progress.period_start', 'DESC')
        .addOrderBy('trainee_progress.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee progress search completed',
        messageAr: 'تم البحث في سجلات تقدم المتدربين بنجاح',
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
        messageEn: 'Error searching trainee progress',
        messageAr: 'خطأ في البحث في سجلات تقدم المتدربين',
        error: (error as Error).message,
      };
    }
  }
}

