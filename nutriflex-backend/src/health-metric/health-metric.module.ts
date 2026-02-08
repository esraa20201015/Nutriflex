import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthMetric } from './entities/health-metric.entity';
import { HealthMetricRepo } from './health-metric.repo';
import { HealthMetricService } from './health-metric.service';
import { HealthMetricController } from './health-metric.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HealthMetric]),
    forwardRef(() => AuthModule),
  ],
  controllers: [HealthMetricController],
  providers: [HealthMetricRepo, HealthMetricService],
  exports: [HealthMetricService],
})
export class HealthMetricModule {}

