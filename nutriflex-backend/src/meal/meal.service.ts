import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealRepo } from './meal.repo';
import { Meal } from './entities/meal.entity';
import { MealIngredient } from './entities/meal-ingredient.entity';
import {
  CreateMealDto,
  UpdateMealDto,
  PaginationDto,
  SearchMealDto,
  MealIngredientInputDto,
} from './dto/meal.dto';

@Injectable()
export class MealService {
  constructor(
    private readonly repo: MealRepo,
    @InjectRepository(MealIngredient)
    private readonly ingredientRepo: Repository<MealIngredient>,
  ) {}

  private async replaceIngredientsForMeal(
    mealId: string,
    ingredients?: MealIngredientInputDto[],
  ): Promise<void> {
    if (!ingredients) {
      // No change requested.
      return;
    }

    // Full replace strategy: remove existing rows, then insert new ones.
    await this.ingredientRepo.delete({ meal_id: mealId });

    if (!ingredients.length) {
      return;
    }

    const entities = ingredients.map((ing, index) =>
      this.ingredientRepo.create({
        meal_id: mealId,
        name: ing.name,
        quantity: ing.quantity ?? null,
        unit: ing.unit ?? null,
        calories: ing.calories ?? null,
        notes: ing.notes ?? null,
        order_index: ing.order_index ?? index,
      }),
    );

    await this.ingredientRepo.save(entities);
  }

  async create(dto: CreateMealDto) {
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

    const result = await this.repo.createEntity(payload);
    const meal = (result as { data?: Meal }).data;

    if (meal?.id && dto.ingredients) {
      await this.replaceIngredientsForMeal(meal.id, dto.ingredients);
    }

    return result;
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  async update(id: string, dto: UpdateMealDto) {
    const payload: Partial<Meal> = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.meal_type !== undefined) payload.meal_type = dto.meal_type;
    if (dto.calories !== undefined) payload.calories = dto.calories ?? null;
    if (dto.protein !== undefined) payload.protein = dto.protein ?? null;
    if (dto.carbs !== undefined) payload.carbs = dto.carbs ?? null;
    if (dto.fats !== undefined) payload.fats = dto.fats ?? null;
    if (dto.instructions !== undefined) payload.instructions = dto.instructions ?? null;
    if (dto.order_index !== undefined) payload.order_index = dto.order_index;

    const result = await this.repo.updateEntity(id, payload);

    if (dto.ingredients) {
      await this.replaceIngredientsForMeal(id, dto.ingredients);
    }

    return result;
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchMealDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }
}
