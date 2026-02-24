import { Injectable, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionPlan } from '../nutrition-plan/entities/nutrition-plan.entity';
import { NutritionPlanStatus } from '../nutrition-plan/enums/nutrition-plan-status.enum';
import { TraineePlanStatus } from '../trainee-plan-status/entities/trainee-plan-status.entity';
import { TraineePlanStatusEnum } from '../trainee-plan-status/enums/trainee-plan-status.enum';
import { Meal } from '../meal/entities/meal.entity';
import { MealType } from '../meal/enums/meal-type.enum';

/**
 * TraineePlansService
 * 
 * Security Note: All methods receive traineeId from the authenticated user's JWT token.
 * All database queries filter by trainee_id using parameterized queries to ensure:
 * - Complete data isolation (each trainee only sees their own plans)
 * - SQL injection prevention
 * - No possibility of accessing another trainee's plans
 */
@Injectable()
export class TraineePlansService {
  constructor(
    @InjectRepository(NutritionPlan)
    private readonly nutritionPlanRepo: Repository<NutritionPlan>,
    @InjectRepository(TraineePlanStatus)
    private readonly traineePlanStatusRepo: Repository<TraineePlanStatus>,
    @InjectRepository(Meal)
    private readonly mealRepo: Repository<Meal>,
  ) {}

  async getAllPlans(
    traineeId: string,
    options?: {
      status?: NutritionPlanStatus;
      skip?: number;
      take?: number;
    },
  ) {
    try {
      const query = this.nutritionPlanRepo
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.coach', 'coach')
        .where('plan.trainee_id = :traineeId', { traineeId });

      if (options?.status) {
        query.andWhere('plan.status = :status', { status: options.status });
      }

      if (options?.skip !== undefined) query.skip(options.skip);
      if (options?.take !== undefined) query.take(options.take);

      query.orderBy('plan.created_date', 'DESC');

      const [plans, total] = await query.getManyAndCount();

      // Get completion status for each plan
      const planIds = plans.map((p) => p.id);
      const completionStatuses = planIds.length > 0
        ? await this.traineePlanStatusRepo
            .createQueryBuilder('tps')
            .where('tps.trainee_id = :traineeId', { traineeId })
            .andWhere('tps.plan_id IN (:...planIds)', { planIds })
            .getMany()
        : [];

      const statusMap = new Map<string, TraineePlanStatus>();
      completionStatuses.forEach((status) => {
        statusMap.set(status.plan_id, status);
      });

      // Build response with completion status
      const plansWithStatus = plans.map((plan) => {
        const completionStatus = statusMap.get(plan.id);
        return {
          id: plan.id,
          title: plan.title,
          description: plan.description,
          daily_calories: plan.daily_calories,
          start_date: plan.start_date,
          end_date: plan.end_date,
          status: plan.status,
          coach: plan.coach
            ? {
                id: plan.coach.id,
                fullName: plan.coach.fullName,
                email: plan.coach.email,
              }
            : null,
          completionStatus: completionStatus
            ? {
                completion_percentage: completionStatus.completion_percentage,
                status: completionStatus.status,
                last_updated: completionStatus.last_updated
                  ? completionStatus.last_updated.toISOString()
                  : null,
              }
            : {
                completion_percentage: 0,
                status: 'not_started' as const,
                last_updated: null,
              },
          created_date: plan.created_date,
          updated_date: plan.updated_date,
        };
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Nutrition plans retrieved successfully',
        messageAr: 'تم استرجاع خطط التغذية بنجاح',
        data: plansWithStatus,
        meta: {
          total,
          count: plansWithStatus.length,
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

  async getPlanDetails(traineeId: string, planId: string) {
    try {
      // Verify plan belongs to trainee and load exercises (with guide media)
      const plan = await this.nutritionPlanRepo.findOne({
        where: { id: planId, trainee_id: traineeId },
        relations: ['coach', 'trainee', 'planExercises'],
      });

      if (!plan) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Nutrition plan not found',
          messageAr: 'خطة التغذية غير موجودة',
          data: null,
        });
      }

      // Get meals for this plan
      const meals = await this.mealRepo.find({
        where: { nutrition_plan_id: planId },
        order: { order_index: 'ASC', created_date: 'DESC' },
      });

      // Get completion status
      const completionStatus = await this.traineePlanStatusRepo.findOne({
        where: {
          trainee_id: traineeId,
          plan_id: planId,
        },
      });

      // Map plan exercises for trainee (include guide image/video for display)
      const planExercises = (plan.planExercises ?? []).map((ex) => ({
        id: ex.id,
        name: ex.name,
        exercise_type: ex.exercise_type,
        sub_category: ex.sub_category ?? null,
        day_index: ex.day_index,
        sets: ex.sets,
        reps: ex.reps,
        duration_minutes: ex.duration_minutes,
        notes: ex.notes,
        order_index: ex.order_index,
        guide_image_base64: ex.guide_image_base64 ?? null,
        guide_video_base64: ex.guide_video_base64 ?? null,
      }));

      return {
        status: HttpStatus.OK,
        messageEn: 'Nutrition plan retrieved successfully',
        messageAr: 'تم استرجاع خطة التغذية بنجاح',
        data: {
          id: plan.id,
          title: plan.title,
          description: plan.description,
          daily_calories: plan.daily_calories,
          start_date: plan.start_date,
          end_date: plan.end_date,
          status: plan.status,
          coach: plan.coach
            ? {
                id: plan.coach.id,
                fullName: plan.coach.fullName,
                email: plan.coach.email,
              }
            : null,
          meals,
          planExercises,
          completionStatus: completionStatus
            ? {
                completion_percentage: completionStatus.completion_percentage,
                status: completionStatus.status,
                last_updated: completionStatus.last_updated
                  ? completionStatus.last_updated.toISOString()
                  : null,
              }
            : {
                completion_percentage: 0,
                status: 'not_started' as const,
                last_updated: null,
              },
          created_date: plan.created_date,
          updated_date: plan.updated_date,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving nutrition plan',
        messageAr: 'خطأ في استرجاع خطة التغذية',
        error: (error as Error).message,
      };
    }
  }

  async getPlanMeals(traineeId: string, planId: string) {
    try {
      // Verify plan belongs to trainee
      const plan = await this.nutritionPlanRepo.findOne({
        where: { id: planId, trainee_id: traineeId },
        select: ['id', 'title'],
      });

      if (!plan) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Nutrition plan not found',
          messageAr: 'خطة التغذية غير موجودة',
          data: null,
        });
      }

      // Get meals
      const meals = await this.mealRepo.find({
        where: { nutrition_plan_id: planId },
        order: { order_index: 'ASC', created_date: 'DESC' },
      });

      // Group meals by type
      const groupedByType: Record<MealType, typeof meals> = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      };

      meals.forEach((meal) => {
        if (groupedByType[meal.meal_type]) {
          groupedByType[meal.meal_type].push(meal);
        }
      });

      return {
        status: HttpStatus.OK,
        messageEn: 'Meals retrieved successfully',
        messageAr: 'تم استرجاع الوجبات بنجاح',
        data: {
          planId: plan.id,
          planTitle: plan.title,
          meals,
          groupedByType,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving meals',
        messageAr: 'خطأ في استرجاع الوجبات',
        error: (error as Error).message,
      };
    }
  }

