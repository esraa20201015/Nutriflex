import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TraineePlanStatus } from './entities/trainee-plan-status.entity';
import { TraineePlanStatusEnum } from './enums/trainee-plan-status.enum';

@Injectable()
export class TraineePlanStatusRepo extends Repository<TraineePlanStatus> {
  constructor(private dataSource: DataSource) {
    super(TraineePlanStatus, dataSource.createEntityManager());
  }

  async createEntity(dto: Partial<TraineePlanStatus>) {
    try {
      const now = new Date();
      const entity = this.create({
        trainee_id: dto.trainee_id,
        plan_id: dto.plan_id,
        completion_percentage: dto.completion_percentage ?? 0,
        status: dto.status ?? TraineePlanStatusEnum.NOT_STARTED,
        last_updated: dto.last_updated ?? now,
      });

      const saved = await this.save(entity);
      const result = await this.findOne({
        where: { id: saved.id },
        relations: ['trainee'],
      });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Trainee plan status created successfully',
        messageAr: 'تم إنشاء حالة خطة المتدرب بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating trainee plan status',
        messageAr: 'خطأ في إنشاء حالة خطة المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    trainee_id?: string;
    plan_id?: string;
    status?: TraineePlanStatusEnum;
  }) {
    try {
      const query = this.createQueryBuilder('trainee_plan_status')
        .leftJoinAndSelect('trainee_plan_status.trainee', 'trainee');

      if (options?.trainee_id) {
        query.andWhere('trainee_plan_status.trainee_id = :trainee_id', {
          trainee_id: options.trainee_id,
        });
      }

      if (options?.plan_id) {
        query.andWhere('trainee_plan_status.plan_id = :plan_id', {
          plan_id: options.plan_id,
        });
      }

      if (options?.status !== undefined) {
        query.andWhere('trainee_plan_status.status = :status', {
          status: options.status,
        });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query
        .orderBy('trainee_plan_status.last_updated', 'DESC')
        .addOrderBy('trainee_plan_status.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee plan statuses retrieved successfully',
        messageAr: 'تم استرجاع حالات خطط المتدربين بنجاح',
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
        messageEn: 'Error retrieving trainee plan statuses',
        messageAr: 'خطأ في استرجاع حالات خطط المتدربين',
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
          messageEn: 'Trainee plan status not found',
          messageAr: 'حالة خطة المتدرب غير موجودة',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee plan status retrieved successfully',
        messageAr: 'تم استرجاع حالة خطة المتدرب بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving trainee plan status',
        messageAr: 'خطأ في استرجاع حالة خطة المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(id: string, dto: Partial<TraineePlanStatus>) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Trainee plan status not found',
          messageAr: 'حالة خطة المتدرب غير موجودة',
          data: null,
        };
      }

      if (dto.completion_percentage !== undefined) {
        entity.completion_percentage = dto.completion_percentage;
      }

      if (dto.status !== undefined) {
        entity.status = dto.status;
      }

      entity.last_updated = dto.last_updated ?? new Date();

      await this.save(entity);
      const updated = await this.findOne({
        where: { id },
        relations: ['trainee'],
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee plan status updated successfully',
        messageAr: 'تم تحديث حالة خطة المتدرب بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating trainee plan status',
        messageAr: 'خطأ في تحديث حالة خطة المتدرب',
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
          messageEn: 'Trainee plan status not found',
          messageAr: 'حالة خطة المتدرب غير موجودة',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee plan status deleted successfully',
        messageAr: 'تم حذف حالة خطة المتدرب بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting trainee plan status',
        messageAr: 'خطأ في حذف حالة خطة المتدرب',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    trainee_id?: string;
    plan_id?: string;
    status?: TraineePlanStatusEnum;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('trainee_plan_status')
        .leftJoinAndSelect('trainee_plan_status.trainee', 'trainee');

      if (options.trainee_id) {
        query.andWhere('trainee_plan_status.trainee_id = :trainee_id', {
          trainee_id: options.trainee_id,
        });
      }

      if (options.plan_id) {
        query.andWhere('trainee_plan_status.plan_id = :plan_id', {
          plan_id: options.plan_id,
        });
      }

      if (options.status !== undefined) {
        query.andWhere('trainee_plan_status.status = :status', {
          status: options.status,
        });
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query
        .orderBy('trainee_plan_status.last_updated', 'DESC')
        .addOrderBy('trainee_plan_status.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee plan status search completed',
        messageAr: 'تم البحث في حالات خطط المتدربين بنجاح',
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
        messageEn: 'Error searching trainee plan statuses',
        messageAr: 'خطأ في البحث في حالات خطط المتدربين',
        error: (error as Error).message,
      };
    }
  }
}

