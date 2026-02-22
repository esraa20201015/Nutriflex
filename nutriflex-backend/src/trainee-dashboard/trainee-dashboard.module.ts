import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraineeDashboardController } from './trainee-dashboard.controller';
import { TraineeDashboardService } from './trainee-dashboard.service';
import { AuthModule } from '../auth/auth.module';
import { HealthMetric } from '../health-metric/entities/health-metric.entity';
import { BodyMeasurement } from '../body-measurement/entities/body-measurement.entity';
import { NutritionPlan } from '../nutrition-plan/entities/nutrition-plan.entity';
import { TraineePlanStatus } from '../trainee-plan-status/entities/trainee-plan-status.entity';
import { TraineeProfile } from '../profiles/entities/trainee-profile.entity';
import { User } from '../users/entities/user.entity';
import { CoachTrainee } from '../coach-trainee/entities/coach-trainee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HealthMetric,
      BodyMeasurement,
      NutritionPlan,
      TraineePlanStatus,
      TraineeProfile,
      User,
      CoachTrainee,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [TraineeDashboardController],
  providers: [TraineeDashboardService],
})
export class TraineeDashboardModule {}

