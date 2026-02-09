import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './common/health.controller';
import { MenuController } from './common/menu.controller';
import { typeOrmConfig } from './config/typeorm.config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { CoachTraineeModule } from './coach-trainee/coach-trainee.module';
import { NutritionPlanModule } from './nutrition-plan/nutrition-plan.module';
import { MealModule } from './meal/meal.module';
import { ExerciseModule } from './exercise/exercise.module';
import { HealthMetricModule } from './health-metric/health-metric.module';
import { TraineeProgressModule } from './trainee-progress/trainee-progress.module';
import { TraineePlanStatusModule } from './trainee-plan-status/trainee-plan-status.module';
import { BodyMeasurementModule } from './body-measurement/body-measurement.module';
import { CoachDashboardModule } from './coach-dashboard/coach-dashboard.module';
import { TraineeDashboardModule } from './trainee-dashboard/trainee-dashboard.module';
import { TraineePlansModule } from './trainee-plans/trainee-plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ name: 'short', ttl: 60000, limit: 10 }]),
    TypeOrmModule.forRoot(typeOrmConfig),
    DatabaseModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') || 'change-me-in-production';
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN')
          ? Number(configService.get<string>('JWT_EXPIRES_IN')) || 604800
          : 604800;
        
        if (!secret || secret === 'change-me-in-production') {
          console.warn('⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env for production!');
        }
        
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    AdminModule,
    AuthModule,
    ProfilesModule,
    RolesModule,
    UsersModule,
    CoachTraineeModule,
    NutritionPlanModule,
    MealModule,
    ExerciseModule,
    HealthMetricModule,
    TraineeProgressModule,
    TraineePlanStatusModule,
    BodyMeasurementModule,
    CoachDashboardModule,
    TraineeDashboardModule,
    TraineePlansModule,
  ],
  controllers: [AppController, HealthController, MenuController],
  providers: [AppService],
})
export class AppModule {}
