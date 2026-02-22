import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionPlanRepo } from './nutrition-plan.repo';
import { NutritionPlan } from './entities/nutrition-plan.entity';
import { PlanExercise } from './entities/plan-exercise.entity';
import {
  CreateNutritionPlanDto,
  UpdateNutritionPlanDto,
  PaginationDto,
  SearchNutritionPlanDto,
  CreatePlanWithDetailsDto,
} from './dto/nutrition-plan.dto';
import { MealService } from '../meal/meal.service';
import { MealType } from '../meal/enums/meal-type.enum';
import { CreateMealDto } from '../meal/dto/meal.dto';

@Injectable()
export class NutritionPlanService {
  constructor(
    private readonly repo: NutritionPlanRepo,
    @InjectRepository(PlanExercise)
    private readonly planExerciseRepo: Repository<PlanExercise>,
    private readonly mealService: MealService,
  ) {}

  create(dto: CreateNutritionPlanDto) {
    const payload: Partial<NutritionPlan> = {
      coach_id: dto.coach_id,
      trainee_id: dto.trainee_id,
      title: dto.title,
      description: dto.description ?? null,
      daily_calories: dto.daily_calories ?? null,
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      status: dto.status,
    };
    return this.repo.createEntity(payload);
  }

  /**
   * Create a nutrition plan together with its exercises & meals in one request.
   *
   * This is used by the Coach Plans wizard flow.
   */
  async createWithDetails(dto: CreatePlanWithDetailsDto) {
    // 1) Create the base plan
    const basePayload: Partial<NutritionPlan> = {
      coach_id: dto.coach_id,
      trainee_id: dto.trainee_id,
      title: dto.title,
      description: dto.description ?? null,
      daily_calories: dto.daily_calories ?? null,
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      status: dto.status,
    };

    const planResult = await this.repo.createEntity(basePayload);
    const plan = (planResult as { data?: NutritionPlan }).data;

    if (!plan?.id) {
      // Bubble up the error response from repo if creation failed.
      return planResult;
    }

    const nutrition_plan_id = plan.id;

    // 2) Attach exercises (if provided)
    if (dto.exercises?.length) {
      const exerciseEntities = dto.exercises.map((ex, index) =>
        this.planExerciseRepo.create({
          nutrition_plan_id,
          exercise_id: ex.exercise_id ?? null,
          name: ex.name,
          exercise_type: ex.exercise_type,
          sub_category: ex.sub_category ?? null,
          day_index: ex.day_index ?? 1,
          sets: ex.sets ?? null,
          reps: ex.reps ?? null,
          duration_minutes: ex.duration_minutes ?? null,
          notes: ex.notes ?? null,
          guide_image_base64: ex.guide_image_base64 ?? null,
          guide_video_base64: ex.guide_video_base64 ?? null,
          order_index: ex.order_index ?? index,
        }),
      );

      await this.planExerciseRepo.save(exerciseEntities);
    }

    // 3) Attach meals (if provided) using MealService
    if (dto.meals?.length) {
      const createMealPromises: Promise<unknown>[] = [];

      dto.meals.forEach((meal, index) => {
        const mealDto: CreateMealDto = {
          nutrition_plan_id,
          name: meal.name,
          meal_type: meal.meal_type ?? MealType.BREAKFAST,
          calories: meal.calories ?? null,
          protein: null,
          carbs: null,
          fats: null,
          instructions: meal.instructions ?? null,
          order_index: meal.order_index ?? index,
        };

        createMealPromises.push(this.mealService.create(mealDto));
      });

      if (createMealPromises.length) {
        await Promise.all(createMealPromises);
      }
    }

    // 4) Reload plan with relations to include meals and planExercises
    const reloaded = await this.repo.findById(nutrition_plan_id);
    return reloaded;
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateNutritionPlanDto) {
    const payload: Partial<NutritionPlan> = {};
    if (dto.title !== undefined) payload.title = dto.title;
    if (dto.description !== undefined) payload.description = dto.description ?? null;
    if (dto.daily_calories !== undefined) payload.daily_calories = dto.daily_calories ?? null;
    if (dto.start_date !== undefined) payload.start_date = new Date(dto.start_date);
    if (dto.end_date !== undefined) payload.end_date = dto.end_date ? new Date(dto.end_date) : null;
    if (dto.status !== undefined) payload.status = dto.status;
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchNutritionPlanDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }

  toggleStatus(id: string) {
    return this.repo.toggleStatus(id);
  }
}
