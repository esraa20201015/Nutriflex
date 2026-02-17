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
    const latestWeight = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .where('hm.trainee_id = :traineeId', { traineeId })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .orderBy('hm.recorded_date', 'DESC')
      .getOne();

    const currentWeight = latestWeight ? Number(latestWeight.value) : null;

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

    return {
      status: HttpStatus.OK,
      messageEn: 'Trainee dashboard data retrieved successfully',
      messageAr: 'تم استرجاع بيانات لوحة تحكم المتدرب بنجاح',
      data: {
        currentWeight,
        weightChange30Days,
        activePlan: activePlanTitle,
        completionPercentage,
      },
    };
  }

  async getOverview(traineeId: string) {
    const latestWeight = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .where('hm.trainee_id = :traineeId', { traineeId })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .orderBy('hm.recorded_date', 'DESC')
      .getOne();

    const currentWeight = latestWeight ? Number(latestWeight.value) : null;

    return {
      status: HttpStatus.OK,
      messageEn: 'Trainee overview retrieved successfully',
      messageAr: 'تم استرجاع نظرة عامة للمتدرب بنجاح',
      data: {
        currentWeight,
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
      .select(['bm.measured_date AS date', 'bm.waist_cm AS waist', 'bm.chest_cm AS chest'])
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
      .where('np.trainee_id = :traineeId', { traineeId })
      .andWhere('np.status = :status', { status: NutritionPlanStatus.ACTIVE })
      .orderBy('np.start_date', 'DESC')
      .getOne();

    return {
      status: HttpStatus.OK,
      messageEn: 'Today focus data retrieved successfully',
      messageAr: 'تم استرجاع بيانات تركيز اليوم بنجاح',
      data: {
        todayWorkout: activePlan ? activePlan.title : null,
        todayMeals: 4,
        completedMeals: 2,
        completedWorkout: false,
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

    return {
      status: HttpStatus.OK,
      messageEn: 'Trainee status data retrieved successfully',
      messageAr: 'تم استرجاع بيانات حالة المتدرب بنجاح',
      data: {
        streakDays: 0,
        lastCheckIn,
        coachName,
      },
    };
  }
}
