import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CreatePayslipDto, UpdatePayslipDto } from './dto/payroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get()
  @ApiOperation({ summary: 'List all payslips' })
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.payrollService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      employeeId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payslip by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.payrollService.findOne(id, user.companyId);
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
