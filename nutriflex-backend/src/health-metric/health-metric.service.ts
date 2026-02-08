import { Injectable } from '@nestjs/common';
import { HealthMetricRepo } from './health-metric.repo';
import { HealthMetric } from './entities/health-metric.entity';
import {
  CreateHealthMetricDto,
  UpdateHealthMetricDto,
  PaginationDto,
  SearchHealthMetricDto,
} from './dto/health-metric.dto';

@Injectable()
export class HealthMetricService {
  constructor(private readonly repo: HealthMetricRepo) {}

  create(dto: CreateHealthMetricDto) {
    const payload: Partial<HealthMetric> = {
      trainee_id: dto.trainee_id,
      metric_type: dto.metric_type,
      value: dto.value,
      unit: dto.unit,
      recorded_date: new Date(dto.recorded_date),
    };
    return this.repo.createEntity(payload);
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateHealthMetricDto) {
    const payload: Partial<HealthMetric> = {};
    if (dto.metric_type !== undefined) payload.metric_type = dto.metric_type;
    if (dto.value !== undefined) payload.value = dto.value;
    if (dto.unit !== undefined) payload.unit = dto.unit;
    if (dto.recorded_date !== undefined) {
      payload.recorded_date = new Date(dto.recorded_date);
    }
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchHealthMetricDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }
}

