import { Injectable } from '@nestjs/common';
import { MealRepo } from './meal.repo';
import { Meal } from './entities/meal.entity';
import {
  CreateMealDto,
  UpdateMealDto,
  PaginationDto,
  SearchMealDto,
} from './dto/meal.dto';

@Injectable()
export class MealService {
  constructor(private readonly repo: MealRepo) {}

  create(dto: CreateMealDto) {
    const payload: Partial<Meal> = {
      nutrition_plan_id: dto.nutrition_plan_id,
      name: dto.name,
      meal_type: dto.meal_type,
      calories: dto.calories ?? null,
      protein: dto.protein ?? null,
      carbs: dto.carbs ?? null,
      fats: dto.fats ?? null,
      instructions: dto.instructions ?? null,
      order_index: dto.order_index ?? 0,
    };
    return this.repo.createEntity(payload);
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateMealDto) {
    const payload: Partial<Meal> = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.meal_type !== undefined) payload.meal_type = dto.meal_type;
    if (dto.calories !== undefined) payload.calories = dto.calories ?? null;
    if (dto.protein !== undefined) payload.protein = dto.protein ?? null;
    if (dto.carbs !== undefined) payload.carbs = dto.carbs ?? null;
    if (dto.fats !== undefined) payload.fats = dto.fats ?? null;
    if (dto.instructions !== undefined) payload.instructions = dto.instructions ?? null;
    if (dto.order_index !== undefined) payload.order_index = dto.order_index;
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchMealDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }
}
