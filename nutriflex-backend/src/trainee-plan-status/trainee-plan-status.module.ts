import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraineePlanStatus } from './entities/trainee-plan-status.entity';
import { TraineePlanStatusRepo } from './trainee-plan-status.repo';
import { TraineePlanStatusService } from './trainee-plan-status.service';
import { TraineePlanStatusController } from './trainee-plan-status.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TraineePlanStatus]),
    forwardRef(() => AuthModule),
  ],
  controllers: [TraineePlanStatusController],
  providers: [TraineePlanStatusRepo, TraineePlanStatusService],
  exports: [TraineePlanStatusService],
})
export class TraineePlanStatusModule {}

