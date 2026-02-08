import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodyMeasurement } from './entities/body-measurement.entity';
import { BodyMeasurementRepo } from './body-measurement.repo';
import { BodyMeasurementService } from './body-measurement.service';
import { BodyMeasurementController } from './body-measurement.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BodyMeasurement]),
    forwardRef(() => AuthModule),
  ],
  controllers: [BodyMeasurementController],
  providers: [BodyMeasurementRepo, BodyMeasurementService],
  exports: [BodyMeasurementService],
})
export class BodyMeasurementModule {}

