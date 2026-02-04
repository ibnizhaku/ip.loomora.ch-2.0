import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard KPIs (READ-ONLY, server-calculated)' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.dashboardService.getStats(user.companyId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity' })
  getRecentActivity(@CurrentUser() user: CurrentUserPayload) {
    return this.dashboardService.getRecentActivity(user.companyId);
  }
}
