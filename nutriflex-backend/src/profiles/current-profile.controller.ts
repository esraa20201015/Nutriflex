import {
  Body,
  Controller,
  Get,
  Put,
  HttpStatus,
  ForbiddenException,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { RequestUser } from '../auth/types/request-user.interface';
import { CoachProfilesRepo } from './coach-profiles.repo';
import { TraineeProfilesRepo } from './trainee-profiles.repo';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from '../users/users.service';
import { toDataUrl } from '../common/utils/image.util';
import { BodyMeasurementService } from '../body-measurement/body-measurement.service';

class UpdateCurrentProfileDto {
  fullName?: string;
  email?: string;
  /** Optional URL (e.g. existing avatar URL) */
  avatarUrl?: string;
  /** Optional base64 image for avatar upload (raw base64 or data:image/...;base64,...) */
  avatarBase64?: string;
  /** Alias for avatarBase64 – some clients send "avatar" */
  avatar?: string;
}

@ApiTags('Current Profile')
@ApiBearerAuth('access-token')
@Controller('profile')
@UseGuards(RolesGuard)
export class CurrentProfileController {
  constructor(
    private readonly coachProfilesRepo: CoachProfilesRepo,
    private readonly traineeProfilesRepo: TraineeProfilesRepo,
    private readonly usersService: UsersService,
    private readonly bodyMeasurementService: BodyMeasurementService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile based on role' })
  async getMyProfile(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;

    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }

    const userId = user.id;
    const role = user.role || 'UNKNOWN';

    let profile: unknown = null;

    if (role === 'COACH') {
      const coachProfile = await this.coachProfilesRepo.findOne({
        where: { user_id: userId },
        relations: ['user'],
      });
      profile = coachProfile;
    } else if (role === 'TRAINEE') {
      const traineeProfile = await this.traineeProfilesRepo.findOne({
        where: { user_id: userId },
        relations: ['user'],
      });
      profile = traineeProfile;
    } else {
      // ADMIN or other roles: no role-specific profile
      profile = null;
    }

    // Always load avatarUrl from users table so it's correct for all roles (including ADMIN)
    const userEntity = await this.usersService.findUserById(userId);
    const avatarUrl = userEntity?.avatarUrl ?? null;

    return {
      status: HttpStatus.OK,
      messageEn: 'Current user profile retrieved successfully',
      messageAr: 'تم استرجاع ملف المستخدم الحالي بنجاح',
      data: {
        userId,
        role,
        profile,
        avatarUrl,
      },
    };
  }

  @Put('me/avatar')
  @ApiOperation({ summary: 'Update current user avatar only (base64)' })
  async updateMyAvatar(
    @Req() req: Request & { user?: RequestUser },
    @Body() body: { avatarBase64?: string; avatar?: string },
  ) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    const raw =
      typeof body.avatarBase64 === 'string' && body.avatarBase64.trim() !== ''
        ? body.avatarBase64
        : typeof body.avatar === 'string' && body.avatar.trim() !== ''
          ? body.avatar
          : undefined;
    if (raw == null) {
      throw new ForbiddenException({
        messageEn: 'avatarBase64 or avatar is required',
        messageAr: 'مطلوب صورة رمزية (avatarBase64 أو avatar)',
      });
    }
    const avatarUrl = toDataUrl(raw);
    const updateResult = await this.usersService.update(user.id, { avatarUrl });
    if ((updateResult as { status?: number }).status !== HttpStatus.OK) {
      return updateResult;
    }
    const updatedUser = await this.usersService.findUserById(user.id);
    const savedAvatarUrl = updatedUser?.avatarUrl ?? null;
    return {
      status: HttpStatus.OK,
      messageEn: 'Avatar updated successfully',
      messageAr: 'تم تحديث الصورة الرمزية بنجاح',
      data: {
        avatarUrl: savedAvatarUrl,
        avatarUpdated: true,
      },
    };
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user basic info (name, email, avatar)' })
  async updateMyProfile(
    @Req() req: Request & { user?: RequestUser },
    @Body() dto: UpdateCurrentProfileDto,
  ) {
    const user = req.user;

    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }

    // Only treat non-empty strings as avatar update (empty string = don't overwrite)
    const rawAvatar =
      typeof dto.avatarBase64 === 'string' && dto.avatarBase64.trim() !== ''
        ? dto.avatarBase64
        : typeof dto.avatar === 'string' && dto.avatar.trim() !== ''
          ? dto.avatar
          : dto.avatarUrl;
    const avatarPayload =
      rawAvatar !== undefined && rawAvatar !== null ? toDataUrl(rawAvatar) : undefined;
    const avatarUpdated = avatarPayload !== undefined;

    const updateResult = await this.usersService.update(user.id, {
      fullName: dto.fullName,
      email: dto.email,
      ...(avatarPayload !== undefined && { avatarUrl: avatarPayload }),
    });

    if ((updateResult as { status?: number }).status !== HttpStatus.OK) {
      return updateResult;
    }

    // Re-fetch user so response always has the saved avatarUrl from DB
    const updatedUser = await this.usersService.findUserById(user.id);
    const savedAvatarUrl = updatedUser?.avatarUrl ?? null;

    return {
      status: HttpStatus.OK,
      messageEn: avatarUpdated
        ? 'Profile and avatar updated successfully'
        : 'Profile updated successfully',
      messageAr: avatarUpdated
        ? 'تم تحديث الملف الشخصي والصورة الرمزية بنجاح'
        : 'تم تحديث الملف الشخصي بنجاح',
      data: {
        userId: user.id,
        role: user.role || 'UNKNOWN',
        profile: null,
        avatarUrl: savedAvatarUrl,
        avatarUpdated,
      },
    };
  }

  @Post('me/body-measurement')
  @ApiOperation({
    summary:
      'Append a new body measurement row for the current trainee and update profile snapshot (height/weight)',
  })
  async addMyBodyMeasurement(
    @Req() req: Request & { user?: RequestUser },
    @Body()
    body: {
      heightCm?: number | null;
      weightKg?: number | null;
      waistCm?: number | null;
      chestCm?: number | null;
      hipsCm?: number | null;
      armCm?: number | null;
      thighCm?: number | null;
    },
  ) {
    const user = req.user;

    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }

    if (user.role !== 'TRAINEE') {
      throw new ForbiddenException({
        messageEn: 'Only trainees can update body measurements',
        messageAr: 'يستطيع المتدربون فقط تحديث قياسات الجسم',
      });
    }

    const traineeId = user.id;

    // Create new measurement history row (waist/chest/hips/arm/thigh)
    const nowIso = new Date().toISOString();
    await this.bodyMeasurementService.create({
      trainee_id: traineeId,
      chest_cm: body.chestCm ?? null,
      waist_cm: body.waistCm ?? null,
      hips_cm: body.hipsCm ?? null,
      arm_cm: body.armCm ?? null,
      thigh_cm: body.thighCm ?? null,
      measured_date: nowIso,
    });

    // Update profile snapshot for height/weight if provided
    const updateProfilePayload: Partial<{
      height_cm: number | null;
      weight_kg: number | null;
    }> = {};
    if (body.heightCm !== undefined) {
      updateProfilePayload.height_cm = body.heightCm ?? null;
    }
    if (body.weightKg !== undefined) {
      updateProfilePayload.weight_kg = body.weightKg ?? null;
    }
    if (Object.keys(updateProfilePayload).length > 0) {
      await this.traineeProfilesRepo.update(
        { user_id: traineeId },
        updateProfilePayload,
      );
    }

    const updatedProfile = await this.traineeProfilesRepo.findOne({
      where: { user_id: traineeId },
      relations: ['user'],
    });

    return {
      status: HttpStatus.OK,
      messageEn: 'Body measurements updated successfully',
      messageAr: 'تم تحديث قياسات الجسم بنجاح',
      data: {
        userId: traineeId,
        role: user.role || 'TRAINEE',
        profile: updatedProfile,
      },
    };
  }
}

