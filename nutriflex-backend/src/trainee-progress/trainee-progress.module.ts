import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraineeProgress } from './entities/trainee-progress.entity';
import { TraineeProgressRepo } from './trainee-progress.repo';
import { TraineeProgressService } from './trainee-progress.service';
import { TraineeProgressController } from './trainee-progress.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TraineeProgress]),
    forwardRef(() => AuthModule),
  ],
  controllers: [TraineeProgressController],
  providers: [TraineeProgressRepo, TraineeProgressService],
  exports: [TraineeProgressService],
})
export class TraineeProgressModule {}

