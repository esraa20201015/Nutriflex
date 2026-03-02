import { Injectable, HttpStatus } from '@nestjs/common';
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
    // 1) Validate dates & compute totalDays (inclusive)
    if (!dto.end_date) {
      return {
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'End date is required for a nutrition plan',
        messageAr: 'تاريخ الانتهاء مطلوب لخطة التغذية',
        data: null,
      };
    }

    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);
    const startMidnight = new Date(startDate);
    startMidnight.setHours(0, 0, 0, 0);
    const endMidnight = new Date(endDate);
    endMidnight.setHours(0, 0, 0, 0);

    if (endMidnight.getTime() < startMidnight.getTime()) {
      return {
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'End date must be on or after start date.',
        messageAr: 'يجب أن يكون تاريخ الانتهاء بعد أو في نفس تاريخ البدء.',
        data: null,
      };
    }

    const dayMs = 1000 * 60 * 60 * 24;
    const diffDays = Math.floor(
      (endMidnight.getTime() - startMidnight.getTime()) / dayMs,
    );
    const totalDays = diffDays + 1;

    // 2) Create the base plan
    const basePayload: Partial<NutritionPlan> = {
      coach_id: dto.coach_id,
      trainee_id: dto.trainee_id,
      title: dto.title,
      description: dto.description ?? null,
      daily_calories: dto.daily_calories ?? null,
      start_date: startDate,
      end_date: endDate,
      status: dto.status,
    };

    const planResult = await this.repo.createEntity(basePayload);
    const plan = (planResult as { data?: NutritionPlan }).data;

    if (!plan?.id) {
      // Bubble up the error response from repo if creation failed.
      return planResult;
    }

    const nutrition_plan_id = plan.id;

    // 3) Validate exercise and meal day_index values against totalDays
    if (dto.exercises?.length) {
      const invalidExercise = dto.exercises.find(
        (ex) => ex.day_index && ex.day_index > totalDays,
      );
      if (invalidExercise) {
        return {
          status: HttpStatus.BAD_REQUEST,
          messageEn:
            'Selected day for one or more exercises exceeds the total number of plan days.',
          messageAr:
            'اليوم المحدد لإحدى التمارين يتجاوز إجمالي عدد أيام الخطة.',
          data: null,
        };
      }
    }

    if (dto.meals?.length) {
      const invalidMeal = dto.meals.find(
        (meal) => meal.day_index && meal.day_index > totalDays,
      );
      if (invalidMeal) {
        return {
          status: HttpStatus.BAD_REQUEST,
          messageEn:
            'Selected day for one or more meals exceeds the total number of plan days.',
          messageAr:
            'اليوم المحدد لإحدى الوجبات يتجاوز إجمالي عدد أيام الخطة.',
          data: null,
        };
      }

      const dailyLimit = dto.daily_calories ?? null;
      if (dailyLimit != null && dailyLimit > 0) {
        for (let d = 1; d <= totalDays; d++) {
          const dayTotal = (dto.meals ?? [])
            .filter((m) => (m.day_index ?? 1) === d)
            .reduce((sum, m) => sum + (m.calories ?? 0), 0);
          if (dayTotal > dailyLimit) {
            return {
              status: HttpStatus.BAD_REQUEST,
              messageEn: `Day ${d} exceeds the daily calorie limit (${dayTotal} > ${dailyLimit}). Adjust meals or increase the daily limit.`,
              messageAr: `اليوم ${d} يتجاوز حد السعرات اليومية. يرجى تعديل الوجبات أو زيادة الحد.`,
              data: null,
            };
          }
        }
      }
    }

    // 4) Attach exercises (if provided)
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

    // 5) Attach meals (if provided) using MealService
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
          day_index: meal.day_index ?? 1,
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

  /** Get plan with exercises and meals for coach view/edit. */
  async getCoachPlanDetails(id: string) {
    const planResult = await this.repo.findByIdWithExercises(id);
    const plan = (planResult as { data?: NutritionPlan & { planExercises?: unknown[] } }).data;
    if (!plan) return planResult;

    const mealResult = await this.mealService.findByNutritionPlanId(id);
    const meals = (mealResult as { data?: unknown[] }).data ?? [];

    return {
      status: (planResult as { status: number }).status,
      messageEn: (planResult as { messageEn: string }).messageEn,
      messageAr: (planResult as { messageAr: string }).messageAr,
      data: {
        ...plan,
        planExercises: plan.planExercises ?? [],
        meals,
      },
    };
  }

  /** Update plan and replace exercises & meals (full coach edit). */
  async updateWithDetails(id: string, dto: CreatePlanWithDetailsDto) {
    const existing = await this.repo.findById(id);
    const planData = (existing as { data?: NutritionPlan }).data;
    if (!planData) return existing;

    if (!dto.end_date) {
      return {
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'End date is required for a nutrition plan',
        messageAr: 'تاريخ الانتهاء مطلوب لخطة التغذية',
        data: null,
      };
    }

    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);
    const startMidnight = new Date(startDate);
    startMidnight.setHours(0, 0, 0, 0);
    const endMidnight = new Date(endDate);
    endMidnight.setHours(0, 0, 0, 0);

    if (endMidnight.getTime() < startMidnight.getTime()) {
      return {
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'End date must be on or after start date.',
        messageAr: 'يجب أن يكون تاريخ الانتهاء بعد أو في نفس تاريخ البدء.',
        data: null,
      };
    }

    const dayMs = 1000 * 60 * 60 * 24;
    const diffDays = Math.floor(
      (endMidnight.getTime() - startMidnight.getTime()) / dayMs,
    );
    const totalDays = diffDays + 1;

    const payload: Partial<NutritionPlan> = {
      title: dto.title,
      description: dto.description ?? null,
      daily_calories: dto.daily_calories ?? null,
      start_date: startDate,
      end_date: endDate,
      status: dto.status,
    };
    await this.repo.updateEntity(id, payload);

    await this.planExerciseRepo.delete({ nutrition_plan_id: id });
    await this.mealService.deleteByNutritionPlanId(id);

    if (dto.exercises?.length) {
      const invalidExercise = dto.exercises.find(
        (ex) => ex.day_index && ex.day_index > totalDays,
      );
      if (invalidExercise) {
        return {
          status: HttpStatus.BAD_REQUEST,
          messageEn:
            'Selected day for one or more exercises exceeds the total number of plan days.',
          messageAr:
            'اليوم المحدد لإحدى التمارين يتجاوز إجمالي عدد أيام الخطة.',
          data: null,
        };
      }

      const exerciseEntities = dto.exercises.map((ex, index) =>
        this.planExerciseRepo.create({
          nutrition_plan_id: id,
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

    if (dto.meals?.length) {
      const invalidMeal = dto.meals.find(
        (meal) => meal.day_index && meal.day_index > totalDays,
      );
      if (invalidMeal) {
        return {
          status: HttpStatus.BAD_REQUEST,
          messageEn:
            'Selected day for one or more meals exceeds the total number of plan days.',
          messageAr:
            'اليوم المحدد لإحدى الوجبات يتجاوز إجمالي عدد أيام الخطة.',
          data: null,
        };
      }

      const dailyLimit = dto.daily_calories ?? null;
      if (dailyLimit != null && dailyLimit > 0) {
        for (let d = 1; d <= totalDays; d++) {
          const dayTotal = (dto.meals ?? [])
            .filter((m) => (m.day_index ?? 1) === d)
            .reduce((sum, m) => sum + (m.calories ?? 0), 0);
          if (dayTotal > dailyLimit) {
            return {
              status: HttpStatus.BAD_REQUEST,
              messageEn: `Day ${d} exceeds the daily calorie limit (${dayTotal} > ${dailyLimit}). Adjust meals or increase the daily limit.`,
              messageAr: `اليوم ${d} يتجاوز حد السعرات اليومية. يرجى تعديل الوجبات أو زيادة الحد.`,
              data: null,
            };
          }
        }
      }

      for (let index = 0; index < dto.meals.length; index++) {
        const meal = dto.meals[index];
        const mealDto: CreateMealDto = {
          nutrition_plan_id: id,
          name: meal.name,
          meal_type: meal.meal_type ?? MealType.BREAKFAST,
          calories: meal.calories ?? null,
          protein: null,
          carbs: null,
          fats: null,
          instructions: meal.instructions ?? null,
          order_index: meal.order_index ?? index,
          day_index: meal.day_index ?? 1,
        };
        await this.mealService.create(mealDto);
      }
    }

    return this.getCoachPlanDetails(id);
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
