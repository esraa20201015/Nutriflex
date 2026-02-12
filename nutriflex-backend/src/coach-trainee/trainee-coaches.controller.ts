import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CoachProfile } from '../profiles/entities/coach-profile.entity';
import { CoachTrainee } from './entities/coach-trainee.entity';
import { CoachTraineeStatus } from './enums/coach-trainee-status.enum';
import { PublicCoachProfileDto } from '../profiles/dto/coach-profile.dto';
import { RequestUser } from '../auth/types/request-user.interface';
import { Request } from 'express';

class SelectCoachDto {
  coach_id: string;
}

@ApiTags('Trainee Coaches')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(RolesGuard)
export class TraineeCoachesController {
  constructor(
    @InjectRepository(CoachProfile)
    private readonly coachProfileRepo: Repository<CoachProfile>,
    @InjectRepository(CoachTrainee)
    private readonly coachTraineeRepo: Repository<CoachTrainee>,
  ) {}

  /**
   * List eligible coaches for a trainee (or for admin inspecting a trainee).
   *
   * - TRAINEE: uses req.user.id as trainee_id.
   * - ADMIN: can provide ?trainee_id=<uuid> to mark which coach is currently selected.
   */
  @Get('coaches/available')
  @Roles('TRAINEE', 'ADMIN')
  @ApiOperation({ summary: 'List eligible coaches for selection' })
  @ApiQuery({ name: 'trainee_id', required: false, description: 'Trainee user ID (admin only)' })
  async listAvailableCoaches(
    @Req() req: Request & { user?: RequestUser },
    @Query('trainee_id') traineeIdQuery?: string,
  ) {
    const user = req.user;

    const isAdmin = user?.role === 'ADMIN';
    const traineeId = isAdmin && traineeIdQuery ? traineeIdQuery : user?.id;

    // Load all active coach profiles
    const coaches = await this.coachProfileRepo.find({
      where: { status: true },
    });

    let selectedCoachId: string | null = null;

    if (traineeId) {
      const existing = await this.coachTraineeRepo.findOne({
        where: { trainee_id: traineeId, status: CoachTraineeStatus.ACTIVE },
      });
      selectedCoachId = existing?.coach_id ?? null;
    }

    const data: PublicCoachProfileDto[] = coaches.map((cp) => ({
      id: cp.user_id,
      fullName: cp.full_name,
      profileImageUrl: cp.profile_image_url,
      specialization: cp.specialization,
      yearsOfExperience: cp.years_of_experience,
      certifications: cp.certifications,
      bio: cp.bio,
      isSelected: selectedCoachId === cp.user_id,
    }));

    return {
      status: HttpStatus.OK,
      messageEn: 'Available coaches retrieved successfully',
      messageAr: 'تم استرجاع المدربين المتاحين بنجاح',
      data,
    };
  }

  /**
   * Trainee selects a coach. Enforces one ACTIVE coach per trainee by
   * completing any existing active relationship before creating/updating the new one.
   */
  @Post('coaches/select')
  @Roles('TRAINEE')
  @ApiOperation({ summary: 'Select a coach for the authenticated trainee' })
  @ApiBody({ type: SelectCoachDto })
  async selectCoach(
    @Req() req: Request & { user?: RequestUser },
    @Body() body: SelectCoachDto,
  ) {
    const user = req.user;
    const traineeId = user?.id;
    const coachId = body.coach_id;

    if (!traineeId || !coachId) {
      return {
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'coach_id and authenticated trainee are required',
        messageAr: 'coach_id والمستخدم المتدرب مطلوبان',
        data: null,
      };
    }

    // Ensure coach exists and is active
    const coachProfile = await this.coachProfileRepo.findOne({
      where: { user_id: coachId, status: true },
    });
    if (!coachProfile) {
      return {
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Selected coach is not available',
        messageAr: 'المدرب المحدد غير متاح',
        data: null,
      };
    }

    // Deactivate any existing active relationship for this trainee
    const existing = await this.coachTraineeRepo.findOne({
      where: { trainee_id: traineeId, status: CoachTraineeStatus.ACTIVE },
    });

    if (existing && existing.coach_id !== coachId) {
      existing.status = CoachTraineeStatus.COMPLETED;
      existing.end_date = new Date();
      await this.coachTraineeRepo.save(existing);
    }

    // Either update existing row (same coach) or create a new one
    let relation = await this.coachTraineeRepo.findOne({
      where: { trainee_id: traineeId, coach_id: coachId },
    });

    if (!relation) {
      relation = this.coachTraineeRepo.create({
        coach_id: coachId,
        trainee_id: traineeId,
        start_date: new Date(),
        end_date: null,
        status: CoachTraineeStatus.ACTIVE,
      });
    } else {
      relation.status = CoachTraineeStatus.ACTIVE;
      relation.end_date = null;
    }

    await this.coachTraineeRepo.save(relation);

    return {
      status: HttpStatus.OK,
      messageEn: 'Coach selected successfully',
      messageAr: 'تم اختيار المدرب بنجاح',
      data: {
        coach_id: coachId,
        trainee_id: traineeId,
        status: relation.status,
      },
    };
  }

  /**
   * Admin assigns or changes a coach for a specific trainee.
   *
   * Route: POST /admin/trainees/:traineeId/coach
   */
  @Post('admin/trainees/:traineeId/coach')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign or change a coach for a trainee (admin)' })
  @ApiParam({ name: 'traineeId', type: String, format: 'uuid' })
  @ApiBody({ type: SelectCoachDto })
  async adminAssignCoach(
    @Param('traineeId') traineeId: string,
    @Body() body: SelectCoachDto,
  ) {
    const coachId = body.coach_id;

    if (!traineeId || !coachId) {
      return {
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'traineeId and coach_id are required',
        messageAr: 'traineeId و coach_id مطلوبان',
        data: null,
      };
    }

    const coachProfile = await this.coachProfileRepo.findOne({
      where: { user_id: coachId, status: true },
    });
    if (!coachProfile) {
      return {
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'Selected coach is not available',
        messageAr: 'المدرب المحدد غير متاح',
        data: null,
      };
    }

    const existing = await this.coachTraineeRepo.findOne({
      where: { trainee_id: traineeId, status: CoachTraineeStatus.ACTIVE },
    });

    if (existing && existing.coach_id !== coachId) {
      existing.status = CoachTraineeStatus.COMPLETED;
      existing.end_date = new Date();
      await this.coachTraineeRepo.save(existing);
    }

    let relation = await this.coachTraineeRepo.findOne({
      where: { trainee_id: traineeId, coach_id: coachId },
    });

    if (!relation) {
      relation = this.coachTraineeRepo.create({
        coach_id: coachId,
        trainee_id: traineeId,
        start_date: new Date(),
        end_date: null,
        status: CoachTraineeStatus.ACTIVE,
      });
    } else {
      relation.status = CoachTraineeStatus.ACTIVE;
      relation.end_date = null;
    }

    await this.coachTraineeRepo.save(relation);

    return {
      status: HttpStatus.OK,
      messageEn: 'Coach assigned to trainee successfully',
      messageAr: 'تم تعيين المدرب للمتدرب بنجاح',
      data: {
        coach_id: coachId,
        trainee_id: traineeId,
        status: relation.status,
      },
    };
  }
}

