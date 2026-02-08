import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { AdminDashboardService } from './admin-dashboard.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { TraineePlanStatus } from '../trainee-plan-status/entities/trainee-plan-status.entity';
import { NutritionPlan } from '../nutrition-plan/entities/nutrition-plan.entity';
import { HealthMetric } from '../health-metric/entities/health-metric.entity';
import { BodyMeasurement } from '../body-measurement/entities/body-measurement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      TraineePlanStatus,
      NutritionPlan,
      HealthMetric,
      BodyMeasurement,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [AdminController],
  providers: [AdminDashboardService],
})
export class AdminModule {}

