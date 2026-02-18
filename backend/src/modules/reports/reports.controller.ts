import { Controller, Get, Post, Body, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { GenerateReportDto, ReportFormat } from './dto/report.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('available')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get available report types' })
  getAvailableReports() {
    return this.reportsService.getAvailableReports();
  }

  @Post('generate')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Generate a report' })
  async generateReport(
    @CurrentUser() user: any,
    @Body() dto: GenerateReportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const report = await this.reportsService.generateReport(user.companyId, dto);

    if (dto.format === ReportFormat.PDF) {
      return {
        ...report,
        _format: 'pdf',
        _filename: `${dto.type.toLowerCase()}_${dto.year}${dto.month ? '_' + dto.month : ''}.pdf`,
      };
    }

    if (dto.format === ReportFormat.CSV) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${dto.type.toLowerCase()}.csv"`);
      return this.convertToCSV(report);
    }

    return report;
  }

  @Get('profit-loss')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get profit & loss report' })
  async getProfitLoss(
    @CurrentUser() user: any,
    @Query('year') year: string,
    @Query('month') month?: string,
  ) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'PROFIT_LOSS' as any,
      year: parseInt(year),
      month: month ? parseInt(month) : undefined,
    });
  }

  @Get('balance-sheet')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get balance sheet report' })
  async getBalanceSheet(
    @CurrentUser() user: any,
    @Query('year') year: string,
  ) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'BALANCE_SHEET' as any,
      year: parseInt(year),
    });
  }

  @Get('payroll-summary')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get payroll summary report' })
  async getPayrollSummary(
    @CurrentUser() user: any,
    @Query('year') year: string,
    @Query('month') month?: string,
  ) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'PAYROLL_SUMMARY' as any,
      year: parseInt(year),
      month: month ? parseInt(month) : undefined,
    });
  }

  @Get('gav-compliance')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get GAV compliance report' })
  async getGavCompliance(@CurrentUser() user: any) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'GAV_COMPLIANCE' as any,
      year: new Date().getFullYear(),
    });
  }

  @Get('withholding-tax')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get withholding tax report' })
  async getWithholdingTax(
    @CurrentUser() user: any,
    @Query('year') year: string,
    @Query('month') month?: string,
  ) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'WITHHOLDING_TAX' as any,
      year: parseInt(year),
      month: month ? parseInt(month) : undefined,
    });
  }

  @Get('project-profitability')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get project profitability report' })
  async getProjectProfitability(
    @CurrentUser() user: any,
    @Query('year') year: string,
  ) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'PROJECT_PROFITABILITY' as any,
      year: parseInt(year),
    });
  }

  @Get('open-items')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get open items report' })
  async getOpenItems(@CurrentUser() user: any) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'OPEN_ITEMS' as any,
      year: new Date().getFullYear(),
    });
  }

  @Get('sales-analysis')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get sales analysis report' })
  async getSalesAnalysis(
    @CurrentUser() user: any,
    @Query('year') year: string,
  ) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'SALES_ANALYSIS' as any,
      year: parseInt(year),
    });
  }

  @Get('budget-comparison')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get budget comparison report' })
  async getBudgetComparison(
    @CurrentUser() user: any,
    @Query('year') year: string,
  ) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'BUDGET_COMPARISON' as any,
      year: parseInt(year),
    });
  }

  private convertToCSV(data: any): string {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => row[h]).join(';'));
      return [headers.join(';'), ...rows].join('\n');
    }
    
    const rows: string[] = [];
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value as object).forEach(([subKey, subValue]) => {
          rows.push(`${key}.${subKey};${subValue}`);
        });
      } else {
        rows.push(`${key};${value}`);
      }
    });
    return rows.join('\n');
  }
}
