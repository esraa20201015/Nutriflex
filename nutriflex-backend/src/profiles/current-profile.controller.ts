import {
  Body,
  Controller,
  Get,
  Put,
  HttpStatus,
  ForbiddenException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { RequestUser } from '../auth/types/request-user.interface';
import { CoachProfilesRepo } from './coach-profiles.repo';
import { TraineeProfilesRepo } from './trainee-profiles.repo';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from '../users/users.service';

class UpdateCurrentProfileDto {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
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
      // ADMIN or other roles: return basic user info from token
      profile = null;
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Current user profile retrieved successfully',
      messageAr: 'تم استرجاع ملف المستخدم الحالي بنجاح',
      data: {
        userId,
        role,
        profile,
        avatarUrl: (profile as any)?.user?.avatarUrl ?? null,
      },
    };
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user basic info (name, email)' })
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

    const updateResult = await this.usersService.update(user.id, {
      fullName: dto.fullName,
      email: dto.email,
      avatarUrl: dto.avatarUrl,
    });

    if ((updateResult as { status?: number }).status !== HttpStatus.OK) {
      // Pass through repository-style response on failure
      return updateResult;
    }

    return {
      status: HttpStatus.OK,
      messageEn: 'Profile updated successfully',
      messageAr: 'تم تحديث الملف الشخصي بنجاح',
      data: {
        userId: user.id,
        role: user.role || 'UNKNOWN',
        profile: null,
        avatarUrl: dto.avatarUrl ?? null,
      },
    };
  }
}

