import { Injectable } from '@nestjs/common';
import { TraineePlanStatusRepo } from './trainee-plan-status.repo';
import { TraineePlanStatus } from './entities/trainee-plan-status.entity';
import {
  CreateTraineePlanStatusDto,
  UpdateTraineePlanStatusDto,
  PaginationDto,
  SearchTraineePlanStatusDto,
} from './dto/trainee-plan-status.dto';

@Injectable()
export class TraineePlanStatusService {
  constructor(private readonly repo: TraineePlanStatusRepo) {}

  create(dto: CreateTraineePlanStatusDto) {
    const payload: Partial<TraineePlanStatus> = {
      trainee_id: dto.trainee_id,
      plan_id: dto.plan_id,
      completion_percentage: dto.completion_percentage ?? 0,
      status: dto.status,
      last_updated: new Date(),
    };
    return this.repo.createEntity(payload);
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateTraineePlanStatusDto) {
    const payload: Partial<TraineePlanStatus> = {};
    if (dto.completion_percentage !== undefined) {
      payload.completion_percentage = dto.completion_percentage;
    }
    if (dto.status !== undefined) {
      payload.status = dto.status;
    }
    payload.last_updated = new Date();
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchTraineePlanStatusDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }
}

