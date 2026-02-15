import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePayslipDto, UpdatePayslipDto } from './dto/payroll.dto';

// Swiss social insurance rates 2024
const RATES = {
  AHV_IV_EO: 5.3,
  ALV: 1.1,
  BVG: 7.0,
  NBU: 1.0,
  KTG: 0.5,
};

const MONTH_NAMES_DE = [
  '', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

const PAYSLIP_STATUS_MAP: Record<string, string> = {
  DRAFT: 'Entwurf',
  PENDING: 'In Bearbeitung',
  PAID: 'Abgeschlossen',
  CANCELLED: 'Storniert',
};

const RUN_STATUS_MAP: Record<string, string> = {
  DRAFT: 'Entwurf',
  PROCESSING: 'In Bearbeitung',
  COMPLETED: 'Abgeschlossen',
};

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // PAYROLL RUNS
  // ==========================================

  /**
   * POST /payroll — Create a new PayrollRun
   */
  async createRun(companyId: string, dto: {
    period: string;
    periodStart?: string;
    periodEnd?: string;
    status?: string;
    employees?: number;
  }) {
    // Parse period (e.g. "2026-02")
    const [yearStr, monthStr] = (dto.period || '').split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    if (!year || !month || month < 1 || month > 12) {
      throw new BadRequestException('Ungültige Periode. Format: YYYY-MM');
    }

    // Check for existing run
    const existing = await this.prisma.payrollRun.findFirst({
      where: { companyId, period: dto.period },
    });
    if (existing) {
      throw new BadRequestException(`Lohnlauf für ${dto.period} existiert bereits`);
    }

    // Default period dates
    const periodStart = dto.periodStart
      ? new Date(dto.periodStart)
      : new Date(year, month - 1, 1);
    const periodEnd = dto.periodEnd
      ? new Date(dto.periodEnd)
      : new Date(year, month, 0); // Last day of month

    // Count active employees if not provided
    let employeeCount = dto.employees || 0;
    if (!employeeCount) {
      employeeCount = await this.prisma.employee.count({
        where: { companyId, status: 'ACTIVE' },
      });
    }

    const run = await this.prisma.payrollRun.create({
      data: {
        companyId,
        period: dto.period,
        periodStart,
        periodEnd,
        status: 'DRAFT',
        employees: employeeCount,
        grossTotal: 0,
        netTotal: 0,
      },
    });

    return {
      ...run,
      grossTotal: Number(run.grossTotal),
      netTotal: Number(run.netTotal),
      status: RUN_STATUS_MAP[run.status] || run.status,
      runDate: run.createdAt.toLocaleDateString('de-CH'),
    };
  }

  /**
   * GET /payroll — Returns { payrollRuns, data } for the Payroll page
   */
  async findAll(companyId: string, query: {
    page?: number;
    pageSize?: number;
    year?: number;
    month?: number;
    employeeId?: string;
    status?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 100;
    const skip = (page - 1) * pageSize;

    // 1) Get real PayrollRuns from DB
    const dbRuns = await this.prisma.payrollRun.findMany({
      where: { companyId },
      orderBy: { periodStart: 'desc' },
      include: {
        _count: { select: { payslips: true } },
      },
    });

    // 2) Also check for orphaned payslips (not linked to a run) and create virtual runs
    const orphanPayslips = await this.prisma.payslip.findMany({
      where: {
        employee: { companyId },
        payrollRunId: null,
      },
      select: {
        year: true,
        month: true,
        grossSalary: true,
        netSalary: true,
        status: true,
        createdAt: true,
      },
    });

    const virtualRunMap = new Map<string, any>();
    for (const ps of orphanPayslips) {
      const key = `${ps.year}-${String(ps.month).padStart(2, '0')}`;
      // Skip if a real run exists for this period
      if (dbRuns.some(r => r.period === key)) continue;

      if (!virtualRunMap.has(key)) {
        virtualRunMap.set(key, {
          id: key,
          period: key,
          periodLabel: `${MONTH_NAMES_DE[ps.month]} ${ps.year}`,
          year: ps.year,
          month: ps.month,
          employees: 0,
          grossTotal: 0,
          netTotal: 0,
          runDate: null,
          statuses: new Set<string>(),
        });
      }
      const run = virtualRunMap.get(key);
      run.employees += 1;
      run.grossTotal += Number(ps.grossSalary);
      run.netTotal += Number(ps.netSalary);
      run.statuses.add(ps.status);
      if (!run.runDate || ps.createdAt > run.runDate) run.runDate = ps.createdAt;
    }

    // Map real DB runs
    const realRuns = dbRuns.map(run => {
      const [y, m] = run.period.split('-').map(Number);
      return {
        id: run.id,
        period: `${MONTH_NAMES_DE[m] || run.period} ${y}`,
        periodKey: run.period,
        year: y,
        month: m,
        employees: run._count.payslips || run.employees,
        grossTotal: Math.round(Number(run.grossTotal) * 100) / 100,
        netTotal: Math.round(Number(run.netTotal) * 100) / 100,
        runDate: run.createdAt.toLocaleDateString('de-CH'),
        status: RUN_STATUS_MAP[run.status] || run.status,
      };
    });

    // Map virtual runs
    const virtualRuns = Array.from(virtualRunMap.values()).map(run => {
      let status = 'Entwurf';
      if (run.statuses.has('PAID') && run.statuses.size === 1) status = 'Abgeschlossen';
      else if (run.statuses.has('PENDING')) status = 'In Bearbeitung';
      else if (run.statuses.has('PAID')) status = 'Prüfung';

      return {
        id: run.id,
        period: run.periodLabel,
        periodKey: run.id,
        year: run.year,
        month: run.month,
        employees: run.employees,
        grossTotal: Math.round(run.grossTotal * 100) / 100,
        netTotal: Math.round(run.netTotal * 100) / 100,
        runDate: run.runDate ? new Date(run.runDate).toLocaleDateString('de-CH') : null,
        status,
      };
    });

    const payrollRuns = [...realRuns, ...virtualRuns].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    // 3) Get employee payroll data for the current/latest run
    const latestRun = payrollRuns.find(r => r.status !== 'Abgeschlossen') || payrollRuns[0];
    const targetYear = query.year || latestRun?.year;
    const targetMonth = query.month || latestRun?.month;

    const payslipWhere: any = { employee: { companyId } };
    if (targetYear) payslipWhere.year = targetYear;
    if (targetMonth) payslipWhere.month = targetMonth;
    if (query.employeeId) payslipWhere.employeeId = query.employeeId;

    const [data, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where: payslipWhere,
        skip,
        take: pageSize,
        orderBy: { employee: { lastName: 'asc' } },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, position: true, email: true },
          },
          items: true,
        },
      }),
      this.prisma.payslip.count({ where: payslipWhere }),
    ]);

    const mappedData = data.map(payslip => this.mapPayslipToFrontend(payslip as any));

    return {
      payrollRuns,
      data: mappedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * GET /payroll/stats
   */
  async getStats(companyId: string) {
    const now = new Date();
    let payslips = await this.prisma.payslip.findMany({
      where: { employee: { companyId }, year: now.getFullYear(), month: now.getMonth() + 1 },
      include: { items: true },
    });

    if (payslips.length === 0) {
      const latest = await this.prisma.payslip.findFirst({
        where: { employee: { companyId } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
      if (latest) {
        payslips = await this.prisma.payslip.findMany({
          where: { employee: { companyId }, year: latest.year, month: latest.month },
          include: { items: true },
        });
      }
    }

    let totalGross = 0, totalNet = 0, totalAHV = 0, totalBVG = 0;
    for (const ps of payslips) {
      const gross = Number(ps.grossSalary);
      totalGross += gross;
      totalNet += Number(ps.netSalary);
      totalAHV += this.sumItemsByType(ps.items, ['ahv', 'social', 'ahv_iv_eo']) || gross * RATES.AHV_IV_EO / 100;
      totalBVG += this.sumItemsByType(ps.items, ['bvg', 'pension']) || gross * RATES.BVG / 100;
    }

    return {
      totalGross: Math.round(totalGross * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
      totalAHV: Math.round(totalAHV * 100) / 100,
      totalBVG: Math.round(totalBVG * 100) / 100,
      employeeCount: payslips.length,
    };
  }

  /**
   * POST /payroll/:id/complete — Complete a payroll run
   */
  async completeRun(runId: string, companyId: string) {
    // Try to find a real PayrollRun first
    const dbRun = await this.prisma.payrollRun.findFirst({
      where: { id: runId, companyId },
    });

    if (dbRun) {
      // Update all linked payslips to PAID
      await this.prisma.payslip.updateMany({
        where: { payrollRunId: dbRun.id },
        data: { status: 'PAID', paymentDate: new Date() },
      });

      // Also update payslips for this period without payrollRunId
      const [y, m] = dbRun.period.split('-').map(Number);
      await this.prisma.payslip.updateMany({
        where: {
          employee: { companyId },
          year: y,
          month: m,
          payrollRunId: null,
        },
        data: { status: 'PAID', paymentDate: new Date(), payrollRunId: dbRun.id },
      });

      // Recalculate totals
      const payslips = await this.prisma.payslip.findMany({
        where: { payrollRunId: dbRun.id },
      });
      const grossTotal = payslips.reduce((s, p) => s + Number(p.grossSalary), 0);
      const netTotal = payslips.reduce((s, p) => s + Number(p.netSalary), 0);

      const updated = await this.prisma.payrollRun.update({
        where: { id: dbRun.id },
        data: {
          status: 'COMPLETED',
          grossTotal,
          netTotal,
          employees: payslips.length,
        },
      });

      return {
        ...updated,
        grossTotal: Number(updated.grossTotal),
        netTotal: Number(updated.netTotal),
        status: 'Abgeschlossen',
        message: `Lohnlauf ${dbRun.period} erfolgreich abgeschlossen`,
      };
    }

    // Fallback: virtual run ID like "2024-02"
    const parts = runId.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      if (!isNaN(year) && !isNaN(month)) {
        const result = await this.prisma.payslip.updateMany({
          where: { employee: { companyId }, year, month },
          data: { status: 'PAID', paymentDate: new Date() },
        });
        return {
          id: runId,
          period: `${MONTH_NAMES_DE[month]} ${year}`,
          status: 'Abgeschlossen',
          employees: result.count,
          message: `Lohnlauf ${MONTH_NAMES_DE[month]} ${year} erfolgreich abgeschlossen`,
        };
      }
    }

    throw new NotFoundException('Lohnlauf nicht gefunden');
  }

  // ==========================================
  // PAYSLIPS
  // ==========================================

  /**
   * GET /payroll/:id or GET /payslips/:id
   */
  async findOne(id: string, companyId: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id, employee: { companyId } },
      include: {
        employee: {
          select: {
            id: true, firstName: true, lastName: true, position: true, email: true,
            ahvNumber: true, dateOfBirth: true, hireDate: true,
            department: { select: { name: true } },
            contracts: {
              orderBy: { startDate: 'desc' },
              take: 1,
              select: { wageClass: true, workHoursPerWeek: true },
            },
          },
        },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!payslip) throw new NotFoundException('Lohnabrechnung nicht gefunden');

    const ps = payslip as any;
    const employee = ps.employee;
    const contract = employee.contracts?.[0];
    const items = ps.items || [];

    const earnings = items.filter((i: any) => i.category === 'EARNING')
      .map((i: any) => ({ description: i.description, amount: Number(i.amount), type: i.type }));
    const deductions = items.filter((i: any) => i.category === 'DEDUCTION')
      .map((i: any) => ({ description: i.description, amount: Number(i.amount), rate: i.rate ? Number(i.rate) : null, type: i.type }));
    const employerContributions = items.filter((i: any) => i.category === 'EMPLOYER_CONTRIBUTION')
      .map((i: any) => ({ description: i.description, amount: Number(i.amount) }));
    const expenses = items.filter((i: any) => i.category === 'EXPENSE')
      .map((i: any) => ({ description: i.description, amount: Number(i.amount) }));

    return {
      id: ps.id,
      employeeId: ps.employeeId,
      payrollRunId: ps.payrollRunId,
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        email: employee.email,
        ahvNumber: employee.ahvNumber,
        birthDate: employee.dateOfBirth,
        entryDate: employee.hireDate,
        department: employee.department?.name,
        salaryClass: contract?.wageClass,
        workload: contract?.workHoursPerWeek ? Number(contract.workHoursPerWeek) : null,
      },
      period: `${MONTH_NAMES_DE[ps.month]} ${ps.year}`,
      periodStart: new Date(ps.year, ps.month - 1, 1).toISOString(),
      periodEnd: new Date(ps.year, ps.month, 0).toISOString(),
      paymentDate: ps.paymentDate?.toISOString(),
      status: PAYSLIP_STATUS_MAP[ps.status] || ps.status,
      workingTime: {
        targetHours: Number(ps.targetHours || 0),
        actualHours: Number(ps.actualHours || 0),
        overtime: Number(ps.overtimeHours || 0),
        holidays: Number(ps.holidayDays || 0),
        sickDays: Number(ps.sickDays || 0),
        vacationDays: Number(ps.vacationDays || 0),
      },
      earnings, deductions, employerContributions, expenses,
      grossSalary: Number(ps.grossSalary),
      netSalary: Number(ps.netSalary),
      bruttoLohn: Number(ps.grossSalary),
      nettoLohn: Number(ps.netSalary),
      createdAt: ps.createdAt.toISOString(),
      updatedAt: ps.updatedAt.toISOString(),
    };
  }

  /**
   * GET /payslips — List payslips
   */
  async findAllPayslips(companyId: string, query: {
    page?: number; pageSize?: number; employeeId?: string; period?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { employee: { companyId } };
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.period) {
      const match = query.period.match(/(\d{4})-(\d{1,2})/);
      if (match) {
        where.year = parseInt(match[1]);
        where.month = parseInt(match[2]);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where, skip, take: pageSize,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, position: true } },
          items: true,
        },
      }),
      this.prisma.payslip.count({ where }),
    ]);

    const mapped = data.map(ps => ({
      id: ps.id,
      employeeId: ps.employeeId,
      payrollRunId: ps.payrollRunId,
      employee: { ...ps.employee, name: `${ps.employee.firstName} ${ps.employee.lastName}` },
      period: `${MONTH_NAMES_DE[ps.month]} ${ps.year}`,
      year: ps.year, month: ps.month,
      grossSalary: Number(ps.grossSalary),
      netSalary: Number(ps.netSalary),
      status: PAYSLIP_STATUS_MAP[ps.status] || ps.status,
      paymentDate: ps.paymentDate?.toISOString(),
      createdAt: ps.createdAt.toISOString(),
    }));

    return { data: mapped, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async create(companyId: string, dto: CreatePayslipDto) {
    const employee = await this.prisma.employee.findFirst({ where: { id: dto.employeeId, companyId } });
    if (!employee) throw new NotFoundException('Mitarbeiter nicht gefunden');

    return this.prisma.payslip.create({
      data: {
        employeeId: dto.employeeId,
        year: dto.year,
        month: dto.month,
        grossSalary: dto.grossSalary,
        netSalary: dto.netSalary,
        totalDeductions: dto.totalDeductions || 0,
        totalExpenses: dto.totalExpenses || 0,
        totalEmployerCost: dto.totalEmployerCost || 0,
        targetHours: dto.targetHours,
        actualHours: dto.actualHours,
        overtimeHours: dto.overtimeHours,
        holidayDays: dto.holidayDays,
        sickDays: dto.sickDays,
        vacationDays: dto.vacationDays,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
        notes: dto.notes,
        items: dto.items ? {
          create: dto.items.map((item, index) => ({
            category: item.category as any,
            type: item.type,
            description: item.description,
            amount: item.amount,
            rate: item.rate,
            sortOrder: item.sortOrder ?? index,
          })),
        } : undefined,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: true,
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdatePayslipDto) {
    const payslip = await this.prisma.payslip.findFirst({ where: { id, employee: { companyId } } });
    if (!payslip) throw new NotFoundException('Lohnabrechnung nicht gefunden');

    const { items, employeeId, ...updateData } = dto as any;
    if (updateData.paymentDate) updateData.paymentDate = new Date(updateData.paymentDate);

    return this.prisma.payslip.update({
      where: { id },
      data: updateData,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: true,
      },
    });
  }

  async remove(id: string, companyId: string) {
    const payslip = await this.prisma.payslip.findFirst({ where: { id, employee: { companyId } } });
    if (!payslip) throw new NotFoundException('Lohnabrechnung nicht gefunden');
    return this.prisma.payslip.delete({ where: { id } });
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private mapPayslipToFrontend(payslip: any) {
    const items = payslip.items || [];
    const gross = Number(payslip.grossSalary);
    return {
      id: payslip.id,
      employeeId: payslip.employeeId,
      name: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
      firstName: payslip.employee.firstName,
      lastName: payslip.employee.lastName,
      position: payslip.employee.position || '',
      role: payslip.employee.position || '',
      bruttoLohn: gross,
      nettoLohn: Number(payslip.netSalary),
      ahvIvEo: this.sumItemsByType(items, ['ahv', 'social', 'ahv_iv_eo']) || gross * RATES.AHV_IV_EO / 100,
      alv: this.sumItemsByType(items, ['alv', 'unemployment']) || gross * RATES.ALV / 100,
      bvg: this.sumItemsByType(items, ['bvg', 'pension']) || gross * RATES.BVG / 100,
      nbuKtg: this.sumItemsByType(items, ['nbu', 'ktg', 'insurance', 'accident']) || gross * (RATES.NBU + RATES.KTG) / 100,
      quellensteuer: this.sumItemsByType(items, ['quellensteuer', 'tax', 'withholding']) || 0,
      status: PAYSLIP_STATUS_MAP[payslip.status] || payslip.status,
      year: payslip.year,
      month: payslip.month,
    };
  }

  private sumItemsByType(items: any[], typeKeywords: string[]): number {
    return items
      .filter((item: any) =>
        item.category === 'DEDUCTION' &&
        typeKeywords.some(kw => (item.type || '').toLowerCase().includes(kw))
      )
      .reduce((sum: number, item: any) => sum + Math.abs(Number(item.amount)), 0);
  }
}
