import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachTrainee } from './entities/coach-trainee.entity';
import { CoachTraineeRepo } from './coach-trainee.repo';
import { CoachTraineeService } from './coach-trainee.service';
import { CoachTraineeController } from './coach-trainee.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoachTrainee]),
    forwardRef(() => AuthModule),
  ],
  controllers: [CoachTraineeController],
  providers: [CoachTraineeRepo, CoachTraineeService],
  exports: [CoachTraineeService],
})
export class CoachTraineeModule {}
