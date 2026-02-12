import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'type', required: false, enum: ['invoice', 'project', 'task'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentActivity(
    @CurrentUser() user: CurrentUserPayload,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getRecentActivity(user.companyId, {
      type: type || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
