import { Injectable } from '@nestjs/common';
import { BodyMeasurementRepo } from './body-measurement.repo';
import { BodyMeasurement } from './entities/body-measurement.entity';
import {
  CreateBodyMeasurementDto,
  UpdateBodyMeasurementDto,
  PaginationDto,
  SearchBodyMeasurementDto,
} from './dto/body-measurement.dto';

@Injectable()
export class BodyMeasurementService {
  constructor(private readonly repo: BodyMeasurementRepo) {}

  create(dto: CreateBodyMeasurementDto) {
    const payload: Partial<BodyMeasurement> = {
      trainee_id: dto.trainee_id,
      chest_cm: dto.chest_cm ?? null,
      waist_cm: dto.waist_cm ?? null,
      hips_cm: dto.hips_cm ?? null,
      arm_cm: dto.arm_cm ?? null,
      thigh_cm: dto.thigh_cm ?? null,
      measured_date: new Date(dto.measured_date),
    };
    return this.repo.createEntity(payload);
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateBodyMeasurementDto) {
    const payload: Partial<BodyMeasurement> = {};
    if (dto.chest_cm !== undefined) payload.chest_cm = dto.chest_cm ?? null;
    if (dto.waist_cm !== undefined) payload.waist_cm = dto.waist_cm ?? null;
    if (dto.hips_cm !== undefined) payload.hips_cm = dto.hips_cm ?? null;
    if (dto.arm_cm !== undefined) payload.arm_cm = dto.arm_cm ?? null;
    if (dto.thigh_cm !== undefined) payload.thigh_cm = dto.thigh_cm ?? null;
    if (dto.measured_date !== undefined) {
      payload.measured_date = new Date(dto.measured_date);
    }
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchBodyMeasurementDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }
}

