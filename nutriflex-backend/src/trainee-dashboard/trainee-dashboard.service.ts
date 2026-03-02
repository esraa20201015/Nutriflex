import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthMetric } from '../health-metric/entities/health-metric.entity';
import { HealthMetricType } from '../health-metric/enums/health-metric-type.enum';
import { BodyMeasurement } from '../body-measurement/entities/body-measurement.entity';
import { NutritionPlan } from '../nutrition-plan/entities/nutrition-plan.entity';
import { NutritionPlanStatus } from '../nutrition-plan/enums/nutrition-plan-status.enum';
import { TraineePlanStatus } from '../trainee-plan-status/entities/trainee-plan-status.entity';
import { TraineeProfile } from '../profiles/entities/trainee-profile.entity';
import { CoachTrainee } from '../coach-trainee/entities/coach-trainee.entity';
import { CoachTraineeStatus } from '../coach-trainee/enums/coach-trainee-status.enum';

@Injectable()
export class TraineeDashboardService {
  constructor(
    @InjectRepository(HealthMetric)
    private readonly healthMetricRepo: Repository<HealthMetric>,

    @InjectRepository(BodyMeasurement)
    private readonly bodyMeasurementRepo: Repository<BodyMeasurement>,

    @InjectRepository(NutritionPlan)
    private readonly nutritionPlanRepo: Repository<NutritionPlan>,

    @InjectRepository(TraineePlanStatus)
    private readonly traineePlanStatusRepo: Repository<TraineePlanStatus>,

    @InjectRepository(TraineeProfile)
    private readonly traineeProfileRepo: Repository<TraineeProfile>,

    @InjectRepository(CoachTrainee)
    private readonly coachTraineeRepo: Repository<CoachTrainee>, // ✅ added for active coach
  ) {}

  async getDashboard(traineeId: string) {
    // Load profile snapshot so we can fall back to stored weight when no metrics exist
    const profile = await this.traineeProfileRepo.findOne({
      where: { user_id: traineeId },
      select: ['weight_kg'],
    });

    // Latest recorded weight metric (primary source of truth for current weight)
    const latestWeight = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .where('hm.trainee_id = :traineeId', { traineeId })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .orderBy('hm.recorded_date', 'DESC')
      .getOne();

    let currentWeight: number | null = latestWeight
      ? Number(latestWeight.value)
      : null;

    // Fallback to profile snapshot weight if no metrics yet
    if (currentWeight === null && profile?.weight_kg != null) {
      currentWeight = Number(profile.weight_kg);
    }

    let weightChange30Days: number | null = null;
    if (latestWeight) {
      const cutoff = new Date(latestWeight.recorded_date);
      cutoff.setDate(cutoff.getDate() - 30);

      const oldestInWindow = await this.healthMetricRepo
        .createQueryBuilder('hm')
        .where('hm.trainee_id = :traineeId', { traineeId })
        .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
        .andWhere('hm.recorded_date BETWEEN :cutoff AND :latest', {
          cutoff,
          latest: latestWeight.recorded_date,
        })
        .orderBy('hm.recorded_date', 'ASC')
        .getOne();

      if (oldestInWindow) {
        weightChange30Days =
          Number(latestWeight.value) - Number(oldestInWindow.value);
      }
    }

    const activePlan = await this.nutritionPlanRepo
      .createQueryBuilder('np')
      .where('np.trainee_id = :traineeId', { traineeId })
      .andWhere('np.status = :status', { status: NutritionPlanStatus.ACTIVE })
      .orderBy('np.start_date', 'DESC')
      .getOne();

    const activePlanTitle = activePlan ? activePlan.title : null;

    let completionPercentage: number | null = null;
    if (activePlan) {
      const planStatus = await this.traineePlanStatusRepo.findOne({
        where: {
          trainee_id: traineeId,
          plan_id: activePlan.id,
        },
      });
      completionPercentage = planStatus
        ? planStatus.completion_percentage
        : 0;
    }

    // Compute last measurement date from either weight metrics or body measurements
    const latestBodyMeasurement = await this.bodyMeasurementRepo
      .createQueryBuilder('bm')
      .where('bm.trainee_id = :traineeId', { traineeId })
      .orderBy('bm.measured_date', 'DESC')
      .getOne();

    const weightDate = latestWeight?.recorded_date
      ? new Date(latestWeight.recorded_date)
      : null;
    const bodyDate = latestBodyMeasurement?.measured_date
      ? new Date(latestBodyMeasurement.measured_date)
      : null;

    let lastMeasurementDate: string | null = null;
    if (weightDate && bodyDate) {
      lastMeasurementDate = (weightDate > bodyDate ? weightDate : bodyDate)
        .toISOString()
        .split('T')[0];
    } else if (weightDate) {
      lastMeasurementDate = weightDate.toISOString().split('T')[0];
    } else if (bodyDate) {
      lastMeasurementDate = bodyDate.toISOString().split('T')[0];
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Trainee dashboard data retrieved successfully',
      messageAr: 'تم استرجاع بيانات لوحة تحكم المتدرب بنجاح',
      data: {
        currentWeight,
        weightChange30Days,
        activePlan: activePlanTitle,
        completionPercentage,
        lastMeasurementDate,
      },
    };
  }

