import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(RolesGuard)
@Roles('ADMIN') // Only Admin can access admin endpoints
export class AdminController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('admin')
  @ApiOperation({ summary: 'Admin dashboard statistics' })
  async getDashboard() {
    return this.dashboardService.getDashboard();
  }

  @Get('admin/accounts-status')
  @ApiOperation({ summary: 'Admin account status & approval metrics' })
  async getAccountsStatus() {
    return this.dashboardService.getAccountsStatus();
  }

  @Get('admin/activity')
  @ApiOperation({ summary: 'Admin platform activity metrics' })
  async getActivity() {
    return this.dashboardService.getActivity();
  }

  @Get('admin/alerts')
  @ApiOperation({ summary: 'Admin system health alerts' })
  async getAlerts() {
    return this.dashboardService.getAlerts();
  }
}
