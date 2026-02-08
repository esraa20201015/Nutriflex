import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionPlan } from './entities/nutrition-plan.entity';
import { NutritionPlanRepo } from './nutrition-plan.repo';
import { NutritionPlanService } from './nutrition-plan.service';
import { NutritionPlanController } from './nutrition-plan.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NutritionPlan]),
    forwardRef(() => AuthModule),
  ],
  controllers: [NutritionPlanController],
  providers: [NutritionPlanRepo, NutritionPlanService],
  exports: [NutritionPlanService],
})
export class NutritionPlanModule {}
