import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { HealthMetric } from './entities/health-metric.entity';
import { HealthMetricType } from './enums/health-metric-type.enum';

@Injectable()
export class HealthMetricRepo extends Repository<HealthMetric> {
  constructor(private dataSource: DataSource) {
    super(HealthMetric, dataSource.createEntityManager());
  }

  async createEntity(dto: Partial<HealthMetric>) {
    try {
      const entity = this.create({
        trainee_id: dto.trainee_id,
        metric_type: dto.metric_type,
        value: dto.value,
        unit: dto.unit,
        recorded_date:
          dto.recorded_date instanceof Date
            ? dto.recorded_date
            : new Date(dto.recorded_date ?? new Date().toISOString()),
      });

      const saved = await this.save(entity);
      const result = await this.findOne({
        where: { id: saved.id },
        relations: ['trainee'],
      });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Health metric created successfully',
        messageAr: 'تم إنشاء المؤشر الصحي بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating health metric',
        messageAr: 'خطأ في إنشاء المؤشر الصحي',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    metric_type?: HealthMetricType;
    trainee_id?: string;
  }) {
    try {
      const query = this.createQueryBuilder('health_metric')
        .leftJoinAndSelect('health_metric.trainee', 'trainee');

      if (options?.metric_type !== undefined) {
        query.andWhere('health_metric.metric_type = :metric_type', {
          metric_type: options.metric_type,
        });
      }

      if (options?.trainee_id) {
        query.andWhere('health_metric.trainee_id = :trainee_id', {
          trainee_id: options.trainee_id,
        });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query.orderBy('health_metric.recorded_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Health metrics retrieved successfully',
        messageAr: 'تم استرجاع المؤشرات الصحية بنجاح',
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
        messageEn: 'Error retrieving health metrics',
        messageAr: 'خطأ في استرجاع المؤشرات الصحية',
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
          messageEn: 'Health metric not found',
          messageAr: 'المؤشر الصحي غير موجود',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Health metric retrieved successfully',
        messageAr: 'تم استرجاع المؤشر الصحي بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving health metric',
        messageAr: 'خطأ في استرجاع المؤشر الصحي',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(id: string, dto: Partial<HealthMetric>) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Health metric not found',
          messageAr: 'المؤشر الصحي غير موجود',
          data: null,
        };
      }

      if (dto.metric_type !== undefined) entity.metric_type = dto.metric_type;
      if (dto.value !== undefined) entity.value = dto.value;
      if (dto.unit !== undefined) entity.unit = dto.unit;
      if (dto.recorded_date !== undefined) {
        entity.recorded_date =
          dto.recorded_date instanceof Date
            ? dto.recorded_date
            : new Date(dto.recorded_date);
      }

      await this.save(entity);
      const updated = await this.findOne({
        where: { id },
        relations: ['trainee'],
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Health metric updated successfully',
        messageAr: 'تم تحديث المؤشر الصحي بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating health metric',
        messageAr: 'خطأ في تحديث المؤشر الصحي',
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
          messageEn: 'Health metric not found',
          messageAr: 'المؤشر الصحي غير موجود',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Health metric deleted successfully',
        messageAr: 'تم حذف المؤشر الصحي بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting health metric',
        messageAr: 'خطأ في حذف المؤشر الصحي',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    metric_type?: HealthMetricType;
    trainee_id?: string;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('health_metric')
        .leftJoinAndSelect('health_metric.trainee', 'trainee');

      if (options.metric_type !== undefined) {
        query.andWhere('health_metric.metric_type = :metric_type', {
          metric_type: options.metric_type,
        });
      }

      if (options.trainee_id) {
        query.andWhere('health_metric.trainee_id = :trainee_id', {
          trainee_id: options.trainee_id,
        });
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query.orderBy('health_metric.recorded_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Health metric search completed',
        messageAr: 'تم البحث في المؤشرات الصحية بنجاح',
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
        messageEn: 'Error searching health metrics',
        messageAr: 'خطأ في البحث في المؤشرات الصحية',
        error: (error as Error).message,
      };
    }
  }
}

