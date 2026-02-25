import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CoachTrainee } from '../coach-trainee/entities/coach-trainee.entity';
import { CoachTraineeStatus } from '../coach-trainee/enums/coach-trainee-status.enum';
import { NutritionPlan } from '../nutrition-plan/entities/nutrition-plan.entity';
import { NutritionPlanStatus } from '../nutrition-plan/enums/nutrition-plan-status.enum';
import { TraineePlanStatus } from '../trainee-plan-status/entities/trainee-plan-status.entity';
import { TraineePlanStatusEnum } from '../trainee-plan-status/enums/trainee-plan-status.enum';
import { HealthMetric } from '../health-metric/entities/health-metric.entity';
import { HealthMetricType } from '../health-metric/enums/health-metric-type.enum';
import { BodyMeasurement } from '../body-measurement/entities/body-measurement.entity';
import { TraineeProfile } from '../profiles/entities/trainee-profile.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CoachDashboardService {
  constructor(
    @InjectRepository(CoachTrainee)
    private readonly coachTraineeRepo: Repository<CoachTrainee>,
    @InjectRepository(NutritionPlan)
    private readonly nutritionPlanRepo: Repository<NutritionPlan>,
    @InjectRepository(TraineePlanStatus)
    private readonly traineePlanStatusRepo: Repository<TraineePlanStatus>,
    @InjectRepository(HealthMetric)
    private readonly healthMetricRepo: Repository<HealthMetric>,
    @InjectRepository(BodyMeasurement)
    private readonly bodyMeasurementRepo: Repository<BodyMeasurement>,
    @InjectRepository(TraineeProfile)
    private readonly traineeProfileRepo: Repository<TraineeProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getDashboard(coachId: string) {
    // 1) Assigned trainees (all non-completed relationships)
    const assignedTrainees = await this.coachTraineeRepo.count({
      where: { coach_id: coachId },
    });

    const activeTrainees = await this.coachTraineeRepo.count({
      where: { coach_id: coachId, status: CoachTraineeStatus.ACTIVE },
    });

    const inactiveTrainees = assignedTrainees - activeTrainees;

    // 2) Plans created by this coach
    const plansCreated = await this.nutritionPlanRepo.count({
      where: { coach_id: coachId },
    });

    // Completed plans = completed statuses for trainees that belong to this coach
    const coachTraineeRows = await this.coachTraineeRepo.find({
      where: { coach_id: coachId },
      select: ['trainee_id'],
    });
    const traineeIds = coachTraineeRows.map((r) => r.trainee_id);

    let completedPlans = 0;
    if (traineeIds.length > 0) {
      completedPlans = await this.traineePlanStatusRepo.count({
        where: {
          trainee_id: In(traineeIds),
          status: TraineePlanStatusEnum.COMPLETED,
        },
      });
    }

    // 3) Alerts: trainees with no activity in last 7 days
    const alerts: { traineeId: string; reason: string }[] = [];
    if (traineeIds.length > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);

      // Last health metric per trainee
      const lastHealth = await this.healthMetricRepo
        .createQueryBuilder('hm')
        .select('hm.trainee_id', 'trainee_id')
        .addSelect('MAX(hm.recorded_date)', 'last')
        .where('hm.trainee_id IN (:...ids)', { ids: traineeIds })
        .groupBy('hm.trainee_id')
        .getRawMany<{ trainee_id: string; last: string }>();

      const lastBody = await this.bodyMeasurementRepo
        .createQueryBuilder('bm')
        .select('bm.trainee_id', 'trainee_id')
        .addSelect('MAX(bm.measured_date)', 'last')
        .where('bm.trainee_id IN (:...ids)', { ids: traineeIds })
        .groupBy('bm.trainee_id')
        .getRawMany<{ trainee_id: string; last: string }>();

      const lastPlanStatus = await this.traineePlanStatusRepo
        .createQueryBuilder('tps')
        .select('tps.trainee_id', 'trainee_id')
        .addSelect('MAX(tps.last_updated)', 'last')
        .where('tps.trainee_id IN (:...ids)', { ids: traineeIds })
        .groupBy('tps.trainee_id')
        .getRawMany<{ trainee_id: string; last: string | null }>();

      const lastByTrainee: Record<string, Date | null> = {};

      for (const id of traineeIds) {
        lastByTrainee[id] = null;
      }

      const mergeLast = (rows: { trainee_id: string; last: string | null }[]) => {
        for (const row of rows) {
          if (!row.last) continue;
          const date = new Date(row.last);
          const current = lastByTrainee[row.trainee_id];
          if (!current || date > current) {
            lastByTrainee[row.trainee_id] = date;
          }
        }
      };

      mergeLast(lastHealth);
      mergeLast(lastBody);
      mergeLast(lastPlanStatus);

      for (const traineeId of traineeIds) {
        const last = lastByTrainee[traineeId];
        if (!last || last < cutoff) {
          alerts.push({
            traineeId,
            reason: 'No activity in 7 days',
          });
        }
      }
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Coach dashboard statistics retrieved successfully',
      messageAr: 'تم استرجاع إحصائيات لوحة تحكم المدرب بنجاح',
      data: {
        assignedTrainees,
        activeTrainees,
        inactiveTrainees,
        plansCreated,
        completedPlans,
        alerts,
      },
    };
  }

  /**
   * Coach dashboard overview - detailed plan statistics
   * GET /dashboard/coach/overview
   */
  async getOverview(coachId: string) {
    // Trainee counts
    const assignedTrainees = await this.coachTraineeRepo.count({
      where: { coach_id: coachId },
    });

    const activeTrainees = await this.coachTraineeRepo.count({
      where: { coach_id: coachId, status: CoachTraineeStatus.ACTIVE },
    });

    const inactiveTrainees = assignedTrainees - activeTrainees;

    // Plan statistics (all filtered by coach_id)
    // Fetch statuses once and derive counts in code to be robust to legacy casing differences.
    const coachPlans = await this.nutritionPlanRepo.find({
      where: { coach_id: coachId },
      select: ['status'],
    });

    const plansCreated = coachPlans.length;
    let activePlans = 0;
    let draftPlans = 0;
    let archivedPlans = 0;

    coachPlans.forEach((plan) => {
      const status = String(plan.status).toLowerCase();
      if (status === NutritionPlanStatus.ACTIVE) {
        activePlans += 1;
      } else if (status === NutritionPlanStatus.DRAFT) {
        draftPlans += 1;
      } else if (status === NutritionPlanStatus.ARCHIVED) {
        archivedPlans += 1;
      }
    });

    // Completed plans = completed statuses for trainees assigned to this coach
    const coachTraineeRows = await this.coachTraineeRepo.find({
      where: { coach_id: coachId },
      select: ['trainee_id'],
    });
    const traineeIds = coachTraineeRows.map((r) => r.trainee_id);

    let completedPlans = 0;
    if (traineeIds.length > 0) {
      completedPlans = await this.traineePlanStatusRepo.count({
        where: {
          trainee_id: In(traineeIds),
          status: TraineePlanStatusEnum.COMPLETED,
        },
      });
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Coach dashboard overview retrieved successfully',
      messageAr: 'تم استرجاع نظرة عامة على لوحة تحكم المدرب بنجاح',
      data: {
        assignedTrainees,
        activeTrainees,
        inactiveTrainees,
        plansCreated,
        activePlans,
        completedPlans,
        draftPlans,
        archivedPlans,
      },
    };
  }

  /**
   * Trainee Progress Summary
   * GET /dashboard/coach/trainees-progress
   */
  async getTraineesProgress(coachId: string) {
    // Get all trainees assigned to this coach
    const coachTraineeRows = await this.coachTraineeRepo.find({
      where: { coach_id: coachId },
      select: ['trainee_id'],
    });
    const traineeIds = coachTraineeRows.map((r) => r.trainee_id);

    if (traineeIds.length === 0) {
      return {
        status: HttpStatus.OK,
        messageEn: 'Trainee progress retrieved successfully',
        messageAr: 'تم استرجاع تقدم المتدربين بنجاح',
        data: {
          trainees: [],
        },
      };
    }

    // Get trainee profiles with names
    const traineeProfiles = await this.traineeProfileRepo.find({
      where: { user_id: In(traineeIds) },
      select: ['user_id', 'full_name'],
    });

    const profileMap = new Map<string, string>();
    traineeProfiles.forEach((profile) => {
      profileMap.set(profile.user_id, profile.full_name);
    });

    // Get current weight (latest weight metric per trainee)
    const currentWeights = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('hm.trainee_id', 'trainee_id')
      .addSelect('hm.value', 'value')
      .addSelect('MAX(hm.recorded_date)', 'max_date')
      .where('hm.trainee_id IN (:...ids)', { ids: traineeIds })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .groupBy('hm.trainee_id')
      .addGroupBy('hm.value')
      .having('MAX(hm.recorded_date) = (SELECT MAX(hm2.recorded_date) FROM health_metric hm2 WHERE hm2.trainee_id = hm.trainee_id AND hm2.metric_type = :type)', {
        type: HealthMetricType.WEIGHT,
      })
      .getRawMany<{ trainee_id: string; value: number }>();

    const weightMap = new Map<string, number>();
    currentWeights.forEach((w) => {
      weightMap.set(w.trainee_id, parseFloat(w.value.toString()));
    });

    // Get weight 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const weights30DaysAgo = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('hm.trainee_id', 'trainee_id')
      .addSelect('hm.value', 'value')
      .addSelect('MAX(hm.recorded_date)', 'max_date')
      .where('hm.trainee_id IN (:...ids)', { ids: traineeIds })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .andWhere('hm.recorded_date <= :cutoff', { cutoff: thirtyDaysAgo })
      .groupBy('hm.trainee_id')
      .addGroupBy('hm.value')
      .having('MAX(hm.recorded_date) = (SELECT MAX(hm2.recorded_date) FROM health_metric hm2 WHERE hm2.trainee_id = hm.trainee_id AND hm2.metric_type = :type AND hm2.recorded_date <= :cutoff)', {
        type: HealthMetricType.WEIGHT,
        cutoff: thirtyDaysAgo,
      })
      .getRawMany<{ trainee_id: string; value: number }>();

    const weight30DaysAgoMap = new Map<string, number>();
    weights30DaysAgo.forEach((w) => {
      weight30DaysAgoMap.set(w.trainee_id, parseFloat(w.value.toString()));
    });

    // Get latest completion rate per trainee
    const latestPlanStatuses = await this.traineePlanStatusRepo
      .createQueryBuilder('tps')
      .select('tps.trainee_id', 'trainee_id')
      .addSelect('tps.completion_percentage', 'completion_percentage')
      .addSelect('MAX(tps.last_updated)', 'max_updated')
      .where('tps.trainee_id IN (:...ids)', { ids: traineeIds })
      .groupBy('tps.trainee_id')
      .addGroupBy('tps.completion_percentage')
      .having('MAX(tps.last_updated) = (SELECT MAX(tps2.last_updated) FROM trainee_plan_status tps2 WHERE tps2.trainee_id = tps.trainee_id)', {})
      .getRawMany<{ trainee_id: string; completion_percentage: number }>();

    const completionMap = new Map<string, number>();
    latestPlanStatuses.forEach((ps) => {
      completionMap.set(ps.trainee_id, ps.completion_percentage || 0);
    });

    // Get last activity date (from health_metric, body_measurement, or trainee_plan_status)
    const lastHealth = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('hm.trainee_id', 'trainee_id')
      .addSelect('MAX(hm.recorded_date)', 'last')
      .where('hm.trainee_id IN (:...ids)', { ids: traineeIds })
      .groupBy('hm.trainee_id')
      .getRawMany<{ trainee_id: string; last: string }>();

    const lastBody = await this.bodyMeasurementRepo
      .createQueryBuilder('bm')
      .select('bm.trainee_id', 'trainee_id')
      .addSelect('MAX(bm.measured_date)', 'last')
      .where('bm.trainee_id IN (:...ids)', { ids: traineeIds })
      .groupBy('bm.trainee_id')
      .getRawMany<{ trainee_id: string; last: string }>();

    const lastPlanStatus = await this.traineePlanStatusRepo
      .createQueryBuilder('tps')
      .select('tps.trainee_id', 'trainee_id')
      .addSelect('MAX(tps.last_updated)', 'last')
      .where('tps.trainee_id IN (:...ids)', { ids: traineeIds })
      .groupBy('tps.trainee_id')
      .getRawMany<{ trainee_id: string; last: string | null }>();

    const lastActivityMap = new Map<string, Date | null>();
    traineeIds.forEach((id) => {
      lastActivityMap.set(id, null);
    });

    const mergeLast = (rows: { trainee_id: string; last: string | null }[]) => {
      for (const row of rows) {
        if (!row.last) continue;
        const date = new Date(row.last);
        const current = lastActivityMap.get(row.trainee_id);
        if (!current || date > current) {
          lastActivityMap.set(row.trainee_id, date);
        }
      }
    };

    mergeLast(lastHealth);
    mergeLast(lastBody);
    mergeLast(lastPlanStatus);

    // Build response
    const trainees = traineeIds.map((traineeId) => {
      const name = profileMap.get(traineeId) || 'Unknown';
      const currentWeight = weightMap.get(traineeId) || null;
      const weight30DaysAgo = weight30DaysAgoMap.get(traineeId) || null;
      const weightChange30Days =
        currentWeight !== null && weight30DaysAgo !== null
          ? Math.round((currentWeight - weight30DaysAgo) * 100) / 100
          : null;
      const completionRate = completionMap.get(traineeId) || 0;
      const lastActivity = lastActivityMap.get(traineeId);

      return {
        traineeId,
        name,
        currentWeight,
        weightChange30Days,
        completionRate,
        lastActivity: lastActivity ? lastActivity.toISOString().split('T')[0] : null,
      };
    });

    return {
      status: HttpStatus.OK,
      messageEn: 'Trainee progress retrieved successfully',
      messageAr: 'تم استرجاع تقدم المتدربين بنجاح',
      data: {
        trainees,
      },
    };
  }

  /**
   * Coach Alerts & Attention Needed
   * GET /dashboard/coach/alerts
   */
  async getAlerts(coachId: string) {
    const coachTraineeRows = await this.coachTraineeRepo.find({
      where: { coach_id: coachId },
      select: ['trainee_id'],
    });
    const traineeIds = coachTraineeRows.map((r) => r.trainee_id);

    if (traineeIds.length === 0) {
      return {
        status: HttpStatus.OK,
        messageEn: 'Coach alerts retrieved successfully',
        messageAr: 'تم استرجاع تنبيهات المدرب بنجاح',
        data: {
          alerts: [],
        },
      };
    }

    const alerts: { traineeId: string; reason: string }[] = [];

    // 1) No activity for 7 days
    const cutoff7Days = new Date();
    cutoff7Days.setDate(cutoff7Days.getDate() - 7);

    const lastHealth = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('hm.trainee_id', 'trainee_id')
      .addSelect('MAX(hm.recorded_date)', 'last')
      .where('hm.trainee_id IN (:...ids)', { ids: traineeIds })
      .groupBy('hm.trainee_id')
      .getRawMany<{ trainee_id: string; last: string }>();

    const lastBody = await this.bodyMeasurementRepo
      .createQueryBuilder('bm')
      .select('bm.trainee_id', 'trainee_id')
      .addSelect('MAX(bm.measured_date)', 'last')
      .where('bm.trainee_id IN (:...ids)', { ids: traineeIds })
      .groupBy('bm.trainee_id')
      .getRawMany<{ trainee_id: string; last: string }>();

    const lastPlanStatus = await this.traineePlanStatusRepo
      .createQueryBuilder('tps')
      .select('tps.trainee_id', 'trainee_id')
      .addSelect('MAX(tps.last_updated)', 'last')
      .where('tps.trainee_id IN (:...ids)', { ids: traineeIds })
      .groupBy('tps.trainee_id')
      .getRawMany<{ trainee_id: string; last: string | null }>();

    const lastByTrainee: Record<string, Date | null> = {};
    traineeIds.forEach((id) => {
      lastByTrainee[id] = null;
    });

    const mergeLast = (rows: { trainee_id: string; last: string | null }[]) => {
      for (const row of rows) {
        if (!row.last) continue;
        const date = new Date(row.last);
        const current = lastByTrainee[row.trainee_id];
        if (!current || date > current) {
          lastByTrainee[row.trainee_id] = date;
        }
      }
    };

    mergeLast(lastHealth);
    mergeLast(lastBody);
    mergeLast(lastPlanStatus);

    for (const traineeId of traineeIds) {
      const last = lastByTrainee[traineeId];
      if (!last || last < cutoff7Days) {
        alerts.push({
          traineeId,
          reason: 'No activity for 7 days',
        });
      }
    }

    // 2) Weight increased unexpectedly (compare current weight vs weight 30 days ago)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const currentWeights = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('hm.trainee_id', 'trainee_id')
      .addSelect('hm.value', 'value')
      .addSelect('MAX(hm.recorded_date)', 'max_date')
      .where('hm.trainee_id IN (:...ids)', { ids: traineeIds })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .groupBy('hm.trainee_id')
      .addGroupBy('hm.value')
      .having('MAX(hm.recorded_date) = (SELECT MAX(hm2.recorded_date) FROM health_metric hm2 WHERE hm2.trainee_id = hm.trainee_id AND hm2.metric_type = :type)', {
        type: HealthMetricType.WEIGHT,
      })
      .getRawMany<{ trainee_id: string; value: number }>();

    const weights30DaysAgo = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('hm.trainee_id', 'trainee_id')
      .addSelect('hm.value', 'value')
      .addSelect('MAX(hm.recorded_date)', 'max_date')
      .where('hm.trainee_id IN (:...ids)', { ids: traineeIds })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .andWhere('hm.recorded_date <= :cutoff', { cutoff: thirtyDaysAgo })
      .groupBy('hm.trainee_id')
      .addGroupBy('hm.value')
      .having('MAX(hm.recorded_date) = (SELECT MAX(hm2.recorded_date) FROM health_metric hm2 WHERE hm2.trainee_id = hm.trainee_id AND hm2.metric_type = :type AND hm2.recorded_date <= :cutoff)', {
        type: HealthMetricType.WEIGHT,
        cutoff: thirtyDaysAgo,
      })
      .getRawMany<{ trainee_id: string; value: number }>();

    const weightMap = new Map<string, number>();
    currentWeights.forEach((w) => {
      weightMap.set(w.trainee_id, parseFloat(w.value.toString()));
    });

    const weight30DaysAgoMap = new Map<string, number>();
    weights30DaysAgo.forEach((w) => {
      weight30DaysAgoMap.set(w.trainee_id, parseFloat(w.value.toString()));
    });

    for (const traineeId of traineeIds) {
      const currentWeight = weightMap.get(traineeId);
      const weight30DaysAgo = weight30DaysAgoMap.get(traineeId);

      if (currentWeight !== undefined && weight30DaysAgo !== undefined) {
        const weightIncrease = currentWeight - weight30DaysAgo;
        // Alert if weight increased by more than 2kg (assuming weight loss goal)
        if (weightIncrease > 2) {
          // Check if this trainee already has an alert (avoid duplicates)
          const hasAlert = alerts.some((a) => a.traineeId === traineeId);
          if (!hasAlert) {
            alerts.push({
              traineeId,
              reason: 'Weight increased unexpectedly',
            });
          }
        }
      }
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Coach alerts retrieved successfully',
      messageAr: 'تم استرجاع تنبيهات المدرب بنجاح',
      data: {
        alerts,
      },
    };
  }

  /**
   * Recent Activity Feed
   * GET /dashboard/coach/recent-activity
   */
  async getRecentActivity(coachId: string) {
    const coachTraineeRows = await this.coachTraineeRepo.find({
      where: { coach_id: coachId },
      select: ['trainee_id'],
    });
    const traineeIds = coachTraineeRows.map((r) => r.trainee_id);

    if (traineeIds.length === 0) {
      return {
        status: HttpStatus.OK,
        messageEn: 'Recent activity retrieved successfully',
        messageAr: 'تم استرجاع النشاط الأخير بنجاح',
        data: {
          activities: [],
        },
      };
    }

    // Get trainee names
    const traineeProfiles = await this.traineeProfileRepo.find({
      where: { user_id: In(traineeIds) },
      select: ['user_id', 'full_name'],
    });

    const nameMap = new Map<string, string>();
    traineeProfiles.forEach((profile) => {
      nameMap.set(profile.user_id, profile.full_name);
    });

    const activities: Array<{
      type: string;
      trainee: string;
      value?: string;
      date: string;
    }> = [];

    // Get recent weight updates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentWeights = await this.healthMetricRepo
      .createQueryBuilder('hm')
      .select('hm.trainee_id', 'trainee_id')
      .addSelect('hm.value', 'value')
      .addSelect('hm.recorded_date', 'recorded_date')
      .where('hm.trainee_id IN (:...ids)', { ids: traineeIds })
      .andWhere('hm.metric_type = :type', { type: HealthMetricType.WEIGHT })
      .andWhere('hm.recorded_date >= :cutoff', { cutoff: thirtyDaysAgo })
      .orderBy('hm.recorded_date', 'DESC')
      .limit(50)
      .getRawMany<{ trainee_id: string; value: number; recorded_date: Date }>();

    // Group weights by trainee and calculate changes from previous entry
    const traineeWeights = new Map<string, Array<{ value: number; date: Date }>>();
    recentWeights.forEach((w) => {
      if (!traineeWeights.has(w.trainee_id)) {
        traineeWeights.set(w.trainee_id, []);
      }
      traineeWeights.get(w.trainee_id)!.push({
        value: parseFloat(w.value.toString()),
        date: new Date(w.recorded_date),
      });
    });

    // For each trainee, calculate weight changes between consecutive entries (sorted by date ascending)
    traineeWeights.forEach((weights, traineeId) => {
      weights.sort((a, b) => a.date.getTime() - b.date.getTime());
      for (let i = 1; i < weights.length; i++) {
        const current = weights[i];
        const previous = weights[i - 1];
        const diff = current.value - previous.value;
        const change = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
        const traineeName = nameMap.get(traineeId) || 'Unknown';
        activities.push({
          type: 'WEIGHT_UPDATE',
          trainee: traineeName,
          value: `${change} kg`,
          date: current.date.toISOString().split('T')[0],
        });
      }
      // Also add the first entry if it's the only one (no change to show, but still an activity)
      if (weights.length === 1) {
        const traineeName = nameMap.get(traineeId) || 'Unknown';
        activities.push({
          type: 'WEIGHT_UPDATE',
          trainee: traineeName,
          value: `${weights[0].value.toFixed(1)} kg`,
          date: weights[0].date.toISOString().split('T')[0],
        });
      }
    });

    // Get completed plans
    const completedPlans = await this.traineePlanStatusRepo
      .createQueryBuilder('tps')
      .select('tps.trainee_id', 'trainee_id')
      .addSelect('tps.last_updated', 'last_updated')
      .where('tps.trainee_id IN (:...ids)', { ids: traineeIds })
      .andWhere('tps.status = :status', { status: TraineePlanStatusEnum.COMPLETED })
      .andWhere('tps.last_updated >= :cutoff', { cutoff: thirtyDaysAgo })
      .orderBy('tps.last_updated', 'DESC')
      .limit(20)
      .getRawMany<{ trainee_id: string; last_updated: Date }>();

    completedPlans.forEach((plan) => {
      const traineeName = nameMap.get(plan.trainee_id) || 'Unknown';
      activities.push({
        type: 'PLAN_COMPLETED',
        trainee: traineeName,
        date: new Date(plan.last_updated).toISOString().split('T')[0],
      });
    });

    // Sort by date descending and limit to 30 most recent
    activities.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return {
      status: HttpStatus.OK,
      messageEn: 'Recent activity retrieved successfully',
      messageAr: 'تم استرجاع النشاط الأخير بنجاح',
      data: {
        activities: activities.slice(0, 30),
      },
    };
  }
}

