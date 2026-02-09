import { Controller, Get, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TraineeDashboardService } from './trainee-dashboard.service';
import { Request } from 'express';
import { RequestUser } from '../auth/types/request-user.interface';

@ApiTags('Trainee Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(RolesGuard)
@Roles('TRAINEE')
export class TraineeDashboardController {
  constructor(private readonly traineeDashboardService: TraineeDashboardService) {}

  @Get('trainee')
  @ApiOperation({ summary: 'Trainee dashboard data' })
  async getTraineeDashboard(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    // Security: user.id comes from verified JWT token - ensures trainee only sees their own data
    return this.traineeDashboardService.getDashboard(user.id);
  }

  @Get('trainee/overview')
  @ApiOperation({ summary: 'Trainee personal overview' })
  async getTraineeOverview(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    // Security: user.id comes from verified JWT token - ensures trainee only sees their own data
    return this.traineeDashboardService.getOverview(user.id);
  }

  @Get('trainee/progress')
  @ApiOperation({ summary: 'Trainee progress charts data' })
  async getTraineeProgress(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    // Security: user.id comes from verified JWT token - ensures trainee only sees their own data
    return this.traineeDashboardService.getProgress(user.id);
  }

  @Get('trainee/today')
  @ApiOperation({ summary: 'Trainee today focus data' })
  async getTraineeToday(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    // Security: user.id comes from verified JWT token - ensures trainee only sees their own data
    return this.traineeDashboardService.getToday(user.id);
  }

  @Get('trainee/status')
  @ApiOperation({ summary: 'Trainee motivation & status' })
  async getTraineeStatus(@Req() req: Request & { user?: RequestUser }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    // Security: user.id comes from verified JWT token - ensures trainee only sees their own data
    return this.traineeDashboardService.getStatus(user.id);
  }
}

