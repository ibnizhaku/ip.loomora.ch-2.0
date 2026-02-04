import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsBoolean } from 'class-validator';

export enum ReportType {
  // Financial Reports
  PROFIT_LOSS = 'PROFIT_LOSS',
  BALANCE_SHEET = 'BALANCE_SHEET',
  CASH_FLOW = 'CASH_FLOW',
  VAT_SUMMARY = 'VAT_SUMMARY',
  BUDGET_COMPARISON = 'BUDGET_COMPARISON',
  COST_CENTER_ANALYSIS = 'COST_CENTER_ANALYSIS',
  OPEN_ITEMS = 'OPEN_ITEMS',
  
  // HR Reports
  PAYROLL_SUMMARY = 'PAYROLL_SUMMARY',
  GAV_COMPLIANCE = 'GAV_COMPLIANCE',
  WITHHOLDING_TAX = 'WITHHOLDING_TAX',
  EMPLOYEE_COSTS = 'EMPLOYEE_COSTS',
  ABSENCE_OVERVIEW = 'ABSENCE_OVERVIEW',
  
  // Operations Reports
  PROJECT_PROFITABILITY = 'PROJECT_PROFITABILITY',
  PRODUCTION_OVERVIEW = 'PRODUCTION_OVERVIEW',
  INVENTORY_VALUATION = 'INVENTORY_VALUATION',
  SALES_ANALYSIS = 'SALES_ANALYSIS',
  PURCHASE_ANALYSIS = 'PURCHASE_ANALYSIS',
}

export enum ReportFormat {
  JSON = 'JSON',
  PDF = 'PDF',
  CSV = 'CSV',
  EXCEL = 'EXCEL',
}

export enum ReportPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportPeriod)
  @IsOptional()
  period?: ReportPeriod = ReportPeriod.MONTHLY;

  @IsNumber()
  year: number;

  @IsNumber()
  @IsOptional()
  month?: number;

  @IsNumber()
  @IsOptional()
  quarter?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat = ReportFormat.JSON;

  @IsString()
  @IsOptional()
  costCenterId?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsBoolean()
  @IsOptional()
  includeDetails?: boolean = false;

  @IsBoolean()
  @IsOptional()
  compareWithPrevious?: boolean = false;
}

export class ReportMetadataDto {
  type: ReportType;
  title: string;
  period: string;
  generatedAt: string;
  companyName: string;
  currency: string;
}

export class ProfitLossReportDto {
  metadata: ReportMetadataDto;
  revenue: {
    sales: number;
    otherIncome: number;
    total: number;
  };
  expenses: {
    materials: number;
    personnel: number;
    operating: number;
    depreciation: number;
    other: number;
    total: number;
  };
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
  margins: {
    gross: number;
    operating: number;
    net: number;
  };
  comparison?: {
    previousPeriod: any;
    variance: any;
    variancePercent: any;
  };
}

export class BalanceSheetReportDto {
  metadata: ReportMetadataDto;
  assets: {
    current: {
      cash: number;
      receivables: number;
      inventory: number;
      prepaidExpenses: number;
      total: number;
    };
    fixed: {
      property: number;
      equipment: number;
      vehicles: number;
      intangible: number;
      accumulatedDepreciation: number;
      total: number;
    };
    total: number;
  };
  liabilities: {
    current: {
      payables: number;
      shortTermDebt: number;
      accruedExpenses: number;
      vatPayable: number;
      total: number;
    };
    longTerm: {
      loans: number;
      provisions: number;
      total: number;
    };
    total: number;
  };
  equity: {
    shareCapital: number;
    reserves: number;
    retainedEarnings: number;
    currentYearProfit: number;
    total: number;
  };
  totalLiabilitiesAndEquity: number;
}

export class PayrollSummaryReportDto {
  metadata: ReportMetadataDto;
  summary: {
    totalEmployees: number;
    totalGrossSalary: number;
    totalNetSalary: number;
    totalDeductions: number;
    totalEmployerCosts: number;
  };
  deductions: {
    ahvIvEo: number;
    alv: number;
    bvg: number;
    ktg: number;
    nbuv: number;
    quellensteuer: number;
  };
  employerContributions: {
    ahvIvEo: number;
    alv: number;
    bvg: number;
    buv: number;
    fak: number;
  };
  byDepartment?: Array<{
    department: string;
    employeeCount: number;
    grossSalary: number;
    netSalary: number;
  }>;
}

export class GavComplianceReportDto {
  metadata: ReportMetadataDto;
  summary: {
    totalEmployees: number;
    compliant: number;
    nonCompliant: number;
    missingData: number;
    complianceRate: number;
  };
  byClass: Array<{
    lohnklasse: string;
    minimumRate: number;
    employeeCount: number;
    compliant: number;
    nonCompliant: number;
  }>;
  issues: Array<{
    employeeId: string;
    employeeName: string;
    lohnklasse: string;
    currentRate: number;
    minimumRate: number;
    difference: number;
  }>;
}

export class WithholdingTaxReportDto {
  metadata: ReportMetadataDto;
  summary: {
    totalEmployees: number;
    totalTaxableIncome: number;
    totalWithholdingTax: number;
    averageRate: number;
  };
  byCanton: Array<{
    canton: string;
    employeeCount: number;
    taxableIncome: number;
    withholdingTax: number;
  }>;
  byTariff: Array<{
    tariff: string;
    employeeCount: number;
    taxableIncome: number;
    withholdingTax: number;
  }>;
}

export class ProjectProfitabilityReportDto {
  metadata: ReportMetadataDto;
  summary: {
    totalProjects: number;
    totalRevenue: number;
    totalCosts: number;
    totalProfit: number;
    averageMargin: number;
  };
  projects: Array<{
    id: string;
    name: string;
    customer: string;
    status: string;
    revenue: number;
    materialCosts: number;
    laborCosts: number;
    otherCosts: number;
    totalCosts: number;
    profit: number;
    margin: number;
  }>;
}

export class ScheduledReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsString()
  name: string;

  @IsEnum(ReportPeriod)
  frequency: ReportPeriod;

  @IsString({ each: true })
  @IsOptional()
  recipients?: string[];

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;
}
