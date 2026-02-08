import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BodyMeasurement } from './entities/body-measurement.entity';

@Injectable()
export class BodyMeasurementRepo extends Repository<BodyMeasurement> {
  constructor(private dataSource: DataSource) {
    super(BodyMeasurement, dataSource.createEntityManager());
  }

  async createEntity(dto: Partial<BodyMeasurement>) {
    try {
      const entity = this.create(dto);
      const saved = await this.save(entity);
      const result = await this.findOne({
        where: { id: saved.id },
        relations: ['trainee'],
      });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Body measurement created successfully',
        messageAr: 'تم إنشاء قياس الجسم بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating body measurement',
        messageAr: 'خطأ في إنشاء قياس الجسم',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: { skip?: number; take?: number; trainee_id?: string }) {
    try {
      const query = this.createQueryBuilder('body_measurement')
        .leftJoinAndSelect('body_measurement.trainee', 'trainee');

      if (options?.trainee_id) {
        query.andWhere('body_measurement.trainee_id = :trainee_id', {
          trainee_id: options.trainee_id,
        });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query
        .orderBy('body_measurement.measured_date', 'DESC')
        .addOrderBy('body_measurement.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Body measurements retrieved successfully',
        messageAr: 'تم استرجاع قياسات الجسم بنجاح',
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
        messageEn: 'Error retrieving body measurements',
        messageAr: 'خطأ في استرجاع قياسات الجسم',
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
          messageEn: 'Body measurement not found',
          messageAr: 'قياس الجسم غير موجود',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Body measurement retrieved successfully',
        messageAr: 'تم استرجاع قياس الجسم بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving body measurement',
        messageAr: 'خطأ في استرجاع قياس الجسم',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(id: string, dto: Partial<BodyMeasurement>) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Body measurement not found',
          messageAr: 'قياس الجسم غير موجود',
          data: null,
        };
      }

      if (dto.chest_cm !== undefined) entity.chest_cm = dto.chest_cm ?? null;
      if (dto.waist_cm !== undefined) entity.waist_cm = dto.waist_cm ?? null;
      if (dto.hips_cm !== undefined) entity.hips_cm = dto.hips_cm ?? null;
      if (dto.arm_cm !== undefined) entity.arm_cm = dto.arm_cm ?? null;
      if (dto.thigh_cm !== undefined) entity.thigh_cm = dto.thigh_cm ?? null;
      if (dto.measured_date !== undefined) {
        entity.measured_date =
          dto.measured_date instanceof Date
            ? dto.measured_date
            : new Date(dto.measured_date);
      }

      await this.save(entity);
      const updated = await this.findOne({
        where: { id },
        relations: ['trainee'],
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Body measurement updated successfully',
        messageAr: 'تم تحديث قياس الجسم بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating body measurement',
        messageAr: 'خطأ في تحديث قياس الجسم',
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
          messageEn: 'Body measurement not found',
          messageAr: 'قياس الجسم غير موجود',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Body measurement deleted successfully',
        messageAr: 'تم حذف قياس الجسم بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting body measurement',
        messageAr: 'خطأ في حذف قياس الجسم',
        error: (error as Error).message,
      };
    }
  }

  async search(options: { trainee_id?: string; skip?: number; take?: number }) {
    try {
      const query = this.createQueryBuilder('body_measurement')
        .leftJoinAndSelect('body_measurement.trainee', 'trainee');

      if (options.trainee_id) {
        query.andWhere('body_measurement.trainee_id = :trainee_id', {
          trainee_id: options.trainee_id,
        });
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query
        .orderBy('body_measurement.measured_date', 'DESC')
        .addOrderBy('body_measurement.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Body measurement search completed',
        messageAr: 'تم البحث في قياسات الجسم بنجاح',
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
        messageEn: 'Error searching body measurements',
        messageAr: 'خطأ في البحث في قياسات الجسم',
        error: (error as Error).message,
      };
    }
  }
}