  async getOverview(traineeId: string) {
    const profile = await this.traineeProfileRepo.findOne({
      where: { user_id: traineeId },
    });

    const latestWeight = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .where('hm.trainee_id = :traineeId', { traineeId })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .orderBy('hm.recorded_date', 'DESC')
      .getOne();

    let currentWeight: number | null = latestWeight
      ? Number(latestWeight.value)
      : null;
    if (currentWeight === null && profile?.weight_kg != null) {
      currentWeight = Number(profile.weight_kg);
    }

    let weightChange7Days: number | null = null;
    let weightChange30Days: number | null = null;
    if (latestWeight) {
      const latestDate = latestWeight.recorded_date;
      const cutoff7 = new Date(latestDate);
      cutoff7.setDate(cutoff7.getDate() - 7);
      const cutoff30 = new Date(latestDate);
      cutoff30.setDate(cutoff30.getDate() - 30);

      const [oldest7, oldest30] = await Promise.all([
        this.healthMetricRepo
          .createQueryBuilder('hm')
          .where('hm.trainee_id = :traineeId', { traineeId })
          .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
          .andWhere('hm.recorded_date BETWEEN :cutoff AND :latest', {
            cutoff: cutoff7,
            latest: latestDate,
          })
          .orderBy('hm.recorded_date', 'ASC')
          .getOne(),
        this.healthMetricRepo
          .createQueryBuilder('hm')
          .where('hm.trainee_id = :traineeId', { traineeId })
          .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
          .andWhere('hm.recorded_date BETWEEN :cutoff AND :latest', {
            cutoff: cutoff30,
            latest: latestDate,
          })
          .orderBy('hm.recorded_date', 'ASC')
          .getOne(),
      ]);

      if (oldest7) {
        weightChange7Days =
          Number(latestWeight.value) - Number(oldest7.value);
      }
      if (oldest30) {
        weightChange30Days =
          Number(latestWeight.value) - Number(oldest30.value);
      }
    }

    const activePlan = await this.nutritionPlanRepo
      .createQueryBuilder('np')
      .where('np.trainee_id = :traineeId', { traineeId })
      .andWhere('np.status = :status', { status: NutritionPlanStatus.ACTIVE })
      .orderBy('np.start_date', 'DESC')
      .getOne();

    const activePlanName = activePlan ? activePlan.title : null;

    let planCompletion = 0;
    if (activePlan) {
      const planStatus = await this.traineePlanStatusRepo.findOne({
        where: {
          trainee_id: traineeId,
          plan_id: activePlan.id,
        },
      });
      planCompletion = planStatus?.completion_percentage ?? 0;
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Trainee overview retrieved successfully',
      messageAr: 'تم استرجاع نظرة عامة للمتدرب بنجاح',
      data: {
        currentWeight,
        weightChange7Days,
        weightChange30Days,
        activePlanName,
        planCompletion,
        daysActiveThisWeek: 0,
      },
    };
  }

