import { Injectable } from '@nestjs/common';
import { ExerciseRepo } from './exercise.repo';
import { Exercise } from './entities/exercise.entity';
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  PaginationDto,
  SearchExerciseDto,
} from './dto/exercise.dto';

@Injectable()
export class ExerciseService {
  constructor(private readonly repo: ExerciseRepo) {}

  create(dto: CreateExerciseDto) {
    const payload: Partial<Exercise> = {
      coach_id: dto.coach_id,
      trainee_id: dto.trainee_id,
      name: dto.name,
      exercise_type: dto.exercise_type,
      sets: dto.sets ?? null,
      reps: dto.reps ?? null,
      duration_minutes: dto.duration_minutes ?? null,
      instructions: dto.instructions ?? null,
    };
    return this.repo.createEntity(payload);
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateExerciseDto) {
    const payload: Partial<Exercise> = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.exercise_type !== undefined) payload.exercise_type = dto.exercise_type;
    if (dto.sets !== undefined) payload.sets = dto.sets ?? null;
    if (dto.reps !== undefined) payload.reps = dto.reps ?? null;
    if (dto.duration_minutes !== undefined) payload.duration_minutes = dto.duration_minutes ?? null;
    if (dto.instructions !== undefined) payload.instructions = dto.instructions ?? null;
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchExerciseDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }
}

