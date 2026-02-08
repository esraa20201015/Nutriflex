import { Injectable } from '@nestjs/common';
import { TraineeProgressRepo } from './trainee-progress.repo';
import { TraineeProgress } from './entities/trainee-progress.entity';
import {
  CreateTraineeProgressDto,
  UpdateTraineeProgressDto,
  PaginationDto,
  SearchTraineeProgressDto,
} from './dto/trainee-progress.dto';

@Injectable()
export class TraineeProgressService {
  constructor(private readonly repo: TraineeProgressRepo) {}

  create(dto: CreateTraineeProgressDto) {
    const payload: Partial<TraineeProgress> = {
      trainee_id: dto.trainee_id,
      period_type: dto.period_type,
      period_start: dto.period_start,
      period_end: dto.period_end,
      summary: dto.summary,
      coach_notes: dto.coach_notes ?? null,
    };
    return this.repo.createEntity(payload);
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateTraineeProgressDto) {
    const payload: Partial<TraineeProgress> = {};
    if (dto.period_type !== undefined) payload.period_type = dto.period_type;
    if (dto.period_start !== undefined) payload.period_start = dto.period_start;
    if (dto.period_end !== undefined) payload.period_end = dto.period_end;
    if (dto.summary !== undefined) payload.summary = dto.summary;
    if (dto.coach_notes !== undefined) payload.coach_notes = dto.coach_notes ?? null;
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchTraineeProgressDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }
}

