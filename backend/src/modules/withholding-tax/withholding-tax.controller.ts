import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WithholdingTaxService } from './withholding-tax.service';
import { 
  CreateQstEmployeeDto, 
  UpdateQstEmployeeDto, 
  QstCalculationDto,
  QstAnnualReconciliationDto 
} from './dto/withholding-tax.dto';

@ApiTags('Withholding Tax (Quellensteuer)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('withholding-tax')
export class WithholdingTaxController {
  constructor(private readonly qstService: WithholdingTaxService) {}

  @Get()
  @ApiOperation({ summary: 'List all employees with QST data' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('kanton') kanton?: string,
  ) {
    return this.qstService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      kanton,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get QST statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.qstService.getStatistics(user.companyId);
  }

  @Get('report/:year/:month')
  @ApiOperation({ summary: 'Generate monthly QST report' })
  generateMonthlyReport(
    @Param('year') year: string,
    @Param('month') month: string,
    @CurrentUser() user: any,
  ) {
    return this.qstService.generateMonthlyReport(user.companyId, parseInt(year), parseInt(month));
  }

  @Get('employee/:id')
  @ApiOperation({ summary: 'Get employee QST data' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qstService.findOne(id, user.companyId);
  }

  @Post('employee')
  @ApiOperation({ summary: 'Assign QST data to employee' })
  assignQstData(@Body() dto: CreateQstEmployeeDto, @CurrentUser() user: any) {
    return this.qstService.assignQstData(user.companyId, dto);
  }

  @Put('employee/:id')
  @ApiOperation({ summary: 'Update employee QST data' })
  updateQstData(
    @Param('id') id: string,
    @Body() dto: UpdateQstEmployeeDto,
    @CurrentUser() user: any,
  ) {
    return this.qstService.updateQstData(id, dto);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate withholding tax for salary' })
  calculateTax(@Body() dto: QstCalculationDto, @CurrentUser() user: any) {
    return this.qstService.calculateTax(user.companyId, dto);
  }

  @Post('reconciliation')
  @ApiOperation({ summary: 'Annual QST reconciliation' })
  annualReconciliation(
    @Body() dto: QstAnnualReconciliationDto,
    @CurrentUser() user: any,
  ) {
    return this.qstService.annualReconciliation(user.companyId, dto);
  }
}
