import { Controller, Get, Param, Query, Req, UseGuards, ForbiddenException, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TraineePlansService } from './trainee-plans.service';
import { Request } from 'express';
import { RequestUser } from '../auth/types/request-user.interface';
import { NutritionPlanStatus } from '../nutrition-plan/enums/nutrition-plan-status.enum';

@ApiTags('Trainee Plans')
@ApiBearerAuth('access-token')
@Controller('plans/trainee')
@UseGuards(RolesGuard)
@Roles('TRAINEE')
export class TraineePlansController {
  constructor(private readonly traineePlansService: TraineePlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all nutrition plans for the authenticated trainee' })
  @ApiQuery({ name: 'status', enum: NutritionPlanStatus, required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getAllPlans(
    @Req() req: Request & { user?: RequestUser },
    @Query('status') status?: NutritionPlanStatus,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    // Security: user.id comes from verified JWT token - ensures trainee only sees their own plans
    return this.traineePlansService.getAllPlans(user.id, { status, skip, take });
  }

  @Get(':id/meals')
  @ApiOperation({ summary: 'Get all meals for a specific nutrition plan' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async getPlanMeals(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) planId: string,
  ) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    // Security: user.id comes from verified JWT token - ensures trainee only sees their own plans
    return this.traineePlansService.getPlanMeals(user.id, planId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get completion status for a specific nutrition plan' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async getPlanStatus(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) planId: string,
  ) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    // Security: user.id comes from verified JWT token - ensures trainee only sees their own plans
    return this.traineePlansService.getPlanStatus(user.id, planId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed nutrition plan with meals' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async getPlanDetails(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) planId: string,
  ) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }
    // Security: user.id comes from verified JWT token - ensures trainee only sees their own plans
    return this.traineePlansService.getPlanDetails(user.id, planId);
  }
}
