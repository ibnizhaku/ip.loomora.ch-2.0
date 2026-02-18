import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogQueryDto, AuditLogExportDto, AuditAction, AuditModule } from './dto/audit-log.dto';
import { Request } from 'express';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermissions('settings:read')
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
  @RequirePermissions('settings:read')
  async getStatistics(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    return this.auditLogService.getStatistics(user.companyId, days ? parseInt(days) : 30);
  }

  @Get('export')
  @RequirePermissions('settings:read')
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
  @RequirePermissions('settings:read')
  async getEntityHistory(
    @CurrentUser() user: any,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogService.getEntityHistory(user.companyId, entityType, entityId);
  }

  @Get(':id')
  @RequirePermissions('settings:read')
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.auditLogService.findOne(id, user.companyId);
  }

  @Post('cleanup')
  @RequirePermissions('settings:admin')
  async cleanupExpiredLogs(@CurrentUser() user: any) {
    return this.auditLogService.cleanupExpiredLogs();
  }
}
