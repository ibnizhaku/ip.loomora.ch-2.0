import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateQstEmployeeDto, 
  UpdateQstEmployeeDto, 
  QstCalculationDto,
  QstTarif,
  QstKanton,
  QstStatus,
  QstAnnualReconciliationDto 
} from './dto/withholding-tax.dto';

@Injectable()
export class WithholdingTaxService {
  constructor(private prisma: PrismaService) {}

  // Simplified QST rate table (actual rates depend on canton, income bracket, children)
  // These are approximate rates for demonstration - real implementation would use official tables
  private readonly QST_RATES: Record<QstTarif, Record<string, number>> = {
    [QstTarif.A]: { base: 0.12, perChild: -0.02 },    // Single without children
    [QstTarif.B]: { base: 0.08, perChild: -0.015 },   // Married, single earner
    [QstTarif.C]: { base: 0.10, perChild: -0.015 },   // Married, dual earner
    [QstTarif.D]: { base: 0.15, perChild: 0 },        // Secondary income
    [QstTarif.E]: { base: 0.10, perChild: 0 },        // Reserved
    [QstTarif.F]: { base: 0.045, perChild: 0 },       // Cross-border France
    [QstTarif.G]: { base: 0.045, perChild: 0 },       // Cross-border Germany
    [QstTarif.H]: { base: 0.09, perChild: -0.02 },    // Single with children
    [QstTarif.L]: { base: 0.11, perChild: -0.02 },    // Single, no church
    [QstTarif.M]: { base: 0.07, perChild: -0.015 },   // Married, no church
    [QstTarif.N]: { base: 0.09, perChild: -0.015 },   // Married dual, no church
    [QstTarif.P]: { base: 0.14, perChild: 0 },        // Secondary, no church
    [QstTarif.Q]: { base: 0.04, perChild: 0 },        // Cross-border special
  };

