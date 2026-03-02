import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachTrainee } from './entities/coach-trainee.entity';
import { CoachTraineeRepo } from './coach-trainee.repo';
import { CoachTraineeService } from './coach-trainee.service';
import { CoachTraineeController } from './coach-trainee.controller';
import { AuthModule } from '../auth/auth.module';
import { CoachProfile } from '../profiles/entities/coach-profile.entity';
import { TraineeCoachesController } from './trainee-coaches.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoachTrainee, CoachProfile]),
    forwardRef(() => AuthModule),
  ],
  controllers: [CoachTraineeController, TraineeCoachesController],
  providers: [CoachTraineeRepo, CoachTraineeService],
  exports: [CoachTraineeService],
})
export class CoachTraineeModule {}
