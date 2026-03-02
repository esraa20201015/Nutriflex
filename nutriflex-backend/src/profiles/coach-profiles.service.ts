import { Injectable } from '@nestjs/common';
import { CoachProfilesRepo } from './coach-profiles.repo';
import {
  CreateCoachProfileDto,
  UpdateCoachProfileDto,
  PaginationDto,
  SearchCoachProfileDto,
} from './dto/coach-profile.dto';
import { toDataUrl } from '../common/utils/image.util';
import { CoachProfile } from './entities/coach-profile.entity';

@Injectable()
export class CoachProfilesService {
  constructor(private readonly repo: CoachProfilesRepo) {}

  create(dto: CreateCoachProfileDto) {
    const profileImageUrl =
      dto.profile_image_url ?? (dto.profile_image_base64 ? toDataUrl(dto.profile_image_base64) : null);
    const certificationDocument = dto.certification_document_base64
      ? toDataUrl(dto.certification_document_base64, 'image/jpeg')
      : null;
    const payload: Partial<CoachProfile> = {
      user_id: dto.user_id,
      full_name: dto.full_name,
      bio: dto.bio ?? null,
      specialization: dto.specialization ?? null,
      years_of_experience: dto.years_of_experience ?? null,
      certifications: dto.certifications ?? null,
      profile_image_url: profileImageUrl,
      certification_document: certificationDocument,
      status: dto.status ?? true,
    };
    return this.repo.createEntity(payload);
  }

  findAll(pagination: PaginationDto) {
    return this.repo.findAll(pagination);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateCoachProfileDto) {
    const payload: Partial<CoachProfile> = {};
    if (dto.full_name !== undefined) payload.full_name = dto.full_name;
    if (dto.bio !== undefined) payload.bio = dto.bio;
    if (dto.specialization !== undefined) payload.specialization = dto.specialization;
    if (dto.years_of_experience !== undefined) payload.years_of_experience = dto.years_of_experience;
    if (dto.certifications !== undefined) payload.certifications = dto.certifications;
    if (dto.status !== undefined) payload.status = dto.status;
    if (dto.profile_image_base64 != null) {
      payload.profile_image_url = toDataUrl(dto.profile_image_base64);
    } else if (dto.profile_image_url !== undefined) {
      payload.profile_image_url = dto.profile_image_url;
    }
    if (dto.certification_document_base64 != null) {
      payload.certification_document = toDataUrl(dto.certification_document_base64, 'image/jpeg');
    }
    return this.repo.updateEntity(id, payload);
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
