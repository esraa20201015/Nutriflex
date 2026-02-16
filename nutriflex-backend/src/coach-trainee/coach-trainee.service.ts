import { Injectable } from '@nestjs/common';
import { CoachTraineeRepo } from './coach-trainee.repo';
import { CoachTrainee } from './entities/coach-trainee.entity';
import {
  CreateCoachTraineeDto,
  UpdateCoachTraineeDto,
  PaginationDto,
  SearchCoachTraineeDto,
} from './dto/coach-trainee.dto';
import { CoachTraineeStatus } from './enums/coach-trainee-status.enum';

@Injectable()
export class CoachTraineeService {
  constructor(private readonly repo: CoachTraineeRepo) {}

  create(dto: CreateCoachTraineeDto) {
    const payload: Partial<CoachTrainee> = {
      coach_id: dto.coach_id,
      trainee_id: dto.trainee_id,
      start_date: dto.start_date ? new Date(dto.start_date) : new Date(),
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

  update(id: string, dto: UpdateCoachTraineeDto) {
    const payload: Partial<CoachTrainee> = {};
    if (dto.start_date !== undefined) payload.start_date = new Date(dto.start_date);
    if (dto.end_date !== undefined) payload.end_date = dto.end_date ? new Date(dto.end_date) : null;
    if (dto.status !== undefined) payload.status = dto.status;
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchCoachTraineeDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }

  toggleStatus(id: string) {
    return this.repo.toggleStatus(id);
  }

  // ======= New method to get all trainees for a coach =======
  getTraineesByCoach(coach_id: string) {
    return this.repo.getTraineesByCoach(coach_id);
  }
}
