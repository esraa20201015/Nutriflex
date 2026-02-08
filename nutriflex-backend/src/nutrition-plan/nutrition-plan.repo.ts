import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NutritionPlan } from './entities/nutrition-plan.entity';
import { NutritionPlanStatus } from './enums/nutrition-plan-status.enum';

@Injectable()
export class NutritionPlanRepo extends Repository<NutritionPlan> {
  constructor(private dataSource: DataSource) {
    super(NutritionPlan, dataSource.createEntityManager());
  }

  async createEntity(dto: Partial<NutritionPlan>) {
    try {
      const entity = this.create({
        coach_id: dto.coach_id,
        trainee_id: dto.trainee_id,
        title: dto.title,
        description: dto.description ?? null,
        daily_calories: dto.daily_calories ?? null,
        start_date: dto.start_date ? new Date(dto.start_date) : new Date(),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        status: dto.status ?? NutritionPlanStatus.DRAFT,
      });
      const saved = await this.save(entity);
      const result = await this.findOne({
        where: { id: saved.id },
        relations: ['coach', 'trainee'],
      });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Nutrition plan created successfully',
        messageAr: 'تم إنشاء خطة التغذية بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating nutrition plan',
        messageAr: 'خطأ في إنشاء خطة التغذية',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    status?: NutritionPlanStatus;
    coach_id?: string;
    trainee_id?: string;
  }) {
    try {
      const query = this.createQueryBuilder('nutrition_plan')
        .leftJoinAndSelect('nutrition_plan.coach', 'coach')
        .leftJoinAndSelect('nutrition_plan.trainee', 'trainee');

      if (options?.status !== undefined) {
        query.andWhere('nutrition_plan.status = :status', { status: options.status });
      }

      if (options?.coach_id) {
        query.andWhere('nutrition_plan.coach_id = :coach_id', { coach_id: options.coach_id });
      }

      if (options?.trainee_id) {
        query.andWhere('nutrition_plan.trainee_id = :trainee_id', { trainee_id: options.trainee_id });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query.orderBy('nutrition_plan.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Nutrition plans retrieved successfully',
        messageAr: 'تم استرجاع خطط التغذية بنجاح',
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
        messageEn: 'Error retrieving nutrition plans',
        messageAr: 'خطأ في استرجاع خطط التغذية',
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
          messageEn: 'Nutrition plan not found',
          messageAr: 'خطة التغذية غير موجودة',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Nutrition plan retrieved successfully',
        messageAr: 'تم استرجاع خطة التغذية بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving nutrition plan',
        messageAr: 'خطأ في استرجاع خطة التغذية',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(id: string, dto: Partial<NutritionPlan>) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Nutrition plan not found',
          messageAr: 'خطة التغذية غير موجودة',
          data: null,
        };
      }

      if (dto.title !== undefined) entity.title = dto.title;
      if (dto.description !== undefined) entity.description = dto.description ?? null;
      if (dto.daily_calories !== undefined) entity.daily_calories = dto.daily_calories ?? null;
      if (dto.start_date !== undefined) {
        entity.start_date = dto.start_date instanceof Date ? dto.start_date : new Date(dto.start_date);
      }
      if (dto.end_date !== undefined) {
        entity.end_date = dto.end_date ? (dto.end_date instanceof Date ? dto.end_date : new Date(dto.end_date)) : null;
      }
      if (dto.status !== undefined) entity.status = dto.status;

      await this.save(entity);
      const updated = await this.findOne({
        where: { id },
        relations: ['coach', 'trainee'],
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Nutrition plan updated successfully',
        messageAr: 'تم تحديث خطة التغذية بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating nutrition plan',
        messageAr: 'خطأ في تحديث خطة التغذية',
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
          messageEn: 'Nutrition plan not found',
          messageAr: 'خطة التغذية غير موجودة',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Nutrition plan deleted successfully',
        messageAr: 'تم حذف خطة التغذية بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting nutrition plan',
        messageAr: 'خطأ في حذف خطة التغذية',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    search?: string;
    status?: NutritionPlanStatus;
    coach_id?: string;
    trainee_id?: string;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('nutrition_plan')
        .leftJoinAndSelect('nutrition_plan.coach', 'coach')
        .leftJoinAndSelect('nutrition_plan.trainee', 'trainee');

      if (options.search) {
        query.andWhere(
          '(nutrition_plan.title ILIKE :search OR nutrition_plan.description ILIKE :search)',
          { search: `%${options.search}%` },
        );
      }

      if (options.status !== undefined) {
        query.andWhere('nutrition_plan.status = :status', { status: options.status });
      }

      if (options.coach_id) {
        query.andWhere('nutrition_plan.coach_id = :coach_id', { coach_id: options.coach_id });
      }

      if (options.trainee_id) {
        query.andWhere('nutrition_plan.trainee_id = :trainee_id', { trainee_id: options.trainee_id });
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query.orderBy('nutrition_plan.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Nutrition plan search completed',
        messageAr: 'تم البحث في خطط التغذية بنجاح',
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
        messageEn: 'Error searching nutrition plans',
        messageAr: 'خطأ في البحث في خطط التغذية',
        error: (error as Error).message,
      };
    }
  }

  async toggleStatus(id: string) {
    const found = await this.findById(id);
    if ((found as { status?: number }).status !== 200) return found;
    const entity = (found as { data: NutritionPlan }).data;
    const newStatus =
      entity.status === NutritionPlanStatus.DRAFT
        ? NutritionPlanStatus.ACTIVE
        : entity.status === NutritionPlanStatus.ACTIVE
          ? NutritionPlanStatus.ARCHIVED
          : NutritionPlanStatus.DRAFT;
    return this.updateEntity(id, { status: newStatus });
  }
}
