import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { TraineePlanStatus } from '../trainee-plan-status/entities/trainee-plan-status.entity';
import { UserStatus } from '../users/enums/user-status.enum';
import { TraineePlanStatusEnum } from '../trainee-plan-status/enums/trainee-plan-status.enum';
import { NutritionPlan } from '../nutrition-plan/entities/nutrition-plan.entity';
import { NutritionPlanStatus } from '../nutrition-plan/enums/nutrition-plan-status.enum';
import { HealthMetric } from '../health-metric/entities/health-metric.entity';
import { BodyMeasurement } from '../body-measurement/entities/body-measurement.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(TraineePlanStatus)
    private readonly traineePlanStatusRepo: Repository<TraineePlanStatus>,
    @InjectRepository(NutritionPlan)
    private readonly nutritionPlanRepo: Repository<NutritionPlan>,
    @InjectRepository(HealthMetric)
    private readonly healthMetricRepo: Repository<HealthMetric>,
    @InjectRepository(BodyMeasurement)
    private readonly bodyMeasurementRepo: Repository<BodyMeasurement>,
  ) {}

  async getDashboard() {
    // Basic user stats
    const totalUsers = await this.userRepo.count();

    const totalAdmins = await this.userRepo.count({
      relations: ['role'],
      where: { role: { name: 'ADMIN' } },
    });

    const totalCoaches = await this.userRepo.count({
      relations: ['role'],
      where: { role: { name: 'COACH' } },
    });

    const totalTrainees = await this.userRepo.count({
      relations: ['role'],
      where: { role: { name: 'TRAINEE' } },
    });

    const activeUsers = await this.userRepo.count({
      where: { status: UserStatus.ACTIVE },
    });

    const inactiveUsers = await this.userRepo.count({
      where: { status: UserStatus.INACTIVE },
    });

    const blockedUsers = await this.userRepo.count({
      where: { status: UserStatus.BLOCKED },
    });

    // Pending users = not yet email-verified
    const pendingUsers = await this.userRepo.count({
      where: { isEmailVerified: false },
    });

    // New users this month / today (by createdAt)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newUsersToday = await this.userRepo
      .createQueryBuilder('user')
      .where('user.createdAt >= :startOfToday', { startOfToday })
      .getCount();

    const newUsersThisMonth = await this.userRepo
      .createQueryBuilder('user')
      .where('user.createdAt >= :startOfMonth', { startOfMonth })
      .getCount();

    return {
      status: HttpStatus.OK,
      messageEn: 'Admin dashboard statistics retrieved successfully',
      messageAr: 'تم استرجاع إحصائيات لوحة تحكم المدير بنجاح',
      data: {
        totalUsers,
        totalAdmins,
        totalCoaches,
        totalTrainees,
        activeUsers,
        inactiveUsers,
        blockedUsers,
        pendingUsers,
        newUsersThisMonth,
        newUsersToday,
      },
    };
  }

  /**
   * Account status & approval metrics
   * GET /dashboard/admin/accounts-status
   */
  async getAccountsStatus() {
    const pendingCoaches = await this.userRepo.count({
      relations: ['role'],
      where: { role: { name: 'COACH' }, isEmailVerified: false },
    });

    const pendingTrainees = await this.userRepo.count({
      relations: ['role'],
      where: { role: { name: 'TRAINEE' }, isEmailVerified: false },
    });

    const blockedUsers = await this.userRepo.count({
      where: { status: UserStatus.BLOCKED },
    });

    // Recently approved = recently email-verified users (last 7 days)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const recentlyApproved = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.isEmailVerified = :verified', { verified: true })
      .andWhere('user.updatedAt >= :cutoff', { cutoff })
      .orderBy('user.updatedAt', 'DESC')
      .select(['user.id', 'user.email', 'role.name', 'user.updatedAt'])
      .getMany();

    const mapped = recentlyApproved.map((u) => ({
      userId: u.id,
      email: u.email,
      role: (u.role as Role)?.name,
      approvedAt: (u as any).updatedAt,
    }));

    return {
      status: HttpStatus.OK,
      messageEn: 'Account status metrics retrieved successfully',
      messageAr: 'تم استرجاع مؤشرات حالة الحسابات بنجاح',
      data: {
        pendingCoaches,
        pendingTrainees,
        blockedUsers,
        recentlyApproved: mapped,
      },
    };
  }

  /**
   * Platform activity metrics
   * GET /dashboard/admin/activity
   */
  async getActivity() {
    const activePlans = await this.nutritionPlanRepo.count({
      where: { status: NutritionPlanStatus.ACTIVE },
    });

    const completedPlans = await this.traineePlanStatusRepo.count({
      where: { status: TraineePlanStatusEnum.COMPLETED },
    });

    const inactivePlans = await this.nutritionPlanRepo.count({
      where: { status: NutritionPlanStatus.ARCHIVED },
    });

    // Average completion rate across all plan statuses
    const completionAgg = await this.traineePlanStatusRepo
      .createQueryBuilder('tps')
      .select('AVG(tps.completion_percentage)', 'avg')
      .getRawOne<{ avg: string | null }>();

    const avgCompletionRate = completionAgg?.avg ? Math.round(Number(completionAgg.avg)) : 0;

    // Trainees with no activity in last 7 / 30 days
    const now = new Date();
    const cutoff7 = new Date(now);
    cutoff7.setDate(now.getDate() - 7);
    const cutoff30 = new Date(now);
    cutoff30.setDate(now.getDate() - 30);

    const allTraineeIdsRows = await this.nutritionPlanRepo
      .createQueryBuilder('np')
      .select('DISTINCT np.trainee_id', 'trainee_id')
      .getRawMany<{ trainee_id: string }>();
    const traineeIds = allTraineeIdsRows.map((r) => r.trainee_id);

    const calcNoActivity = async (cutoff: Date) => {
      if (traineeIds.length === 0) return 0;

      const lastHealth = await this.healthMetricRepo
        .createQueryBuilder('hm')
        .select('hm.trainee_id', 'trainee_id')
        .addSelect('MAX(hm.recorded_date)', 'last')
        .where('hm.trainee_id IN (:...ids)', { ids: traineeIds })
        .groupBy('hm.trainee_id')
        .getRawMany<{ trainee_id: string; last: string | null }>();

      const lastBody = await this.bodyMeasurementRepo
        .createQueryBuilder('bm')
        .select('bm.trainee_id', 'trainee_id')
        .addSelect('MAX(bm.measured_date)', 'last')
        .where('bm.trainee_id IN (:...ids)', { ids: traineeIds })
        .groupBy('bm.trainee_id')
        .getRawMany<{ trainee_id: string; last: string | null }>();

      const lastPlanStatus = await this.traineePlanStatusRepo
        .createQueryBuilder('tps')
        .select('tps.trainee_id', 'trainee_id')
        .addSelect('MAX(tps.last_updated)', 'last')
        .where('tps.trainee_id IN (:...ids)', { ids: traineeIds })
        .groupBy('tps.trainee_id')
        .getRawMany<{ trainee_id: string; last: string | null }>();

      const lastByTrainee: Record<string, Date | null> = {};
      for (const id of traineeIds) lastByTrainee[id] = null;

      const mergeLast = (rows: { trainee_id: string; last: string | null }[]) => {
        for (const row of rows) {
          if (!row.last) continue;
          const date = new Date(row.last);
          const current = lastByTrainee[row.trainee_id];
          if (!current || date > current) lastByTrainee[row.trainee_id] = date;
        }
      };

      mergeLast(lastHealth);
      mergeLast(lastBody);
      mergeLast(lastPlanStatus);

      let count = 0;
      for (const id of traineeIds) {
        const last = lastByTrainee[id];
        if (!last || last < cutoff) count++;
      }
      return count;
    };

    const traineesWithNoActivity7Days = await calcNoActivity(cutoff7);
    const traineesWithNoActivity30Days = await calcNoActivity(cutoff30);

    return {
      status: HttpStatus.OK,
      messageEn: 'Platform activity metrics retrieved successfully',
      messageAr: 'تم استرجاع مؤشرات نشاط المنصة بنجاح',
      data: {
        activePlans,
        completedPlans,
        inactivePlans,
        avgCompletionRate,
        traineesWithNoActivity7Days,
        traineesWithNoActivity30Days,
      },
    };
  }

  /**
   * System health alerts
   * GET /dashboard/admin/alerts
   */
  async getAlerts() {
    // Reuse activity metrics to build high-level alerts
    const activity = await this.getActivity();
    const { traineesWithNoActivity7Days } = activity.data as {
      traineesWithNoActivity7Days: number;
    };

    // Inactive coaches = coaches with zero active coach-trainee relationships (future enhancement)
    // For now, we expose a placeholder with 0; logic can be expanded later.
    const inactiveCoaches = 0;

    return {
      status: HttpStatus.OK,
      messageEn: 'System health alerts retrieved successfully',
      messageAr: 'تم استرجاع تنبيهات حالة النظام بنجاح',
      data: {
        alerts: [
          {
            type: 'LOW_ACTIVITY',
            count: traineesWithNoActivity7Days,
          },
          {
            type: 'INACTIVE_COACH',
            count: inactiveCoaches,
          },
        ],
      },
    };
  }
}

