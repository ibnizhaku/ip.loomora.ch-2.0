import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GenerateReportDto,
  ReportType,
  ReportFormat,
  ReportPeriod,
  ReportMetadataDto,
  ProfitLossReportDto,
  BalanceSheetReportDto,
  PayrollSummaryReportDto,
  GavComplianceReportDto,
  WithholdingTaxReportDto,
  ProjectProfitabilityReportDto,
} from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Swiss social insurance rates
  private readonly EMPLOYER_RATES = {
    AHV_IV_EO: 0.053,
    ALV: 0.011,
    BVG: 0.05, // Average
    BUV: 0.007,
    FAK: 0.012,
  };

  async generateReport(companyId: string, dto: GenerateReportDto) {
    const { startDate, endDate } = this.calculateDateRange(dto);

    switch (dto.type) {
      case ReportType.PROFIT_LOSS:
        return this.generateProfitLossReport(companyId, startDate, endDate, dto);
      case ReportType.BALANCE_SHEET:
        return this.generateBalanceSheetReport(companyId, endDate, dto);
      case ReportType.PAYROLL_SUMMARY:
        return this.generatePayrollSummaryReport(companyId, startDate, endDate, dto);
      case ReportType.GAV_COMPLIANCE:
        return this.generateGavComplianceReport(companyId, dto);
      case ReportType.WITHHOLDING_TAX:
        return this.generateWithholdingTaxReport(companyId, startDate, endDate, dto);
      case ReportType.PROJECT_PROFITABILITY:
        return this.generateProjectProfitabilityReport(companyId, startDate, endDate, dto);
      case ReportType.BUDGET_COMPARISON:
        return this.generateBudgetComparisonReport(companyId, dto);
      case ReportType.OPEN_ITEMS:
        return this.generateOpenItemsReport(companyId, dto);
      case ReportType.SALES_ANALYSIS:
        return this.generateSalesAnalysisReport(companyId, startDate, endDate, dto);
      case ReportType.COST_CENTER_ANALYSIS:
        return this.generateCostCenterReport(companyId, startDate, endDate, dto);
      default:
        throw new BadRequestException(`Berichtstyp ${dto.type} nicht unterstützt`);
    }
  }

  private calculateDateRange(dto: GenerateReportDto): { startDate: Date; endDate: Date } {
    if (dto.startDate && dto.endDate) {
      return { startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) };
    }

    const year = dto.year;
    let startDate: Date;
    let endDate: Date;

    switch (dto.period) {
      case ReportPeriod.MONTHLY:
        const month = dto.month || new Date().getMonth() + 1;
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
        break;
      case ReportPeriod.QUARTERLY:
        const quarter = dto.quarter || Math.ceil((new Date().getMonth() + 1) / 3);
        startDate = new Date(year, (quarter - 1) * 3, 1);
        endDate = new Date(year, quarter * 3, 0);
        break;
      case ReportPeriod.YEARLY:
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        break;
      default:
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
    }

    return { startDate, endDate };
  }

  private async getMetadata(companyId: string, type: ReportType, periodStr: string): Promise<ReportMetadataDto> {
    const company = await this.prisma.company.findFirst({ where: { id: companyId } });
    
    const titles: Record<ReportType, string> = {
      [ReportType.PROFIT_LOSS]: 'Erfolgsrechnung',
      [ReportType.BALANCE_SHEET]: 'Bilanz',
      [ReportType.CASH_FLOW]: 'Geldflussrechnung',
      [ReportType.VAT_SUMMARY]: 'MwSt-Übersicht',
      [ReportType.BUDGET_COMPARISON]: 'Budget-Vergleich',
      [ReportType.COST_CENTER_ANALYSIS]: 'Kostenstellenanalyse',
      [ReportType.OPEN_ITEMS]: 'Offene Posten',
      [ReportType.PAYROLL_SUMMARY]: 'Lohnübersicht',
      [ReportType.GAV_COMPLIANCE]: 'GAV-Compliance',
      [ReportType.WITHHOLDING_TAX]: 'Quellensteuer-Übersicht',
      [ReportType.EMPLOYEE_COSTS]: 'Personalkosten',
      [ReportType.ABSENCE_OVERVIEW]: 'Abwesenheiten',
      [ReportType.PROJECT_PROFITABILITY]: 'Projekt-Rentabilität',
      [ReportType.PRODUCTION_OVERVIEW]: 'Produktionsübersicht',
      [ReportType.INVENTORY_VALUATION]: 'Lagerbewertung',
      [ReportType.SALES_ANALYSIS]: 'Verkaufsanalyse',
      [ReportType.PURCHASE_ANALYSIS]: 'Einkaufsanalyse',
    };

    return {
      type,
      title: titles[type],
      period: periodStr,
      generatedAt: new Date().toISOString(),
      companyName: company?.name || 'Firma',
      currency: 'CHF',
    };
  }

  // === FINANCIAL REPORTS ===

  async generateProfitLossReport(
    companyId: string, 
    startDate: Date, 
    endDate: Date, 
    dto: GenerateReportDto
  ): Promise<ProfitLossReportDto> {
    const periodStr = `${startDate.toLocaleDateString('de-CH')} - ${endDate.toLocaleDateString('de-CH')}`;
    const metadata = await this.getMetadata(companyId, ReportType.PROFIT_LOSS, periodStr);

    // Get paid invoices (revenue)
    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: 'PAID',
        date: { gte: startDate, lte: endDate },
      },
    });
    const sales = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);

    // Get purchase invoices (material costs)
    const purchases = await this.prisma.purchaseInvoice.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
      },
    });
    const materials = purchases.reduce((sum, p) => sum + Number(p.total || 0), 0);

    // Get payroll costs
    const payslips = await this.prisma.payslip.findMany({
      where: {
        employee: { companyId },
        year: startDate.getFullYear(),
        month: { gte: startDate.getMonth() + 1, lte: endDate.getMonth() + 1 },
      },
    });
    const grossSalaries = payslips.reduce((sum, p) => sum + Number(p.grossSalary || 0), 0);
    const employerCosts = grossSalaries * (
      this.EMPLOYER_RATES.AHV_IV_EO + 
      this.EMPLOYER_RATES.ALV + 
      this.EMPLOYER_RATES.BVG + 
      this.EMPLOYER_RATES.BUV + 
      this.EMPLOYER_RATES.FAK
    );
    const personnel = grossSalaries + employerCosts;

    // Get depreciation
    const depreciations = await this.prisma.depreciationEntry.findMany({
      where: {
        asset: { companyId },
        date: { gte: startDate, lte: endDate },
      },
    });
    const depreciation = depreciations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    // Calculate operating expenses (estimate based on other journal entries)
    const operating = materials * 0.15; // Simplified - would come from cost center analysis
    const other = materials * 0.05;

    const totalExpenses = materials + personnel + operating + depreciation + other;
    const grossProfit = sales - materials;
    const operatingProfit = grossProfit - personnel - operating - depreciation;
    const netProfit = operatingProfit - other;

    return {
      metadata,
      revenue: {
        sales,
        otherIncome: 0,
        total: sales,
      },
      expenses: {
        materials,
        personnel,
        operating,
        depreciation,
        other,
        total: totalExpenses,
      },
      grossProfit,
      operatingProfit,
      netProfit,
      margins: {
        gross: sales > 0 ? (grossProfit / sales) * 100 : 0,
        operating: sales > 0 ? (operatingProfit / sales) * 100 : 0,
        net: sales > 0 ? (netProfit / sales) * 100 : 0,
      },
    };
  }

  async generateBalanceSheetReport(
    companyId: string, 
    asOfDate: Date, 
    dto: GenerateReportDto
  ): Promise<BalanceSheetReportDto> {
    const periodStr = asOfDate.toLocaleDateString('de-CH');
    const metadata = await this.getMetadata(companyId, ReportType.BALANCE_SHEET, periodStr);

    // Get cash from bank accounts
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: { companyId },
    });
    const cash = bankAccounts.reduce((sum, ba) => sum + Number(ba.balance || 0), 0);

    // Get receivables (open invoices)
    const openInvoices = await this.prisma.invoice.findMany({
      where: { companyId, status: { in: ['SENT', 'OVERDUE'] } },
    });
    const receivables = openInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);

    // Get payables (open purchase invoices)
    const openPurchases = await this.prisma.purchaseInvoice.findMany({
      where: { companyId, status: { in: ['PENDING', 'APPROVED'] } },
    });
    const payables = openPurchases.reduce((sum, p) => sum + Number(p.total || 0), 0);

    // Get inventory value
    const products = await this.prisma.product.findMany({
      where: { companyId },
    });
    const inventory = products.reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.purchasePrice || 0)), 0);

    // Get fixed assets
    const assets = await this.prisma.fixedAsset.findMany({
      where: { companyId, status: 'ACTIVE' },
    });
    
    const fixedAssets = assets.reduce((acc, asset) => {
      const originalValue = Number(asset.acquisitionValue || 0);
      const depreciation = Number(asset.accumulatedDepreciation || 0);
      const category = asset.category || 'EQUIPMENT';
      
      if (['BUILDINGS', 'LAND'].includes(category)) {
        acc.property += originalValue - depreciation;
      } else if (category === 'VEHICLES') {
        acc.vehicles += originalValue - depreciation;
      } else {
        acc.equipment += originalValue - depreciation;
      }
      acc.accumulated += depreciation;
      return acc;
    }, { property: 0, equipment: 0, vehicles: 0, intangible: 0, accumulated: 0 });

    const currentAssets = cash + receivables + inventory;
    const fixedAssetsTotal = fixedAssets.property + fixedAssets.equipment + fixedAssets.vehicles + fixedAssets.intangible;
    const totalAssets = currentAssets + fixedAssetsTotal;

    const currentLiabilities = payables;
    const totalLiabilities = currentLiabilities;
    const equity = totalAssets - totalLiabilities;

    return {
      metadata,
      assets: {
        current: {
          cash,
          receivables,
          inventory,
          prepaidExpenses: 0,
          total: currentAssets,
        },
        fixed: {
          property: fixedAssets.property,
          equipment: fixedAssets.equipment,
          vehicles: fixedAssets.vehicles,
          intangible: fixedAssets.intangible,
          accumulatedDepreciation: -fixedAssets.accumulated,
          total: fixedAssetsTotal,
        },
        total: totalAssets,
      },
      liabilities: {
        current: {
          payables,
          shortTermDebt: 0,
          accruedExpenses: 0,
          vatPayable: 0,
          total: currentLiabilities,
        },
        longTerm: {
          loans: 0,
          provisions: 0,
          total: 0,
        },
        total: totalLiabilities,
      },
      equity: {
        shareCapital: 100000, // Default Swiss GmbH minimum
        reserves: 0,
        retainedEarnings: 0,
        currentYearProfit: equity - 100000,
        total: equity,
      },
      totalLiabilitiesAndEquity: totalAssets,
    };
  }

  // === HR REPORTS ===

  async generatePayrollSummaryReport(
    companyId: string, 
    startDate: Date, 
    endDate: Date, 
    dto: GenerateReportDto
  ): Promise<PayrollSummaryReportDto> {
    const periodStr = `${startDate.toLocaleDateString('de-CH')} - ${endDate.toLocaleDateString('de-CH')}`;
    const metadata = await this.getMetadata(companyId, ReportType.PAYROLL_SUMMARY, periodStr);

    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: {
        payslips: {
          where: {
            year: startDate.getFullYear(),
            month: { gte: startDate.getMonth() + 1, lte: endDate.getMonth() + 1 },
          },
        },
      },
    });

    const totals = employees.reduce((acc, emp) => {
      emp.payslips.forEach(ps => {
        acc.gross += Number(ps.grossSalary || 0);
        acc.net += Number(ps.netSalary || 0);
        acc.ahvIvEo += Number(ps.ahvIvEo || 0);
        acc.alv += Number(ps.alv || 0);
        acc.bvg += Number(ps.bvg || 0);
        acc.ktg += Number(ps.ktg || 0);
        acc.nbuv += Number(ps.nbuv || 0);
        acc.quellensteuer += Number(ps.quellensteuer || 0);
      });
      return acc;
    }, { gross: 0, net: 0, ahvIvEo: 0, alv: 0, bvg: 0, ktg: 0, nbuv: 0, quellensteuer: 0 });

    const totalDeductions = totals.ahvIvEo + totals.alv + totals.bvg + totals.ktg + totals.nbuv + totals.quellensteuer;
    const employerCosts = totals.gross * (
      this.EMPLOYER_RATES.AHV_IV_EO + 
      this.EMPLOYER_RATES.ALV + 
      this.EMPLOYER_RATES.BVG + 
      this.EMPLOYER_RATES.BUV + 
      this.EMPLOYER_RATES.FAK
    );

    return {
      metadata,
      summary: {
        totalEmployees: employees.length,
        totalGrossSalary: totals.gross,
        totalNetSalary: totals.net,
        totalDeductions,
        totalEmployerCosts: totals.gross + employerCosts,
      },
      deductions: {
        ahvIvEo: totals.ahvIvEo,
        alv: totals.alv,
        bvg: totals.bvg,
        ktg: totals.ktg,
        nbuv: totals.nbuv,
        quellensteuer: totals.quellensteuer,
      },
      employerContributions: {
        ahvIvEo: totals.gross * this.EMPLOYER_RATES.AHV_IV_EO,
        alv: totals.gross * this.EMPLOYER_RATES.ALV,
        bvg: totals.gross * this.EMPLOYER_RATES.BVG,
        buv: totals.gross * this.EMPLOYER_RATES.BUV,
        fak: totals.gross * this.EMPLOYER_RATES.FAK,
      },
    };
  }

  async generateGavComplianceReport(companyId: string, dto: GenerateReportDto): Promise<GavComplianceReportDto> {
    const metadata = await this.getMetadata(companyId, ReportType.GAV_COMPLIANCE, new Date().getFullYear().toString());

    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: { gavData: true },
    });

    const gavSettings = await this.prisma.gavSettings.findFirst({
      where: { companyId, year: new Date().getFullYear() },
    });

    // GAV 2024 minimum rates
    const minRates: Record<string, number> = {
      A: gavSettings?.minRateA || 23.10,
      B: gavSettings?.minRateB || 25.40,
      C: gavSettings?.minRateC || 28.85,
      D: gavSettings?.minRateD || 31.20,
      E: gavSettings?.minRateE || 34.50,
      F: gavSettings?.minRateF || 38.00,
    };

    const byClass: Record<string, { count: number; compliant: number; nonCompliant: number }> = {};
    const issues: GavComplianceReportDto['issues'] = [];

    let compliant = 0;
    let nonCompliant = 0;
    let missingData = 0;

    employees.forEach(emp => {
      if (!emp.gavData?.lohnklasse) {
        missingData++;
        return;
      }

      const lohnklasse = emp.gavData.lohnklasse;
      const rate = Number(emp.gavData.hourlyRate || 0);
      const minRate = minRates[lohnklasse] || 0;

      if (!byClass[lohnklasse]) {
        byClass[lohnklasse] = { count: 0, compliant: 0, nonCompliant: 0 };
      }
      byClass[lohnklasse].count++;

      if (rate >= minRate) {
        compliant++;
        byClass[lohnklasse].compliant++;
      } else {
        nonCompliant++;
        byClass[lohnklasse].nonCompliant++;
        issues.push({
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          lohnklasse,
          currentRate: rate,
          minimumRate: minRate,
          difference: minRate - rate,
        });
      }
    });

    return {
      metadata,
      summary: {
        totalEmployees: employees.length,
        compliant,
        nonCompliant,
        missingData,
        complianceRate: employees.length > 0 ? (compliant / (employees.length - missingData)) * 100 : 0,
      },
      byClass: Object.entries(byClass).map(([lohnklasse, data]) => ({
        lohnklasse,
        minimumRate: minRates[lohnklasse],
        employeeCount: data.count,
        compliant: data.compliant,
        nonCompliant: data.nonCompliant,
      })),
      issues,
    };
  }

  async generateWithholdingTaxReport(
    companyId: string, 
    startDate: Date, 
    endDate: Date, 
    dto: GenerateReportDto
  ): Promise<WithholdingTaxReportDto> {
    const periodStr = `${startDate.toLocaleDateString('de-CH')} - ${endDate.toLocaleDateString('de-CH')}`;
    const metadata = await this.getMetadata(companyId, ReportType.WITHHOLDING_TAX, periodStr);

    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: {
        qstData: true,
        payslips: {
          where: {
            year: startDate.getFullYear(),
            month: { gte: startDate.getMonth() + 1, lte: endDate.getMonth() + 1 },
          },
        },
      },
    });

    const qstEmployees = employees.filter(e => e.qstData?.isSubjectToQst);
    
    const byCanton: Record<string, { count: number; income: number; tax: number }> = {};
    const byTariff: Record<string, { count: number; income: number; tax: number }> = {};

    let totalIncome = 0;
    let totalTax = 0;

    qstEmployees.forEach(emp => {
      const canton = emp.qstData!.canton;
      const tariff = emp.qstData!.tariff;
      
      const income = emp.payslips.reduce((sum, ps) => sum + Number(ps.grossSalary || 0), 0);
      const tax = emp.payslips.reduce((sum, ps) => sum + Number(ps.quellensteuer || 0), 0);

      totalIncome += income;
      totalTax += tax;

      if (!byCanton[canton]) {
        byCanton[canton] = { count: 0, income: 0, tax: 0 };
      }
      byCanton[canton].count++;
      byCanton[canton].income += income;
      byCanton[canton].tax += tax;

      if (!byTariff[tariff]) {
        byTariff[tariff] = { count: 0, income: 0, tax: 0 };
      }
      byTariff[tariff].count++;
      byTariff[tariff].income += income;
      byTariff[tariff].tax += tax;
    });

    return {
      metadata,
      summary: {
        totalEmployees: qstEmployees.length,
        totalTaxableIncome: totalIncome,
        totalWithholdingTax: totalTax,
        averageRate: totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0,
      },
      byCanton: Object.entries(byCanton).map(([canton, data]) => ({
        canton,
        employeeCount: data.count,
        taxableIncome: data.income,
        withholdingTax: data.tax,
      })),
      byTariff: Object.entries(byTariff).map(([tariff, data]) => ({
        tariff,
        employeeCount: data.count,
        taxableIncome: data.income,
        withholdingTax: data.tax,
      })),
    };
  }

  // === OPERATIONS REPORTS ===

  async generateProjectProfitabilityReport(
    companyId: string, 
    startDate: Date, 
    endDate: Date, 
    dto: GenerateReportDto
  ): Promise<ProjectProfitabilityReportDto> {
    const periodStr = `${startDate.toLocaleDateString('de-CH')} - ${endDate.toLocaleDateString('de-CH')}`;
    const metadata = await this.getMetadata(companyId, ReportType.PROJECT_PROFITABILITY, periodStr);

    const projects = await this.prisma.project.findMany({
      where: { companyId },
      include: {
        customer: true,
        invoices: {
          where: { date: { gte: startDate, lte: endDate } },
        },
        purchaseOrders: {
          where: { createdAt: { gte: startDate, lte: endDate } },
        },
        timeEntries: {
          where: { date: { gte: startDate, lte: endDate } },
          include: { employee: true },
        },
      },
    });

    const projectData = projects.map(project => {
      const revenue = project.invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
      const materialCosts = project.purchaseOrders.reduce((sum, po) => sum + Number(po.total || 0), 0);
      
      // Calculate labor costs from time entries
      const laborCosts = project.timeEntries.reduce((sum, te) => {
        const hours = Number(te.hours || 0);
        const hourlyRate = Number(te.employee.salary || 0) / 173.33; // Monthly to hourly
        return sum + (hours * hourlyRate);
      }, 0);

      const otherCosts = materialCosts * 0.1; // Overhead estimate
      const totalCosts = materialCosts + laborCosts + otherCosts;
      const profit = revenue - totalCosts;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        id: project.id,
        name: project.name,
        customer: project.customer?.name || 'Unbekannt',
        status: project.status,
        revenue,
        materialCosts,
        laborCosts,
        otherCosts,
        totalCosts,
        profit,
        margin,
      };
    });

    const totals = projectData.reduce((acc, p) => ({
      revenue: acc.revenue + p.revenue,
      costs: acc.costs + p.totalCosts,
      profit: acc.profit + p.profit,
    }), { revenue: 0, costs: 0, profit: 0 });

    return {
      metadata,
      summary: {
        totalProjects: projects.length,
        totalRevenue: totals.revenue,
        totalCosts: totals.costs,
        totalProfit: totals.profit,
        averageMargin: totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0,
      },
      projects: projectData,
    };
  }

  async generateBudgetComparisonReport(companyId: string, dto: GenerateReportDto) {
    const periodStr = `${dto.year}`;
    const metadata = await this.getMetadata(companyId, ReportType.BUDGET_COMPARISON, periodStr);

    const budgets = await this.prisma.budget.findMany({
      where: { companyId, year: dto.year },
      include: { costCenter: true },
    });

    const comparison = budgets.map(budget => ({
      name: budget.name,
      costCenter: budget.costCenter?.name || 'Gesamt',
      planned: Number(budget.plannedAmount || 0),
      actual: Number(budget.actualAmount || 0),
      variance: Number(budget.plannedAmount || 0) - Number(budget.actualAmount || 0),
      variancePercent: budget.plannedAmount 
        ? ((Number(budget.plannedAmount) - Number(budget.actualAmount || 0)) / Number(budget.plannedAmount)) * 100 
        : 0,
    }));

    return {
      metadata,
      budgets: comparison,
      totals: {
        planned: comparison.reduce((sum, b) => sum + b.planned, 0),
        actual: comparison.reduce((sum, b) => sum + b.actual, 0),
        variance: comparison.reduce((sum, b) => sum + b.variance, 0),
      },
    };
  }

  async generateOpenItemsReport(companyId: string, dto: GenerateReportDto) {
    const metadata = await this.getMetadata(companyId, ReportType.OPEN_ITEMS, new Date().toLocaleDateString('de-CH'));

    const [openInvoices, openPurchases] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { companyId, status: { in: ['SENT', 'OVERDUE'] } },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.purchaseInvoice.findMany({
        where: { companyId, status: { in: ['PENDING', 'APPROVED'] } },
        include: { supplier: true },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    const today = new Date();

    return {
      metadata,
      debtors: {
        items: openInvoices.map(inv => ({
          id: inv.id,
          number: inv.invoiceNumber,
          customer: inv.customer?.name || 'Unbekannt',
          date: inv.date,
          dueDate: inv.dueDate,
          amount: Number(inv.total || 0),
          daysOverdue: inv.dueDate ? Math.max(0, Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / 86400000)) : 0,
        })),
        total: openInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0),
      },
      creditors: {
        items: openPurchases.map(p => ({
          id: p.id,
          number: p.invoiceNumber,
          supplier: p.supplier?.name || 'Unbekannt',
          date: p.date,
          dueDate: p.dueDate,
          amount: Number(p.total || 0),
          daysOverdue: p.dueDate ? Math.max(0, Math.floor((today.getTime() - new Date(p.dueDate).getTime()) / 86400000)) : 0,
        })),
        total: openPurchases.reduce((sum, p) => sum + Number(p.total || 0), 0),
      },
    };
  }

  async generateSalesAnalysisReport(companyId: string, startDate: Date, endDate: Date, dto: GenerateReportDto) {
    const periodStr = `${startDate.toLocaleDateString('de-CH')} - ${endDate.toLocaleDateString('de-CH')}`;
    const metadata = await this.getMetadata(companyId, ReportType.SALES_ANALYSIS, periodStr);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
      },
      include: { customer: true },
    });

    // Group by customer
    const byCustomer: Record<string, { name: string; count: number; total: number }> = {};
    invoices.forEach(inv => {
      const customerId = inv.customerId || 'unknown';
      if (!byCustomer[customerId]) {
        byCustomer[customerId] = { name: inv.customer?.name || 'Unbekannt', count: 0, total: 0 };
      }
      byCustomer[customerId].count++;
      byCustomer[customerId].total += Number(inv.total || 0);
    });

    // Group by month
    const byMonth: Record<string, number> = {};
    invoices.forEach(inv => {
      const month = new Date(inv.date).toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit' });
      byMonth[month] = (byMonth[month] || 0) + Number(inv.total || 0);
    });

    const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);

    return {
      metadata,
      summary: {
        totalInvoices: invoices.length,
        totalSales,
        averageInvoice: invoices.length > 0 ? totalSales / invoices.length : 0,
      },
      byCustomer: Object.entries(byCustomer)
        .map(([id, data]) => ({ customerId: id, ...data }))
        .sort((a, b) => b.total - a.total),
      byMonth: Object.entries(byMonth)
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  async generateCostCenterReport(companyId: string, startDate: Date, endDate: Date, dto: GenerateReportDto) {
    const periodStr = `${startDate.toLocaleDateString('de-CH')} - ${endDate.toLocaleDateString('de-CH')}`;
    const metadata = await this.getMetadata(companyId, ReportType.COST_CENTER_ANALYSIS, periodStr);

    const costCenters = await this.prisma.costCenter.findMany({
      where: { companyId, isActive: true },
      include: {
        budgets: { where: { year: startDate.getFullYear() } },
      },
    });

    const analysis = costCenters.map(cc => {
      const budget = cc.budgets[0];
      return {
        id: cc.id,
        code: cc.code,
        name: cc.name,
        budget: budget ? Number(budget.plannedAmount || 0) : 0,
        actual: budget ? Number(budget.actualAmount || 0) : 0,
        variance: budget ? Number(budget.plannedAmount || 0) - Number(budget.actualAmount || 0) : 0,
      };
    });

    return {
      metadata,
      costCenters: analysis,
      totals: {
        budget: analysis.reduce((sum, cc) => sum + cc.budget, 0),
        actual: analysis.reduce((sum, cc) => sum + cc.actual, 0),
        variance: analysis.reduce((sum, cc) => sum + cc.variance, 0),
      },
    };
  }

  // Get available report types
  getAvailableReports() {
    return [
      { type: ReportType.PROFIT_LOSS, name: 'Erfolgsrechnung', category: 'Finanzen' },
      { type: ReportType.BALANCE_SHEET, name: 'Bilanz', category: 'Finanzen' },
      { type: ReportType.BUDGET_COMPARISON, name: 'Budget-Vergleich', category: 'Finanzen' },
      { type: ReportType.OPEN_ITEMS, name: 'Offene Posten', category: 'Finanzen' },
      { type: ReportType.COST_CENTER_ANALYSIS, name: 'Kostenstellenanalyse', category: 'Finanzen' },
      { type: ReportType.SALES_ANALYSIS, name: 'Verkaufsanalyse', category: 'Finanzen' },
      { type: ReportType.PAYROLL_SUMMARY, name: 'Lohnübersicht', category: 'Personal' },
      { type: ReportType.GAV_COMPLIANCE, name: 'GAV-Compliance', category: 'Personal' },
      { type: ReportType.WITHHOLDING_TAX, name: 'Quellensteuer', category: 'Personal' },
      { type: ReportType.PROJECT_PROFITABILITY, name: 'Projekt-Rentabilität', category: 'Projekte' },
    ];
  }
}
