import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { MealType } from './enums/meal-type.enum';

@Injectable()
export class MealRepo extends Repository<Meal> {
  constructor(private dataSource: DataSource) {
    super(Meal, dataSource.createEntityManager());
  }

  async createEntity(dto: Partial<Meal>) {
    try {
      const entity = this.create({
        nutrition_plan_id: dto.nutrition_plan_id,
        name: dto.name,
        meal_type: dto.meal_type,
        calories: dto.calories ?? null,
        protein: dto.protein ?? null,
        carbs: dto.carbs ?? null,
        fats: dto.fats ?? null,
        instructions: dto.instructions ?? null,
        order_index: dto.order_index ?? 0,
      });
      const saved = await this.save(entity);
      const result = await this.findOne({
        where: { id: saved.id },
        relations: ['nutrition_plan'],
      });

      return {
        status: HttpStatus.CREATED,
        messageEn: 'Meal created successfully',
        messageAr: 'تم إنشاء الوجبة بنجاح',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error creating meal',
        messageAr: 'خطأ في إنشاء الوجبة',
        error: (error as Error).message,
      };
    }
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    meal_type?: MealType;
    nutrition_plan_id?: string;
  }) {
    try {
      const query = this.createQueryBuilder('meal')
        .leftJoinAndSelect('meal.nutrition_plan', 'nutrition_plan')
        .leftJoinAndSelect('meal.ingredients', 'ingredients');

      if (options?.meal_type !== undefined) {
        query.andWhere('meal.meal_type = :meal_type', { meal_type: options.meal_type });
      }

      if (options?.nutrition_plan_id) {
        query.andWhere('meal.nutrition_plan_id = :nutrition_plan_id', {
          nutrition_plan_id: options.nutrition_plan_id,
        });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query.orderBy('meal.order_index', 'ASC').addOrderBy('meal.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Meals retrieved successfully',
        messageAr: 'تم استرجاع الوجبات بنجاح',
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
        messageEn: 'Error retrieving meals',
        messageAr: 'خطأ في استرجاع الوجبات',
        error: (error as Error).message,
      };
    }
  }

  async findById(id: string) {
    try {
      const entity = await this.findOne({
        where: { id },
        relations: ['nutrition_plan', 'ingredients'],
      });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Meal not found',
          messageAr: 'الوجبة غير موجودة',
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        messageEn: 'Meal retrieved successfully',
        messageAr: 'تم استرجاع الوجبة بنجاح',
        data: entity,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving meal',
        messageAr: 'خطأ في استرجاع الوجبة',
        error: (error as Error).message,
      };
    }
  }

  async updateEntity(id: string, dto: Partial<Meal>) {
    try {
      const entity = await this.findOne({ where: { id } });

      if (!entity) {
        return {
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Meal not found',
          messageAr: 'الوجبة غير موجودة',
          data: null,
        };
      }

      if (dto.name !== undefined) entity.name = dto.name;
      if (dto.meal_type !== undefined) entity.meal_type = dto.meal_type;
      if (dto.calories !== undefined) entity.calories = dto.calories ?? null;
      if (dto.protein !== undefined) entity.protein = dto.protein ?? null;
      if (dto.carbs !== undefined) entity.carbs = dto.carbs ?? null;
      if (dto.fats !== undefined) entity.fats = dto.fats ?? null;
      if (dto.instructions !== undefined) entity.instructions = dto.instructions ?? null;
      if (dto.order_index !== undefined) entity.order_index = dto.order_index;

      await this.save(entity);
      const updated = await this.findOne({
        where: { id },
        relations: ['nutrition_plan', 'ingredients'],
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Meal updated successfully',
        messageAr: 'تم تحديث الوجبة بنجاح',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error updating meal',
        messageAr: 'خطأ في تحديث الوجبة',
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
          messageEn: 'Meal not found',
          messageAr: 'الوجبة غير موجودة',
          data: null,
        };
      }

      await this.remove(entity);

      return {
        status: HttpStatus.OK,
        messageEn: 'Meal deleted successfully',
        messageAr: 'تم حذف الوجبة بنجاح',
        data: null,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error deleting meal',
        messageAr: 'خطأ في حذف الوجبة',
        error: (error as Error).message,
      };
    }
  }

  async search(options: {
    search?: string;
    meal_type?: MealType;
    nutrition_plan_id?: string;
    skip?: number;
    take?: number;
  }) {
    try {
      const query = this.createQueryBuilder('meal').leftJoinAndSelect(
        'meal.nutrition_plan',
        'nutrition_plan',
      );

      if (options.search) {
        query.andWhere(
          '(meal.name ILIKE :search OR meal.instructions ILIKE :search)',
          { search: `%${options.search}%` },
        );
      }

      if (options.meal_type !== undefined) {
        query.andWhere('meal.meal_type = :meal_type', { meal_type: options.meal_type });
      }

      if (options.nutrition_plan_id) {
        query.andWhere('meal.nutrition_plan_id = :nutrition_plan_id', {
          nutrition_plan_id: options.nutrition_plan_id,
        });
      }

      if (options.skip !== undefined) query.skip(options.skip);
      if (options.take !== undefined) query.take(options.take);

      query.orderBy('meal.order_index', 'ASC').addOrderBy('meal.created_date', 'DESC');

      const [rows, total] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        messageEn: 'Meal search completed',
        messageAr: 'تم البحث في الوجبات بنجاح',
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
        messageEn: 'Error searching meals',
        messageAr: 'خطأ في البحث في الوجبات',
        error: (error as Error).message,
      };
    }
  }
}
