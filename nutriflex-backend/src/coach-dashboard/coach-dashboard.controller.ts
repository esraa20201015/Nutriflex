import { Controller, Get, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CoachDashboardService } from './coach-dashboard.service';
import { Request } from 'express';
import { RequestUser } from '../auth/types/request-user.interface';

@ApiTags('Coach Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(RolesGuard)
@Roles('COACH')
export class CoachDashboardController {
  constructor(private readonly coachDashboardService: CoachDashboardService) {}

  @Get('coach')
  @ApiOperation({ summary: 'Coach dashboard statistics' })
  async getCoachDashboard(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    return this.coachDashboardService.getDashboard(user.id);
  }

  @Get('coach/overview')
  @ApiOperation({ summary: 'Coach dashboard overview - detailed plan statistics' })
  async getCoachOverview(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    return this.coachDashboardService.getOverview(user.id);
  }

  @Get('coach/trainees-progress')
  @ApiOperation({ summary: 'Trainee progress summary' })
  async getTraineesProgress(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    return this.coachDashboardService.getTraineesProgress(user.id);
  }

  @Get('coach/alerts')
  @ApiOperation({ summary: 'Coach alerts and attention needed' })
  async getAlerts(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    return this.coachDashboardService.getAlerts(user.id);
  }

  @Get('coach/recent-activity')
  @ApiOperation({ summary: 'Recent activity feed' })
  async getRecentActivity(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    return this.coachDashboardService.getRecentActivity(user.id);
  }
}