  // Canton-specific adjustments (simplified)
  private readonly CANTON_FACTORS: Partial<Record<QstKanton, number>> = {
    [QstKanton.ZH]: 1.0,
    [QstKanton.BE]: 1.05,
    [QstKanton.GE]: 1.15,
    [QstKanton.VD]: 1.10,
    [QstKanton.BS]: 1.08,
    [QstKanton.ZG]: 0.85,
    [QstKanton.SZ]: 0.80,
  };

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    kanton?: string;
  }) {
    const { page = 1, pageSize = 20, status, kanton } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status) where.status = status;
    if (kanton) where.kanton = kanton;

    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: { qstData: { where } },
    });

    const filtered = employees.filter(e => 
      e.qstData && (
        (!status || e.qstData.status === status) &&
        (!kanton || e.qstData.kanton === kanton)
      )
    );

    return {
      data: filtered.slice(skip, skip + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  }

  async findOne(employeeId: string, companyId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId },
      include: { qstData: true },
    });

    if (!employee) {
      throw new NotFoundException('Mitarbeiter nicht gefunden');
    }

    return {
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        nationality: employee.nationality,
      },
      qstData: employee.qstData,
    };
  }

  async assignQstData(companyId: string, dto: CreateQstEmployeeDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Mitarbeiter nicht gefunden');
    }

    return this.prisma.qstEmployeeData.upsert({
      where: { employeeId: dto.employeeId },
      create: {
        employeeId: dto.employeeId,
        status: dto.status,
        kanton: dto.kanton,
        tarif: dto.tarif,
        childCount: dto.childCount,
        churchMember: dto.churchMember ?? true,
        nationality: dto.nationality,
        permitType: dto.permitType,
        permitValidUntil: dto.permitValidUntil ? new Date(dto.permitValidUntil) : null,
        crossBorderCountry: dto.crossBorderCountry,
      },
      update: {
        status: dto.status,
        kanton: dto.kanton,
        tarif: dto.tarif,
        childCount: dto.childCount,
        churchMember: dto.churchMember,
        nationality: dto.nationality,
        permitType: dto.permitType,
        permitValidUntil: dto.permitValidUntil ? new Date(dto.permitValidUntil) : null,
        crossBorderCountry: dto.crossBorderCountry,
      },
    });
  }

  async updateQstData(employeeId: string, dto: UpdateQstEmployeeDto) {
    const existing = await this.prisma.qstEmployeeData.findUnique({
      where: { employeeId },
    });
    if (!existing) {
      throw new NotFoundException('Quellensteuer-Daten nicht gefunden');
    }

    return this.prisma.qstEmployeeData.update({
      where: { employeeId },
      data: dto,
    });
  }

  // Calculate withholding tax
  async calculateTax(companyId: string, dto: QstCalculationDto) {
    const qstData = await this.prisma.qstEmployeeData.findUnique({
      where: { employeeId: dto.employeeId },
    });

    if (!qstData) {
      throw new NotFoundException('Quellensteuer-Daten für Mitarbeiter nicht gefunden');
    }

    if (qstData.status === QstStatus.EXEMPT) {
      return {
        employeeId: dto.employeeId,
        grossSalary: dto.grossSalary,
        qstAmount: 0,
        effectiveRate: 0,
        status: 'EXEMPT',
        message: 'Mitarbeiter ist von der Quellensteuer befreit',
      };
    }

    const totalGross = dto.grossSalary + (dto.bonus || 0) + (dto.otherIncome || 0);

    // Get base rate from tariff
    const tarifRates = this.QST_RATES[qstData.tarif as QstTarif] || this.QST_RATES[QstTarif.A];
    let baseRate = tarifRates.base;

    // Adjust for children
    const childAdjustment = (qstData.childCount || 0) * tarifRates.perChild;
    baseRate = Math.max(0, baseRate + childAdjustment);

    // Apply canton factor
    const cantonFactor = this.CANTON_FACTORS[qstData.kanton as QstKanton] || 1.0;
    const adjustedRate = baseRate * cantonFactor;

    // Progressive rate based on income (simplified)
    let progressiveFactor = 1.0;
    const annualizedIncome = totalGross * 12;
    if (annualizedIncome > 200000) progressiveFactor = 1.15;
    else if (annualizedIncome > 150000) progressiveFactor = 1.10;
    else if (annualizedIncome > 100000) progressiveFactor = 1.05;
    else if (annualizedIncome < 30000) progressiveFactor = 0.85;

    const effectiveRate = Math.min(0.35, adjustedRate * progressiveFactor); // Cap at 35%
    const qstAmount = totalGross * effectiveRate;

    return {
      employeeId: dto.employeeId,
      year: dto.year,
      month: dto.month,
      grossSalary: dto.grossSalary,
      bonus: dto.bonus || 0,
      otherIncome: dto.otherIncome || 0,
      totalGross,
      tarif: qstData.tarif,
      kanton: qstData.kanton,
      childCount: qstData.childCount,
      baseRate: baseRate * 100,
      cantonFactor,
      effectiveRate: effectiveRate * 100,
      qstAmount: Math.round(qstAmount * 100) / 100,
    };
  }

  // Monthly QST report for submission to tax authority
  async generateMonthlyReport(companyId: string, year: number, month: number) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: { 
        qstData: true,
        payslips: { where: { year, month } },
      },
    });

    const qstEmployees = employees.filter(e => 
      e.qstData && e.qstData.status !== QstStatus.EXEMPT
    );

    const entries = await Promise.all(
      qstEmployees.map(async (emp) => {
        const payslip = emp.payslips[0];
        if (!payslip) return null;

        const calculation = await this.calculateTax(companyId, {
          employeeId: emp.id,
          grossSalary: Number(payslip.grossSalary),
          year,
          month,
        });

        return {
          employeeId: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          ahvNumber: emp.ahvNumber,
          kanton: emp.qstData?.kanton,
          tarif: emp.qstData?.tarif,
          childCount: emp.qstData?.childCount,
          grossSalary: calculation.totalGross,
          qstAmount: calculation.qstAmount,
          effectiveRate: calculation.effectiveRate,
        };
      })
    );

    const validEntries = entries.filter(e => e !== null);
    const totalQst = validEntries.reduce((sum, e) => sum + (e?.qstAmount || 0), 0);
    const totalGross = validEntries.reduce((sum, e) => sum + (e?.grossSalary || 0), 0);

    // Group by canton
    const byKanton = validEntries.reduce((acc, entry) => {
      const kanton = entry?.kanton || 'UNKNOWN';
      if (!acc[kanton]) {
        acc[kanton] = { count: 0, totalQst: 0, totalGross: 0 };
      }
      acc[kanton].count++;
      acc[kanton].totalQst += entry?.qstAmount || 0;
      acc[kanton].totalGross += entry?.grossSalary || 0;
      return acc;
    }, {} as Record<string, { count: number; totalQst: number; totalGross: number }>);

    return {
      year,
      month,
      companyId,
      summary: {
        employeeCount: validEntries.length,
        totalGrossSalary: totalGross,
        totalQst,
        averageRate: totalGross > 0 ? ((totalQst / totalGross) * 100).toFixed(2) : '0',
      },
      byKanton: Object.entries(byKanton).map(([kanton, data]) => ({
        kanton,
        ...data,
      })),
      entries: validEntries,
    };
  }

  // Annual reconciliation
  async annualReconciliation(companyId: string, dto: QstAnnualReconciliationDto) {
    const qstData = await this.prisma.qstEmployeeData.findUnique({
      where: { employeeId: dto.employeeId },
    });

    if (!qstData) {
      throw new NotFoundException('Quellensteuer-Daten nicht gefunden');
    }

    // Calculate what should have been deducted
    const monthlyCalc = await this.calculateTax(companyId, {
      employeeId: dto.employeeId,
      grossSalary: dto.totalGrossIncome / 12,
      year: dto.year,
      month: 12,
    });

    const annualQstDue = monthlyCalc.qstAmount * 12;
    const difference = dto.totalQstDeducted - annualQstDue;

    return {
      employeeId: dto.employeeId,
      year: dto.year,
      totalGrossIncome: dto.totalGrossIncome,
      totalQstDeducted: dto.totalQstDeducted,
      calculatedAnnualQst: annualQstDue,
      difference,
      status: Math.abs(difference) < 10 ? 'BALANCED' : difference > 0 ? 'OVERPAID' : 'UNDERPAID',
      adjustment: dto.adjustments || 0,
      finalDifference: difference + (dto.adjustments || 0),
    };
  }

  // Get statistics
  async getStatistics(companyId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: { qstData: true },
    });

    const withQst = employees.filter(e => e.qstData);
    const byStatus = withQst.reduce((acc, e) => {
      const status = e.qstData?.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byKanton = withQst.reduce((acc, e) => {
      const kanton = e.qstData?.kanton || 'UNKNOWN';
      acc[kanton] = (acc[kanton] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byTarif = withQst.reduce((acc, e) => {
      const tarif = e.qstData?.tarif || 'UNKNOWN';
      acc[tarif] = (acc[tarif] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEmployees: employees.length,
      withQstData: withQst.length,
      withoutQstData: employees.length - withQst.length,
      byStatus,
      byKanton: Object.entries(byKanton)
        .map(([kanton, count]) => ({ kanton, count }))
        .sort((a, b) => b.count - a.count),
      byTarif: Object.entries(byTarif)
        .map(([tarif, count]) => ({ tarif, count }))
        .sort((a, b) => b.count - a.count),
    };
  }
}
