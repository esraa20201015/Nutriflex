import { Injectable } from '@nestjs/common';
import { RolesRepo } from './roles.repo';
import {
  CreateRoleDto,
  UpdateRoleDto,
  PaginationDto,
  SearchRoleDto,
} from './dto/role.dto';
import { Role } from './entities/role.entity';
import { RoleStatus } from './enums/role-status.enum';

const SEED_ROLES = [
  { name: 'ADMIN', description: 'Administrator' },
  { name: 'COACH', description: 'Coach / trainer' },
  { name: 'TRAINEE', description: 'Trainee / client' },
];

@Injectable()
export class RolesService {
  constructor(private readonly repo: RolesRepo) {}

  async seedRoles(): Promise<void> {
    for (const { name, description } of SEED_ROLES) {
      const existing = await this.repo.findOne({ where: { name } });
      if (!existing) {
        await this.repo.save(
          this.repo.create({
            name,
            description,
            status: RoleStatus.ACTIVE,
          }),
        );
      }
    }
  }

  async findByName(name: string): Promise<Role | null> {
    return this.repo.findOne({ where: { name: name.toUpperCase() } });
  }

  async create(dto: CreateRoleDto) {
    return this.repo.createEntity({
      name: dto.name,
      description: dto.description ?? null,
      status: dto.status,
      createdBy: dto.createdBy ?? null,
    });
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const payload: Parameters<RolesRepo['updateEntity']>[1] = {
      name: dto.name,
      description: dto.description,
      status: dto.status,
      updatedBy: dto.updatedBy ?? undefined,
    };
    return this.repo.updateEntity(id, payload);
  }

  delete(id: string) {
    return this.repo.deleteEntity(id);
  }

  search(searchDto: SearchRoleDto, pagination: PaginationDto) {
    return this.repo.search({ ...searchDto, ...pagination });
  }

  toggleStatus(id: string) {
    return this.repo.toggleStatus(id);
  }
}
