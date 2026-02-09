import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachProfile } from './entities/coach-profile.entity';
import { TraineeProfile } from './entities/trainee-profile.entity';

export interface CreateCoachProfileDto {
  full_name: string;
  bio?: string | null;
  specialization?: string | null;
  years_of_experience?: number | null;
  certifications?: string | null;
  profile_image_url?: string | null;
  certification_document?: string | null;
  status?: boolean;
}

export interface CreateTraineeProfileDto {
  full_name: string;
  gender: string;
  date_of_birth: string;
  height_cm?: number | null;
  weight_kg?: number | null;
  fitness_goal?: string | null;
  activity_level?: string | null;
  medical_notes?: string | null;
}

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(CoachProfile)
    private readonly coachProfileRepo: Repository<CoachProfile>,
    @InjectRepository(TraineeProfile)
    private readonly traineeProfileRepo: Repository<TraineeProfile>,
  ) {}

  async createCoachProfile(userId: string, dto: CreateCoachProfileDto): Promise<CoachProfile> {
    const profile = this.coachProfileRepo.create({
      user_id: userId,
      full_name: dto.full_name,
      bio: dto.bio ?? null,
      specialization: dto.specialization ?? null,
      years_of_experience: dto.years_of_experience ?? null,
      certifications: dto.certifications ?? null,
      profile_image_url: dto.profile_image_url ?? null,
      certification_document: dto.certification_document ?? null,
      status: dto.status ?? true, // Default to active (true)
    });
    return this.coachProfileRepo.save(profile);
  }

  async createTraineeProfile(userId: string, dto: CreateTraineeProfileDto): Promise<TraineeProfile> {
    const profile = this.traineeProfileRepo.create({
      user_id: userId,
      full_name: dto.full_name,
      gender: dto.gender,
      date_of_birth: dto.date_of_birth,
      height_cm: dto.height_cm ?? null,
      weight_kg: dto.weight_kg ?? null,
      fitness_goal: dto.fitness_goal ?? null,
      activity_level: dto.activity_level ?? null,
      medical_notes: dto.medical_notes ?? null,
    });
    return this.traineeProfileRepo.save(profile);
  }
}

