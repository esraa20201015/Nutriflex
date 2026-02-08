import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { ExerciseRepo } from './exercise.repo';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exercise]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ExerciseController],
  providers: [ExerciseRepo, ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule {}

