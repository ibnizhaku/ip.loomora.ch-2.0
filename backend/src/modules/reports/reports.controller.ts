import { Controller, Get, Post, Body, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { GenerateReportDto, ReportFormat } from './dto/report.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('available')
  getAvailableReports() {
    return this.reportsService.getAvailableReports();
  }

  @Post('generate')
  async generateReport(
    @CurrentUser() user: any,
    @Body() dto: GenerateReportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const report = await this.reportsService.generateReport(user.companyId, dto);

    if (dto.format === ReportFormat.PDF) {
      // Return PDF-ready JSON structure
      // Frontend will handle PDF generation with jsPDF
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
  async getGavCompliance(@CurrentUser() user: any) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'GAV_COMPLIANCE' as any,
      year: new Date().getFullYear(),
    });
  }

  @Get('withholding-tax')
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
  async getOpenItems(@CurrentUser() user: any) {
    return this.reportsService.generateReport(user.companyId, {
      type: 'OPEN_ITEMS' as any,
      year: new Date().getFullYear(),
    });
  }

  @Get('sales-analysis')
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
    // Simple CSV conversion for flat data structures
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => row[h]).join(';'));
      return [headers.join(';'), ...rows].join('\n');
    }
    
    // For nested structures, flatten first level
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
