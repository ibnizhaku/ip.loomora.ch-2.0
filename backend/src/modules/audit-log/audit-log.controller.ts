import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogQueryDto, AuditLogExportDto, AuditAction, AuditModule } from './dto/audit-log.dto';
import { Request } from 'express';

@Controller('audit-log')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('action') action?: AuditAction,
    @Query('module') module?: AuditModule,
    @Query('entityId') entityId?: string,
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.auditLogService.findAll(user.companyId, {
      action,
      module,
      entityId,
      entityType,
      userId,
      startDate,
      endDate,
      search,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get('statistics')
  async getStatistics(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    return this.auditLogService.getStatistics(user.companyId, days ? parseInt(days) : 30);
  }

  @Get('export')
  async export(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('module') module?: AuditModule,
    @Query('format') format?: 'json' | 'csv',
  ) {
    return this.auditLogService.export(user.companyId, {
      startDate,
      endDate,
      module,
      format: format || 'json',
    });
  }

  @Get('entity/:entityType/:entityId')
  async getEntityHistory(
    @CurrentUser() user: any,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogService.getEntityHistory(user.companyId, entityType, entityId);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.auditLogService.findOne(id, user.companyId);
  }

  // Cleanup endpoint (admin only, should be called by cron)
  @Post('cleanup')
  async cleanupExpiredLogs(@CurrentUser() user: any) {
    // TODO: Add admin role check
    return this.auditLogService.cleanupExpiredLogs();
  }
}
