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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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
  trainee_id?: string; // optional for Admin
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
   * - ADMIN: can provide ?trainee_id=<uuid>
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
    const coaches = await this.coachProfileRepo.find({ where: { status: true } });

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
   * Trainee selects a coach OR Admin assigns a coach to a trainee.
   *
   * - TRAINEE: body { coach_id }
   * - ADMIN: body { coach_id, trainee_id }
   */
  @Post('coaches/select')
  @Roles('TRAINEE', 'ADMIN')
  @ApiOperation({ summary: 'Select or assign a coach for a trainee' })
  @ApiBody({ type: SelectCoachDto })
  async selectOrAssignCoach(
    @Req() req: Request & { user?: RequestUser },
    @Body() body: SelectCoachDto,
  ) {
    const user = req.user;
    const isAdmin = user?.role === 'ADMIN';

    // Determine traineeId
    const traineeId = isAdmin ? body.trainee_id : user?.id;
    const coachId = body.coach_id;

    if (!traineeId || !coachId) {
      return {
        status: HttpStatus.BAD_REQUEST,
        messageEn: 'coach_id and trainee_id are required',
        messageAr: 'coach_id و trainee_id مطلوبان',
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

    // Deactivate any existing ACTIVE relationship for this trainee
    const existing = await this.coachTraineeRepo.findOne({
      where: { trainee_id: traineeId, status: CoachTraineeStatus.ACTIVE },
    });
    if (existing && existing.coach_id !== coachId) {
      existing.status = CoachTraineeStatus.COMPLETED;
      existing.end_date = new Date();
      await this.coachTraineeRepo.save(existing);
    }

    // Create or update relation
    let relation = await this.coachTraineeRepo.findOne({
      where: { trainee_id: traineeId, coach_id: coachId },
    });
    if (!relation) {
      relation = this.coachTraineeRepo.create({
        coach_id: coachId,
        trainee_id: traineeId,
        start_date: new Date(),
        status: CoachTraineeStatus.ACTIVE,
      });
    } else {
      relation.status = CoachTraineeStatus.ACTIVE;
      relation.end_date = null;
    }

    await this.coachTraineeRepo.save(relation);

    return {
      status: HttpStatus.OK,
      messageEn: 'Coach selected/assigned successfully',
      messageAr: 'تم اختيار/تعيين المدرب بنجاح',
      data: {
        coach_id: coachId,
        trainee_id: traineeId,
        status: relation.status,
      },
    };
  }
}
