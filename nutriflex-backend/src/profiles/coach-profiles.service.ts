import { Injectable } from '@nestjs/common';
import { CoachProfilesRepo } from './coach-profiles.repo';
import {
  CreateCoachProfileDto,
  UpdateCoachProfileDto,
  PaginationDto,
  SearchCoachProfileDto,
} from './dto/coach-profile.dto';

@Injectable()
export class CoachProfilesService {
  constructor(private readonly repo: CoachProfilesRepo) {}

  create(dto: CreateCoachProfileDto) {
    return this.repo.createEntity(dto);
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateCoachProfileDto) {
    return this.repo.updateEntity(id, dto);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchCoachProfileDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }

  toggleStatus(id: string) {
    return this.repo.toggleStatus(id);
  }
}
