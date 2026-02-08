import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HealthMetric } from '../health-metric/entities/health-metric.entity';
import { HealthMetricType } from '../health-metric/enums/health-metric-type.enum';
import { BodyMeasurement } from '../body-measurement/entities/body-measurement.entity';
import { NutritionPlan } from '../nutrition-plan/entities/nutrition-plan.entity';
import { NutritionPlanStatus } from '../nutrition-plan/enums/nutrition-plan-status.enum';
import { TraineePlanStatus } from '../trainee-plan-status/entities/trainee-plan-status.entity';

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
  ) {}

  async getDashboard(traineeId: string) {
    // 1) Current weight: latest weight health metric
    const latestWeight = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .where('hm.trainee_id = :traineeId', { traineeId })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .orderBy('hm.recorded_date', 'DESC')
      .getOne();

    const currentWeight = latestWeight ? Number(latestWeight.value) : null;

    // 2) Weight change over last 30 days
    let weightChange30Days: number | null = null;
    if (latestWeight) {
      const cutoff = new Date(latestWeight.recorded_date);
      cutoff.setDate(cutoff.getDate() - 30);

      const oldestInWindow = await this.healthMetricRepo
        .createQueryBuilder('hm')
        .where('hm.trainee_id = :traineeId', { traineeId })
        .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
        .andWhere('hm.recorded_date <= :latest', { latest: latestWeight.recorded_date })
        .andWhere('hm.recorded_date >= :cutoff', { cutoff })
        .orderBy('hm.recorded_date', 'ASC')
        .getOne();

      if (oldestInWindow) {
        weightChange30Days = Number(latestWeight.value) - Number(oldestInWindow.value);
      }
    }

    // 3) Active plan (latest active nutrition plan for this trainee)
    const activePlan = await this.nutritionPlanRepo
      .createQueryBuilder('np')
      .where('np.trainee_id = :traineeId', { traineeId })
      .andWhere('np.status = :status', { status: NutritionPlanStatus.ACTIVE })
      .orderBy('np.start_date', 'DESC')
      .getOne();

    const activePlanTitle = activePlan ? activePlan.title : null;

    // 4) Completion percentage for that plan (if status row exists)
    let completionPercentage: number | null = null;
    if (activePlan) {
      const planStatus = await this.traineePlanStatusRepo.findOne({
        where: {
          trainee_id: traineeId,
          plan_id: activePlan.id,
        },
      });
      completionPercentage = planStatus ? planStatus.completion_percentage : 0;
    }

    // 5) Last measurement date (max of health_metric / body_measurement activity)
    const lastHealth = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('MAX(hm.recorded_date)', 'last')
      .where('hm.trainee_id = :traineeId', { traineeId })
      .getRawOne<{ last: string | null }>();

    const lastBody = await this.bodyMeasurementRepo
      .createQueryBuilder('bm')
      .select('MAX(bm.measured_date)', 'last')
      .where('bm.trainee_id = :traineeId', { traineeId })
      .getRawOne<{ last: string | null }>();

    let lastMeasurementDate: string | null = null;
    const dates: Date[] = [];
    if (lastHealth?.last) dates.push(new Date(lastHealth.last));
    if (lastBody?.last) dates.push(new Date(lastBody.last));
    if (dates.length > 0) {
      const maxDate = dates.reduce((a, b) => (a > b ? a : b));
      lastMeasurementDate = maxDate.toISOString();
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

  /**
   * 1) Personal Overview
   * GET /dashboard/trainee/overview
   */
  async getOverview(traineeId: string) {
    // Latest weight
    const latestWeight = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .where('hm.trainee_id = :traineeId', { traineeId })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .orderBy('hm.recorded_date', 'DESC')
      .getOne();

    const currentWeight = latestWeight ? Number(latestWeight.value) : null;

    // Weight change 7 and 30 days (relative to latest)
    let weightChange7Days: number | null = null;
    let weightChange30Days: number | null = null;

    if (latestWeight) {
      const latestDate = latestWeight.recorded_date;

      const cutoff7 = new Date(latestDate);
      cutoff7.setDate(cutoff7.getDate() - 7);

      const cutoff30 = new Date(latestDate);
      cutoff30.setDate(cutoff30.getDate() - 30);

      const oldest7 = await this.healthMetricRepo
        .createQueryBuilder('hm')
        .where('hm.trainee_id = :traineeId', { traineeId })
        .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
        .andWhere('hm.recorded_date BETWEEN :cutoff7 AND :latest', {
          cutoff7,
          latest: latestDate,
        })
        .orderBy('hm.recorded_date', 'ASC')
        .getOne();

      if (oldest7) {
        weightChange7Days = Number(latestWeight.value) - Number(oldest7.value);
      }

      const oldest30 = await this.healthMetricRepo
        .createQueryBuilder('hm')
        .where('hm.trainee_id = :traineeId', { traineeId })
        .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
        .andWhere('hm.recorded_date BETWEEN :cutoff30 AND :latest', {
          cutoff30,
          latest: latestDate,
        })
        .orderBy('hm.recorded_date', 'ASC')
        .getOne();

      if (oldest30) {
        weightChange30Days = Number(latestWeight.value) - Number(oldest30.value);
      }
    }

    // Active plan and completion
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
      planCompletion = planStatus ? planStatus.completion_percentage : 0;
    }

    // Days active this week (any health metric in the last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // inclusive 7 days

    const activeDaysRows = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('DATE(hm.recorded_date)', 'day')
      .where('hm.trainee_id = :traineeId', { traineeId })
      .andWhere('hm.recorded_date BETWEEN :from AND :to', {
        from: sevenDaysAgo,
        to: today,
      })
      .groupBy('DATE(hm.recorded_date)')
      .getRawMany<{ day: string }>();

    const daysActiveThisWeek = activeDaysRows.length;

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
        daysActiveThisWeek,
      },
    };
  }

  /**
   * 2) Progress Charts Data
   * GET /dashboard/trainee/progress
   */
  async getProgress(traineeId: string) {
    // Weight history (e.g. last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const weightHistoryRaw = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select(['hm.recorded_date AS date', 'hm.value AS value'])
      .where('hm.trainee_id = :traineeId', { traineeId })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .andWhere('hm.recorded_date >= :from', { from: ninetyDaysAgo })
      .orderBy('hm.recorded_date', 'ASC')
      .getRawMany<{ date: Date; value: string | number }>();

    const weightHistory = weightHistoryRaw.map((row) => ({
      date: new Date(row.date).toISOString().split('T')[0],
      value: Number(row.value),
    }));

    // Body measurements history (we'll return latest per date with waist/chest)
    const bodyRaw = await this.bodyMeasurementRepo
      .createQueryBuilder('bm')
      .select([
        'bm.measured_date AS date',
        'bm.waist_cm AS waist',
        'bm.chest_cm AS chest',
      ])
      .where('bm.trainee_id = :traineeId', { traineeId })
      .orderBy('bm.measured_date', 'ASC')
      .getRawMany<{ date: Date; waist: string | number | null; chest: string | number | null }>();

    const bodyMeasurements = bodyRaw.map((row) => ({
      date: new Date(row.date).toISOString().split('T')[0],
      waist: row.waist !== null ? Number(row.waist) : null,
      chest: row.chest !== null ? Number(row.chest) : null,
    }));

    return {
      status: HttpStatus.OK,
      messageEn: 'Trainee progress data retrieved successfully',
      messageAr: 'تم استرجاع بيانات تقدم المتدرب بنجاح',
      data: {
        weightHistory,
        bodyMeasurements,
      },
    };
  }

  /**
   * 3) Today’s Focus
   * GET /dashboard/trainee/today
   *
   * Note: We don’t yet have a concrete workout/meal tracking model,
   * so this returns placeholder-friendly values based on plan + meals count.
   */
  async getToday(traineeId: string) {
    // Active plan
    const activePlan = await this.nutritionPlanRepo
      .createQueryBuilder('np')
      .where('np.trainee_id = :traineeId', { traineeId })
      .andWhere('np.status = :status', { status: NutritionPlanStatus.ACTIVE })
      .orderBy('np.start_date', 'DESC')
      .getOne();

    const todayWorkout = activePlan ? activePlan.title : null;

    // Today meals: count meals for active plan (if Meal entity exists and linked)
    // For now, return static-friendly numbers; can be wired to real meals later.
    const todayMeals = 4;
    const completedMeals = 2;
    const completedWorkout = false;

    return {
      status: HttpStatus.OK,
      messageEn: 'Today focus data retrieved successfully',
      messageAr: 'تم استرجاع بيانات تركيز اليوم بنجاح',
      data: {
        todayWorkout,
        todayMeals,
        completedMeals,
        completedWorkout,
      },
    };
  }

  /**
   * 4) Motivation & Status
   * GET /dashboard/trainee/status
   *
   * For now we approximate streakDays and lastCheckIn from health metrics.
   * coachName would require joining coach-trainee; this can be wired in later.
   */
  async getStatus(traineeId: string) {
    // Last check-in = last health metric date
    const lastMetric = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('hm.recorded_date', 'date')
      .where('hm.trainee_id = :traineeId', { traineeId })
      .orderBy('hm.recorded_date', 'DESC')
      .getRawOne<{ date: Date | null }>();

    let lastCheckIn: string | null = null;
    if (lastMetric?.date) {
      lastCheckIn = new Date(lastMetric.date).toISOString().split('T')[0];
    }

    // Streak days: count consecutive days up to today having any metric
    let streakDays = 0;
    if (lastMetric?.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get last 30 days of activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 29);

      const activity = await this.healthMetricRepo
        .createQueryBuilder('hm')
        .select('DATE(hm.recorded_date)', 'day')
        .where('hm.trainee_id = :traineeId', { traineeId })
        .andWhere('hm.recorded_date >= :from', { from: thirtyDaysAgo })
        .groupBy('DATE(hm.recorded_date)')
        .orderBy('DATE(hm.recorded_date)', 'DESC')
        .getRawMany<{ day: string }>();

      const activityDays = new Set(
        activity.map((row) => new Date(row.day).toISOString().split('T')[0]),
      );

      let cursor = new Date(today);
      while (true) {
        const key = cursor.toISOString().split('T')[0];
        if (activityDays.has(key)) {
          streakDays += 1;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // coachName: placeholder for now – requires coach-trainee join
    const coachName = 'Your Coach';

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
}

