import { Injectable } from '@nestjs/common';
import { TraineeProfilesRepo } from './trainee-profiles.repo';
import {
  CreateTraineeProfileDto,
  UpdateTraineeProfileDto,
  PaginationDto,
  SearchTraineeProfileDto,
} from './dto/trainee-profile.dto';

@Injectable()
export class TraineeProfilesService {
  constructor(private readonly repo: TraineeProfilesRepo) {}

  create(dto: CreateTraineeProfileDto) {
    return this.repo.createEntity({
      user_id: dto.user_id,
      full_name: dto.full_name,
      gender: dto.gender,
      date_of_birth: dto.date_of_birth,
      height_cm: dto.height_cm ?? null,
      weight_kg: dto.weight_kg ?? null,
      fitness_goal: dto.fitness_goal ?? null,
      activity_level: dto.activity_level ?? null,
      medical_notes: dto.medical_notes ?? null,
    });
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateTraineeProfileDto) {
    const payload: any = {};
    if (dto.full_name !== undefined) payload.full_name = dto.full_name;
    if (dto.gender !== undefined) payload.gender = dto.gender;
    if (dto.date_of_birth !== undefined) payload.date_of_birth = dto.date_of_birth;
    if (dto.height_cm !== undefined) payload.height_cm = dto.height_cm ?? null;
    if (dto.weight_kg !== undefined) payload.weight_kg = dto.weight_kg ?? null;
    if (dto.fitness_goal !== undefined) payload.fitness_goal = dto.fitness_goal ?? null;
    if (dto.activity_level !== undefined) payload.activity_level = dto.activity_level ?? null;
    if (dto.medical_notes !== undefined) payload.medical_notes = dto.medical_notes ?? null;
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchTraineeProfileDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }
}

