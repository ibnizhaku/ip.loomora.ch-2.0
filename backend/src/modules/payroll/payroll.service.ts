import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePayslipDto, UpdatePayslipDto } from './dto/payroll.dto';

// Swiss social insurance rates 2024
const RATES = {
  AHV_IV_EO: 5.3,   // AN-Anteil
  ALV: 1.1,          // AN-Anteil (bis CHF 148'200)
  BVG: 7.0,          // Durchschnitt (altersabhängig 7-18%)
  NBU: 1.0,          // Nichtberufsunfall
  KTG: 0.5,          // Krankentaggeld
};

const MONTH_NAMES_DE = [
  '', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

const STATUS_MAP: Record<string, string> = {
  DRAFT: 'Entwurf',
  PENDING: 'In Bearbeitung',
  PAID: 'Abgeschlossen',
  CANCELLED: 'Storniert',
};

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /payroll — Returns { payrollRuns, data } for the Payroll page.
   * payrollRuns: Virtual Lohnläufe grouped by year+month
   * data: Employee payroll entries with Swiss field names for the current/latest run
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

    const where: any = {
      employee: { companyId },
    };
    if (query.year) where.year = query.year;
    if (query.month) where.month = query.month;
    if (query.employeeId) where.employeeId = query.employeeId;

    // Get all payslips for building payroll runs
    const allPayslips = await this.prisma.payslip.findMany({
      where: { employee: { companyId } },
      select: {
        id: true,
        year: true,
        month: true,
        grossSalary: true,
        netSalary: true,
        status: true,
        createdAt: true,
      },
    });

    // Build virtual payroll runs grouped by year+month
    const runMap = new Map<string, any>();
    for (const ps of allPayslips) {
      const key = `${ps.year}-${String(ps.month).padStart(2, '0')}`;
      if (!runMap.has(key)) {
        runMap.set(key, {
          id: key,
          period: `${MONTH_NAMES_DE[ps.month]} ${ps.year}`,
          year: ps.year,
          month: ps.month,
          employees: 0,
          grossTotal: 0,
          netTotal: 0,
          runDate: null,
          status: 'Entwurf',
          statuses: new Set<string>(),
        });
      }
      const run = runMap.get(key);
      run.employees += 1;
      run.grossTotal += Number(ps.grossSalary);
      run.netTotal += Number(ps.netSalary);
      run.statuses.add(ps.status);
      if (!run.runDate || ps.createdAt > run.runDate) {
        run.runDate = ps.createdAt;
      }
    }

    // Determine run status from payslip statuses
    const payrollRuns = Array.from(runMap.values())
      .map(run => {
        let status = 'Entwurf';
        if (run.statuses.has('PAID') && run.statuses.size === 1) {
          status = 'Abgeschlossen';
        } else if (run.statuses.has('PENDING')) {
          status = 'In Bearbeitung';
        } else if (run.statuses.has('PAID')) {
          status = 'Prüfung';
        } else if (run.statuses.has('DRAFT')) {
          status = 'Entwurf';
        }

        return {
          id: run.id,
          period: run.period,
          year: run.year,
          month: run.month,
          employees: run.employees,
          grossTotal: Math.round(run.grossTotal * 100) / 100,
          netTotal: Math.round(run.netTotal * 100) / 100,
          runDate: run.runDate ? new Date(run.runDate).toLocaleDateString('de-CH') : null,
          status,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

    // Get current period payslips (or latest) for the employee table
    const latestRun = payrollRuns.find(r => r.status !== 'Abgeschlossen') || payrollRuns[0];
    const targetYear = query.year || latestRun?.year;
    const targetMonth = query.month || latestRun?.month;

    const payslipWhere: any = {
      employee: { companyId },
    };
    if (targetYear) payslipWhere.year = targetYear;
    if (targetMonth) payslipWhere.month = targetMonth;

    const [data, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where: payslipWhere,
        skip,
        take: pageSize,
        orderBy: { employee: { lastName: 'asc' } },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              position: true,
              email: true,
            },
          },
          items: true,
        },
      }),
      this.prisma.payslip.count({ where: payslipWhere }),
    ]);

    // Map to Swiss field names the frontend expects
    const mappedData = data.map(payslip => {
      const items = payslip.items || [];
      const ahvIvEo = this.sumItemsByType(items, ['ahv', 'social', 'ahv_iv_eo']);
      const alv = this.sumItemsByType(items, ['alv', 'unemployment']);
      const bvg = this.sumItemsByType(items, ['bvg', 'pension']);
      const nbuKtg = this.sumItemsByType(items, ['nbu', 'ktg', 'insurance', 'accident']);
      const quellensteuer = this.sumItemsByType(items, ['quellensteuer', 'tax', 'withholding']);

      return {
        id: payslip.id,
        employeeId: payslip.employeeId,
        name: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
        firstName: payslip.employee.firstName,
        lastName: payslip.employee.lastName,
        position: payslip.employee.position || '',
        role: payslip.employee.position || '',
        bruttoLohn: Number(payslip.grossSalary),
        nettoLohn: Number(payslip.netSalary),
        ahvIvEo: ahvIvEo || Number(payslip.grossSalary) * RATES.AHV_IV_EO / 100,
        alv: alv || Number(payslip.grossSalary) * RATES.ALV / 100,
        bvg: bvg || Number(payslip.grossSalary) * RATES.BVG / 100,
        nbuKtg: nbuKtg || Number(payslip.grossSalary) * (RATES.NBU + RATES.KTG) / 100,
        quellensteuer: quellensteuer || 0,
        status: STATUS_MAP[payslip.status] || payslip.status,
        year: payslip.year,
        month: payslip.month,
      };
    });

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
   * GET /payroll/stats — Payroll statistics
   */
  async getStats(companyId: string) {
    // Get current month payslips (or latest available)
    const now = new Date();
    let payslips = await this.prisma.payslip.findMany({
      where: {
        employee: { companyId },
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
      include: { items: true },
    });

    // Fallback to latest month if current month has no payslips
    if (payslips.length === 0) {
      const latest = await this.prisma.payslip.findFirst({
        where: { employee: { companyId } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
      if (latest) {
        payslips = await this.prisma.payslip.findMany({
          where: {
            employee: { companyId },
            year: latest.year,
            month: latest.month,
          },
          include: { items: true },
        });
      }
    }

    let totalGross = 0;
    let totalNet = 0;
    let totalAHV = 0;
    let totalBVG = 0;

    for (const ps of payslips) {
      const gross = Number(ps.grossSalary);
      totalGross += gross;
      totalNet += Number(ps.netSalary);

      const ahv = this.sumItemsByType(ps.items, ['ahv', 'social', 'ahv_iv_eo']);
      const bvg = this.sumItemsByType(ps.items, ['bvg', 'pension']);
      totalAHV += ahv || gross * RATES.AHV_IV_EO / 100;
      totalBVG += bvg || gross * RATES.BVG / 100;
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
   * POST /payroll/:id/complete — Complete a payroll run (year-month ID like "2024-02")
   */
  async completeRun(runId: string, companyId: string) {
    const parts = runId.split('-');
    if (parts.length < 2) {
      throw new BadRequestException('Ungültige Lohnlauf-ID. Format: YYYY-MM');
    }
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      throw new BadRequestException('Ungültiges Jahr oder Monat');
    }

    const payslips = await this.prisma.payslip.findMany({
      where: {
        employee: { companyId },
        year,
        month,
      },
    });

    if (payslips.length === 0) {
      throw new NotFoundException('Kein Lohnlauf für diese Periode gefunden');
    }

    // Mark all payslips as PAID
    await this.prisma.payslip.updateMany({
      where: {
        id: { in: payslips.map(p => p.id) },
      },
      data: {
        status: 'PAID',
        paymentDate: new Date(),
      },
    });

    return {
      id: runId,
      period: `${MONTH_NAMES_DE[month]} ${year}`,
      status: 'Abgeschlossen',
      employees: payslips.length,
      message: `Lohnlauf ${MONTH_NAMES_DE[month]} ${year} erfolgreich abgeschlossen`,
    };
  }

  /**
   * GET /payroll/:id or GET /payslips/:id — Get single payslip
   */
  async findOne(id: string, companyId: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: {
        id,
        employee: { companyId },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            email: true,
            ahvNumber: true,
            dateOfBirth: true,
            hireDate: true,
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

    if (!payslip) {
      throw new NotFoundException('Lohnabrechnung nicht gefunden');
    }

    // Map to frontend-friendly format
    const ps = payslip as any;
    const employee = ps.employee;
    const contract = employee.contracts?.[0];
    const items = ps.items || [];

    const earnings = items
      .filter(i => i.category === 'EARNING')
      .map(i => ({ description: i.description, amount: Number(i.amount), type: i.type }));

    const deductions = items
      .filter(i => i.category === 'DEDUCTION')
      .map(i => ({
        description: i.description,
        amount: Number(i.amount),
        rate: i.rate ? Number(i.rate) : null,
        type: i.type,
      }));

    const employerContributions = items
      .filter(i => i.category === 'EMPLOYER_CONTRIBUTION')
      .map(i => ({ description: i.description, amount: Number(i.amount) }));

    const expenses = items
      .filter(i => i.category === 'EXPENSE')
      .map(i => ({ description: i.description, amount: Number(i.amount) }));

    return {
      id: ps.id,
      employeeId: ps.employeeId,
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
      status: STATUS_MAP[ps.status] || ps.status,
      workingTime: {
        targetHours: Number(ps.targetHours || 0),
        actualHours: Number(ps.actualHours || 0),
        overtime: Number(ps.overtimeHours || 0),
        holidays: Number(ps.holidayDays || 0),
        sickDays: Number(ps.sickDays || 0),
        vacationDays: Number(ps.vacationDays || 0),
      },
      earnings,
      deductions,
      employerContributions,
      expenses,
      grossSalary: Number(ps.grossSalary),
      netSalary: Number(ps.netSalary),
      // Also provide Swiss-style names
      bruttoLohn: Number(ps.grossSalary),
      nettoLohn: Number(ps.netSalary),
      createdAt: ps.createdAt.toISOString(),
      updatedAt: ps.updatedAt.toISOString(),
    };
  }

  /**
   * GET /payslips — List payslips (for PayslipsController)
   */
  async findAllPayslips(companyId: string, query: {
    page?: number;
    pageSize?: number;
    employeeId?: string;
    period?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {
      employee: { companyId },
    };
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.period) {
      // Parse period like "2024-02" or "Februar 2024"
      const match = query.period.match(/(\d{4})-(\d{1,2})/);
      if (match) {
        where.year = parseInt(match[1]);
        where.month = parseInt(match[2]);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, position: true },
          },
          items: true,
        },
      }),
      this.prisma.payslip.count({ where }),
    ]);

    const mapped = data.map(ps => ({
      id: ps.id,
      employeeId: ps.employeeId,
      employee: {
        ...ps.employee,
        name: `${ps.employee.firstName} ${ps.employee.lastName}`,
      },
      period: `${MONTH_NAMES_DE[ps.month]} ${ps.year}`,
      year: ps.year,
      month: ps.month,
      grossSalary: Number(ps.grossSalary),
      netSalary: Number(ps.netSalary),
      status: STATUS_MAP[ps.status] || ps.status,
      paymentDate: ps.paymentDate?.toISOString(),
      createdAt: ps.createdAt.toISOString(),
    }));

    return { data: mapped, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async create(companyId: string, dto: CreatePayslipDto) {
    // Verify employee belongs to company
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
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
        items: dto.items
          ? {
              create: dto.items.map((item, index) => ({
                category: item.category as any,
                type: item.type,
                description: item.description,
                amount: item.amount,
                rate: item.rate,
                sortOrder: item.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
        items: true,
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdatePayslipDto) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!payslip) throw new NotFoundException('Lohnabrechnung nicht gefunden');

    const { items, employeeId, ...updateData } = dto as any;

    if (updateData.paymentDate) {
      updateData.paymentDate = new Date(updateData.paymentDate);
    }

    return this.prisma.payslip.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
        items: true,
      },
    });
  }

  async remove(id: string, companyId: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!payslip) throw new NotFoundException('Lohnabrechnung nicht gefunden');

    return this.prisma.payslip.delete({ where: { id } });
  }

  /**
   * Helper: Sum PayslipItem amounts by type keywords
   */
  private sumItemsByType(items: any[], typeKeywords: string[]): number {
    return items
      .filter(item =>
        item.category === 'DEDUCTION' &&
        typeKeywords.some(kw => (item.type || '').toLowerCase().includes(kw))
      )
      .reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0);
  }
}
