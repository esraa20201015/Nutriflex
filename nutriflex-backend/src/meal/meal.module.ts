import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from './entities/meal.entity';
import { MealRepo } from './meal.repo';
import { MealService } from './meal.service';
import { MealController } from './meal.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meal]),
    forwardRef(() => AuthModule),
  ],
  controllers: [MealController],
  providers: [MealRepo, MealService],
  exports: [MealService],
})
export class MealModule {}
