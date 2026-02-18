import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ServiceTicketsService } from './service-tickets.service';
import { 
  CreateServiceTicketDto, 
  UpdateServiceTicketDto, 
  ServiceReportDto,
  ScheduleTechnicianDto,
} from './dto/service-ticket.dto';

@ApiTags('Service Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('service-tickets')
export class ServiceTicketsController {
  constructor(private readonly serviceTicketsService: ServiceTicketsService) {}

  @Get()
  @RequirePermissions('service-tickets:read')
  @ApiOperation({ summary: 'List all service tickets' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('serviceType') serviceType?: string,
    @Query('customerId') customerId?: string,
    @Query('technicianId') technicianId?: string,
    @Query('search') search?: string,
  ) {
    return this.serviceTicketsService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      priority,
      serviceType,
      customerId,
      technicianId,
      search,
    });
  }

  @Get('stats')
  @RequirePermissions('service-tickets:read')
  @ApiOperation({ summary: 'Get service ticket stats' })
  getStats(@CurrentUser() user: any) {
    return this.serviceTicketsService.getStatistics(user.companyId);
  }

  @Get('statistics')
  @RequirePermissions('service-tickets:read')
  @ApiOperation({ summary: 'Get service ticket statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.serviceTicketsService.getStatistics(user.companyId);
  }

  @Get('upcoming-maintenance')
  @RequirePermissions('service-tickets:read')
  @ApiOperation({ summary: 'Get upcoming maintenance schedule' })
  getUpcomingMaintenance(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    return this.serviceTicketsService.getUpcomingMaintenance(
      user.companyId,
      days ? parseInt(days) : undefined,
    );
  }

  @Get('technician-availability/:technicianId')
  @RequirePermissions('service-tickets:read')
  @ApiOperation({ summary: 'Get technician availability' })
  getTechnicianAvailability(
    @CurrentUser() user: any,
    @Param('technicianId') technicianId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.serviceTicketsService.getTechnicianAvailability(
      user.companyId,
      technicianId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @RequirePermissions('service-tickets:read')
  @ApiOperation({ summary: 'Get service ticket by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.serviceTicketsService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('service-tickets:write')
  @ApiOperation({ summary: 'Create new service ticket' })
  create(@Body() dto: CreateServiceTicketDto, @CurrentUser() user: any) {
    return this.serviceTicketsService.create(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('service-tickets:write')
  @ApiOperation({ summary: 'Update service ticket' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.serviceTicketsService.update(id, user.companyId, dto);
  }

  @Post(':id/report')
  @RequirePermissions('service-tickets:write')
  @ApiOperation({ summary: 'Add service report' })
  addReport(
    @Param('id') id: string,
    @Body() dto: ServiceReportDto,
    @CurrentUser() user: any,
  ) {
    return this.serviceTicketsService.addReport(id, user.companyId, dto);
  }

  @Post(':id/schedule')
  @RequirePermissions('service-tickets:write')
  @ApiOperation({ summary: 'Schedule technician for ticket' })
  scheduleTechnician(
    @Param('id') id: string,
    @Body() dto: ScheduleTechnicianDto,
    @CurrentUser() user: any,
  ) {
    return this.serviceTicketsService.scheduleTechnician(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('service-tickets:delete')
  @ApiOperation({ summary: 'Delete service ticket' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.serviceTicketsService.delete(id, user.companyId);
  }
}