  async getPlanStatus(traineeId: string, planId: string) {
    try {
      // Verify plan belongs to trainee
      const plan = await this.nutritionPlanRepo.findOne({
        where: { id: planId, trainee_id: traineeId },
        select: ['id', 'title', 'start_date', 'end_date'],
      });

      if (!plan) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          messageEn: 'Nutrition plan not found',
          messageAr: 'خطة التغذية غير موجودة',
          data: null,
        });
      }

      // Get completion status
      const completionStatus = await this.traineePlanStatusRepo.findOne({
        where: {
          trainee_id: traineeId,
          plan_id: planId,
        },
      });

      // Calculate days
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(plan.start_date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = plan.end_date ? new Date(plan.end_date) : null;
      if (endDate) {
        endDate.setHours(0, 0, 0, 0);
      }

      const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = endDate
        ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const totalDays = endDate
        ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        status: HttpStatus.OK,
        messageEn: 'Plan status retrieved successfully',
        messageAr: 'تم استرجاع حالة الخطة بنجاح',
        data: {
          planId: plan.id,
          planTitle: plan.title,
          completion_percentage: completionStatus?.completion_percentage ?? 0,
          status: completionStatus?.status ?? 'not_started',
          last_updated: completionStatus?.last_updated
            ? completionStatus.last_updated.toISOString()
            : null,
          daysRemaining: daysRemaining ?? null,
          daysElapsed: Math.max(0, daysElapsed),
          totalDays: totalDays ?? null,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        messageEn: 'Error retrieving plan status',
        messageAr: 'خطأ في استرجاع حالة الخطة',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Start a nutrition plan for the authenticated trainee.
   * - Only allowed when the underlying plan is active.
   * - Creates or updates a TraineePlanStatus row to in_progress with 0% completion.
   */
  async startPlan(traineeId: string, planId: string) {
    // Verify plan belongs to trainee and is active
    const plan = await this.nutritionPlanRepo.findOne({
      where: { id: planId, trainee_id: traineeId },
      select: ['id', 'title', 'status', 'start_date', 'end_date'],
    });

    if (!plan) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        messageEn: 'Nutrition plan not found',
        messageAr: 'خطة التغذية غير موجودة',
        data: null,
      });
    }

    if (plan.status !== NutritionPlanStatus.ACTIVE) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Only active plans can be started',
        messageAr: 'يمكن فقط بدء الخطط النشطة',
        data: null,
      });
    }

    // Find existing status (if any)
    let completionStatus = await this.traineePlanStatusRepo.findOne({
      where: {
        trainee_id: traineeId,
        plan_id: planId,
      },
    });

    // If already completed, do not restart (simple rule)
    if (completionStatus && completionStatus.status === TraineePlanStatusEnum.COMPLETED) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Plan has already been completed',
        messageAr: 'تم إكمال الخطة بالفعل',
        data: null,
      });
    }

    const now = new Date();

    if (!completionStatus) {
      // Create new status row
      completionStatus = this.traineePlanStatusRepo.create({
        trainee_id: traineeId,
        plan_id: planId,
        completion_percentage: 0,
        status: TraineePlanStatusEnum.IN_PROGRESS,
        last_updated: now,
      });
      await this.traineePlanStatusRepo.save(completionStatus);
    } else {
      // Move existing row to in_progress and reset completion if it was not_started
      completionStatus.status = TraineePlanStatusEnum.IN_PROGRESS;
      if (completionStatus.completion_percentage < 0) {
        completionStatus.completion_percentage = 0;
      }
      completionStatus.last_updated = now;
      await this.traineePlanStatusRepo.save(completionStatus);
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Plan started successfully',
      messageAr: 'تم بدء الخطة بنجاح',
      data: {
        planId: plan.id,
        planTitle: plan.title,
        completion_percentage: completionStatus.completion_percentage,
        status: completionStatus.status,
        last_updated: completionStatus.last_updated
          ? completionStatus.last_updated.toISOString()
          : null,
      },
    };
  }
}
