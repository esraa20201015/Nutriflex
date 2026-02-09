import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraineePlansController } from './trainee-plans.controller';
import { TraineePlansService } from './trainee-plans.service';
import { NutritionPlan } from '../nutrition-plan/entities/nutrition-plan.entity';
import { TraineePlanStatus } from '../trainee-plan-status/entities/trainee-plan-status.entity';
import { Meal } from '../meal/entities/meal.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NutritionPlan, TraineePlanStatus, Meal]),
    AuthModule,
  ],
  controllers: [TraineePlansController],
  providers: [TraineePlansService],
  exports: [TraineePlansService],
})
export class TraineePlansModule {}
