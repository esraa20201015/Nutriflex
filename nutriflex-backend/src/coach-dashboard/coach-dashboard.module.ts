import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachDashboardController } from './coach-dashboard.controller';
import { CoachDashboardService } from './coach-dashboard.service';
import { AuthModule } from '../auth/auth.module';
import { CoachTrainee } from '../coach-trainee/entities/coach-trainee.entity';
import { NutritionPlan } from '../nutrition-plan/entities/nutrition-plan.entity';
import { TraineePlanStatus } from '../trainee-plan-status/entities/trainee-plan-status.entity';
import { HealthMetric } from '../health-metric/entities/health-metric.entity';
import { BodyMeasurement } from '../body-measurement/entities/body-measurement.entity';
import { TraineeProfile } from '../profiles/entities/trainee-profile.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CoachTrainee,
      NutritionPlan,
      TraineePlanStatus,
      HealthMetric,
      BodyMeasurement,
      TraineeProfile,
      User,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [CoachDashboardController],
  providers: [CoachDashboardService],
})
export class CoachDashboardModule {}