  async getProgress(traineeId: string) {
    const profile = await this.traineeProfileRepo.findOne({
      where: { user_id: traineeId },
    });

    const initialWeight =
      profile?.weight_kg !== null && profile?.weight_kg !== undefined
        ? Number(profile.weight_kg)
        : null;

    // Fetch full weight history for the trainee (no time window) so the chart
    // can display all recorded points over time.
    const weightHistoryRaw = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select(['hm.recorded_date AS date', 'hm.value AS value'])
      .where('hm.trainee_id = :traineeId', { traineeId })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .orderBy('hm.recorded_date', 'ASC')
      .getRawMany<{ date: Date; value: string | number }>();

    let weightHistory = weightHistoryRaw.map((row) => ({
      date: new Date(row.date).toISOString().split('T')[0],
      value: Number(row.value),
    }));

    if (weightHistory.length === 0 && initialWeight !== null) {
      weightHistory.push({
        date: profile?.created_date
          ? new Date(profile.created_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        value: initialWeight,
      });
    }

    const bodyRaw = await this.bodyMeasurementRepo
      .createQueryBuilder('bm')
      .select([
        'bm.measured_date AS date',
        'bm.waist_cm AS waist',
        'bm.chest_cm AS chest',
        'bm.hips_cm AS hips',
        'bm.arm_cm AS arm',
        'bm.thigh_cm AS thigh',
      ])
      .where('bm.trainee_id = :traineeId', { traineeId })
      .orderBy('bm.measured_date', 'DESC')
      .take(3)
      .getRawMany<{
        date: Date;
        waist: string | number | null;
        chest: string | number | null;
        hips: string | number | null;
        arm: string | number | null;
        thigh: string | number | null;
      }>();

    const bodyMeasurements = bodyRaw
      .map((row) => ({
        date: new Date(row.date).toISOString().split('T')[0],
        waist: row.waist !== null ? Number(row.waist) : null,
        chest: row.chest !== null ? Number(row.chest) : null,
        hips: row.hips !== null ? Number(row.hips) : null,
        arm: row.arm !== null ? Number(row.arm) : null,
        thigh: row.thigh !== null ? Number(row.thigh) : null,
      }))
      .reverse();

    return {
      status: HttpStatus.OK,
      messageEn: 'Trainee progress data retrieved successfully',
      messageAr: 'تم استرجاع بيانات تقدم المتدرب بنجاح',
      data: {
        profile: {
          height_cm: profile?.height_cm ?? null,
          weight_kg: initialWeight,
          fitness_goal: profile?.fitness_goal ?? null,
          activity_level: profile?.activity_level ?? null,
        },
        weightHistory,
        bodyMeasurements,
      },
    };
  }

  async getToday(traineeId: string) {
    const activePlan = await this.nutritionPlanRepo
      .createQueryBuilder('np')
      .leftJoinAndSelect('np.meals', 'meals')
      .leftJoinAndSelect('np.planExercises', 'planExercises')
      .where('np.trainee_id = :traineeId', { traineeId })
      .andWhere('np.status = :status', { status: NutritionPlanStatus.ACTIVE })
      .orderBy('np.start_date', 'DESC')
      .getOne();

    let todayMeals = 0;
    let completedMeals = 0;
    let completedWorkout = false;

    if (activePlan) {
      const meals = activePlan.meals ?? [];
      todayMeals = meals.length;

      const status = await this.traineePlanStatusRepo.findOne({
        where: { trainee_id: traineeId, plan_id: activePlan.id },
      });

      if (status) {
        const completedMealIds = new Set(
          Array.isArray(status.completed_meal_ids)
            ? status.completed_meal_ids
            : [],
        );

        completedMeals = meals.reduce(
          (count, meal) => (completedMealIds.has(meal.id) ? count + 1 : count),
          0,
        );

        const exercises = activePlan.planExercises ?? [];
        if (exercises.length > 0) {
          const completedExerciseIds = new Set(
            Array.isArray(status.completed_exercise_ids)
              ? status.completed_exercise_ids
              : [],
          );

          completedWorkout = exercises.every((ex) =>
            completedExerciseIds.has(ex.id),
          );
        }
      }
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Today focus data retrieved successfully',
      messageAr: 'تم استرجاع بيانات تركيز اليوم بنجاح',
      data: {
        todayWorkout: activePlan ? activePlan.title : null,
        todayMeals,
        completedMeals,
        completedWorkout,
      },
    };
  }

  async getStatus(traineeId: string) {
    const lastMetric = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('hm.recorded_date', 'date')
      .where('hm.trainee_id = :traineeId', { traineeId })
      .orderBy('hm.recorded_date', 'DESC')
      .getRawOne<{ date: Date | null }>();

    const lastCheckIn = lastMetric?.date
      ? new Date(lastMetric.date).toISOString().split('T')[0]
      : null;

    // ✅ Get active coach name
    const activeRelation = await this.coachTraineeRepo.findOne({
      where: { trainee_id: traineeId, status: CoachTraineeStatus.ACTIVE },
      relations: ['coach'],
    });

    const coachName = activeRelation?.coach?.fullName ?? null;

    // Compute streak based on fully completed plan days for the active plan.
    let streakDays = 0;

    const activePlan = await this.nutritionPlanRepo.findOne({
      where: {
        trainee_id: traineeId,
        status: NutritionPlanStatus.ACTIVE,
      },
      relations: ['meals', 'planExercises'],
      order: { start_date: 'DESC' },
    });

    if (activePlan) {
      const completionStatus = await this.traineePlanStatusRepo.findOne({
        where: {
          trainee_id: traineeId,
          plan_id: activePlan.id,
        },
      });

      if (completionStatus) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(activePlan.start_date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = activePlan.end_date
          ? new Date(activePlan.end_date)
          : null;
        if (endDate) {
          endDate.setHours(0, 0, 0, 0);
        }

        // Start checking from today or the plan end date, whichever is earlier.
        const cursor = new Date(
          endDate && endDate < today ? endDate : today,
        );

        const maxDaysToCheck = 90;
        let daysChecked = 0;

        while (cursor >= startDate && daysChecked < maxDaysToCheck) {
          const dayIndex = this.getPlanDayIndexForDate(activePlan, cursor);
          if (dayIndex === null) {
            break;
          }

          const { totalItems, isFullyCompleted } =
            this.getPlanDayCompletionInfo(activePlan, completionStatus, dayIndex);

          // If there are no tasks for this day, skip it without affecting streak.
          if (totalItems === 0) {
            cursor.setDate(cursor.getDate() - 1);
            daysChecked += 1;
            continue;
          }

          if (!isFullyCompleted) {
            break;
          }

          streakDays += 1;
          cursor.setDate(cursor.getDate() - 1);
          daysChecked += 1;
        }
      }
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Trainee status data retrieved successfully',
      messageAr: 'تم استرجاع بيانات حالة المتدرب بنجاح',
      data: {
        streakDays,
        lastCheckIn,
        coachName,
      },
    };
  }

  /**
   * Map a calendar date to a 1-based day index within the given plan,
   * using inclusive start/end dates. Returns null if the date is outside
   * the plan range.
   */
  private getPlanDayIndexForDate(
    plan: NutritionPlan,
    date: Date,
  ): number | null {
    const startDate = new Date(plan.start_date);
    startDate.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const endDate = plan.end_date ? new Date(plan.end_date) : null;
    if (endDate) {
      endDate.setHours(0, 0, 0, 0);
    }

    if (target < startDate) {
      return null;
    }
    if (endDate && target > endDate) {
      return null;
    }

    const dayMs = 1000 * 60 * 60 * 24;
    const diffMs = target.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / dayMs);
    return diffDays + 1;
  }

