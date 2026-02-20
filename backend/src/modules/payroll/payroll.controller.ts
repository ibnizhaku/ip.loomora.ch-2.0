import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CreatePayslipDto, UpdatePayslipDto } from './dto/payroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

// /payslips controller — list + detail + send
@ApiTags('Payslips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('payslips')
export class PayslipsController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get()
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'List all payslips' })
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('employeeId') employeeId?: string,
    @Query('period') period?: string,
  ) {
    return this.payrollService.findAllPayslips(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      employeeId,
      period,
    });
  }

  @Get(':id')
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'Get payslip by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.findOne(id, user.companyId);
  }

  @Post(':id/send')
  @RequirePermissions('payroll:write')
  @ApiOperation({ summary: 'Send payslip to employee' })
  sendPayslip(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.sendPayslip(id, user.companyId);
  }
}

// /payroll controller — Lohnlauf-Verwaltung
@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('stats')
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'Get payroll statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.getStats(user.companyId);
  }

  @Get()
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'Get payroll overview with runs and employee data' })
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.payrollService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      employeeId,
      status,
    });
  }

  @Get(':id')
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'Get payroll run by ID (with payslips)' })
  findRunById(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.findRunById(id, user.companyId);
  }

  @Post(':id/complete')
  @RequirePermissions('payroll:write')
  @ApiOperation({ summary: 'Complete a payroll run' })
  completeRun(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.completeRun(id, user.companyId);
  }

  @Post()
  @RequirePermissions('payroll:write')
  @ApiOperation({ summary: 'Create new payroll run' })
  createRun(@Body() dto: any, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.createRun(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('payroll:write')
  @ApiOperation({ summary: 'Update payslip' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePayslipDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.payrollService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('payroll:delete')
  @ApiOperation({ summary: 'Delete payroll run with all payslips' })
  removeRun(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.removeRun(id, user.companyId);
  }

  @Get('settings')
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'Get SVS/social insurance rates for current year' })
  getSettings(@CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.getPayrollSettings(user.companyId);
  }

  @Put('settings')
  @RequirePermissions('payroll:write')
  @ApiOperation({ summary: 'Update SVS/social insurance rates' })
  upsertSettings(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: { year?: number; ahvIvEo?: number; alv?: number; bvgEmployee?: number; nbu?: number; ktg?: number; ahvIvEoEmployer?: number; alvEmployer?: number; bvgEmployer?: number; buv?: number; fak?: number },
  ) {
    const year = dto.year || new Date().getFullYear();
    return this.payrollService.upsertPayrollSettings(user.companyId, year, dto);
  }
}
