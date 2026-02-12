import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionPlan } from './entities/nutrition-plan.entity';
import { PlanExercise } from './entities/plan-exercise.entity';
import { NutritionPlanRepo } from './nutrition-plan.repo';
import { NutritionPlanService } from './nutrition-plan.service';
import { NutritionPlanController } from './nutrition-plan.controller';
import { AuthModule } from '../auth/auth.module';
import { MealModule } from '../meal/meal.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NutritionPlan, PlanExercise]),
    forwardRef(() => AuthModule),
    forwardRef(() => MealModule),
  ],
  controllers: [NutritionPlanController],
  providers: [NutritionPlanRepo, NutritionPlanService],
  exports: [NutritionPlanService],
})
export class NutritionPlanModule {}