  /**
   * For a given day index within a plan, determine how many items (exercises + meals)
   * exist and whether all of them are marked as completed in the given status row.
   */
  private getPlanDayCompletionInfo(
    plan: NutritionPlan,
    status: TraineePlanStatus,
    dayIndex: number,
  ): { totalItems: number; isFullyCompleted: boolean } {
    const exercises = (plan.planExercises ?? []).filter(
      (ex: any) => (ex.day_index ?? 1) === dayIndex,
    );
    const meals = (plan.meals ?? []).filter(
      (meal: any) => (meal.day_index ?? 1) === dayIndex,
    );

    const totalItems = exercises.length + meals.length;

    if (totalItems === 0) {
      return { totalItems: 0, isFullyCompleted: false };
    }

    const completedExerciseIds = new Set(
      Array.isArray(status.completed_exercise_ids)
        ? status.completed_exercise_ids
        : [],
    );
    const completedMealIds = new Set(
      Array.isArray(status.completed_meal_ids)
        ? status.completed_meal_ids
        : [],
    );

    const allExercisesDone =
      exercises.length === 0 ||
      exercises.every((ex) => completedExerciseIds.has(ex.id));
    const allMealsDone =
      meals.length === 0 || meals.every((meal) => completedMealIds.has(meal.id));

    return {
      totalItems,
      isFullyCompleted: allExercisesDone && allMealsDone,
    };
  }
}
