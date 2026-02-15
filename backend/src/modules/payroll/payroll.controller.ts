import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CreatePayslipDto, UpdatePayslipDto } from './dto/payroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

// /payslips controller — list + detail
@ApiTags('Payslips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payslips')
export class PayslipsController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get()
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
  @ApiOperation({ summary: 'Get payslip by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.findOne(id, user.companyId);
  }
}

// /payroll controller — Lohnlauf-Verwaltung
@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get payroll statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.getStats(user.companyId);
  }

  @Get()
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
  @ApiOperation({ summary: 'Get payslip by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.findOne(id, user.companyId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a payroll run (mark all payslips as paid)' })
  completeRun(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.completeRun(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new payslip' })
  create(@Body() dto: CreatePayslipDto, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payslip' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePayslipDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.payrollService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payslip' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.remove(id, user.companyId);
  }
}
