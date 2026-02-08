import { Injectable } from '@nestjs/common';
import { NutritionPlanRepo } from './nutrition-plan.repo';
import { NutritionPlan } from './entities/nutrition-plan.entity';
import {
  CreateNutritionPlanDto,
  UpdateNutritionPlanDto,
  PaginationDto,
  SearchNutritionPlanDto,
} from './dto/nutrition-plan.dto';

@Injectable()
export class NutritionPlanService {
  constructor(private readonly repo: NutritionPlanRepo) {}

  create(dto: CreateNutritionPlanDto) {
    const payload: Partial<NutritionPlan> = {
      coach_id: dto.coach_id,
      trainee_id: dto.trainee_id,
      title: dto.title,
      description: dto.description ?? null,
      daily_calories: dto.daily_calories ?? null,
      start_date: new Date(dto.start_date),
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      status: dto.status,
    };
    return this.repo.createEntity(payload);
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateNutritionPlanDto) {
    const payload: Partial<NutritionPlan> = {};
    if (dto.title !== undefined) payload.title = dto.title;
    if (dto.description !== undefined) payload.description = dto.description ?? null;
    if (dto.daily_calories !== undefined) payload.daily_calories = dto.daily_calories ?? null;
    if (dto.start_date !== undefined) payload.start_date = new Date(dto.start_date);
    if (dto.end_date !== undefined) payload.end_date = dto.end_date ? new Date(dto.end_date) : null;
    if (dto.status !== undefined) payload.status = dto.status;
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchNutritionPlanDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }

  toggleStatus(id: string) {
    return this.repo.toggleStatus(id);
  }
}
