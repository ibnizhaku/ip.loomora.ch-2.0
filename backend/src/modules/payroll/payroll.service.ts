import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePayslipDto, UpdatePayslipDto } from './dto/payroll.dto';

// ============================================
// SWISS SOCIAL INSURANCE RATES 2024/2025
// ============================================
const RATES = {
  AHV_IV_EO: 5.3,      // Arbeitnehmer-Anteil
  ALV: 1.1,             // Arbeitslosenversicherung (bis CHF 148'200)
  BVG: 7.0,             // BVG Pensionskasse (altersabhängig, Durchschnitt)
  NBU: 1.227,           // Nichtberufsunfall
  KTG: 0.5,             // Krankentaggeld
  // Arbeitgeber-Anteile
  AHV_IV_EO_AG: 5.3,
  ALV_AG: 1.1,
  FAK: 2.4,             // Familienausgleichskasse
  UVG_BU: 0.87,         // Berufsunfall (AG)
  BVG_AG: 7.0,          // BVG AG (mind. = AN)
};

const MONTH_NAMES_DE = [
  '', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

// Payslip status: always lowercase English (Frontend translates)
const PAYSLIP_STATUS_MAP: Record<string, string> = {
  DRAFT: 'draft',
  PENDING: 'pending',
  COMPLETED: 'completed',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

const RUN_STATUS_MAP: Record<string, string> = {
  DRAFT: 'Entwurf',
  PROCESSING: 'In Bearbeitung',
  COMPLETED: 'Abgeschlossen',
  PAID: 'Ausbezahlt',
};

// ============================================
// HELPERS
// ============================================
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function periodLabel(period: string): string {
  const [y, m] = (period || '').split('-').map(Number);
  if (m >= 1 && m <= 12 && y) return `${MONTH_NAMES_DE[m]} ${y}`;
  return period;
}

function parsePeriod(period: string): { year: number; month: number } {
  const [y, m] = (period || '').split('-').map(Number);
  return { year: y || 0, month: m || 0 };
}

function formatDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toLocaleDateString('de-CH');
}

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. POST /payroll — Create a new PayrollRun
  // ==========================================
  async createRun(companyId: string, dto: {
    period: string;
    periodStart?: string;
    periodEnd?: string;
    status?: string;
    employees?: number;
    employeeIds?: string[];
  }) {
    try {
      // Parse period (e.g. "2026-02")
      const { year, month } = parsePeriod(dto.period);
      if (!year || !month || month < 1 || month > 12) {
        throw new BadRequestException('Ungültige Periode. Format: YYYY-MM');
      }

      // Check for existing non-completed run for this period — delete it
      const existing = await this.prisma.payrollRun.findFirst({
        where: { companyId, period: dto.period, status: { in: ['DRAFT', 'PROCESSING'] } },
        include: { payslips: { select: { id: true } } },
      });
      if (existing) {
        const payslipIds = existing.payslips.map(ps => ps.id);
        if (payslipIds.length > 0) {
          await this.prisma.payslipItem.deleteMany({ where: { payslipId: { in: payslipIds } } });
          await this.prisma.payslip.deleteMany({ where: { id: { in: payslipIds } } });
        }
        await this.prisma.payrollRun.delete({ where: { id: existing.id } });
      }

      // Period dates
      const periodStart = dto.periodStart
        ? new Date(dto.periodStart)
        : new Date(year, month - 1, 1);
      const periodEnd = dto.periodEnd
        ? new Date(dto.periodEnd)
        : new Date(year, month, 0);

      // Get employees
      const employeeWhere: any = { companyId, status: 'ACTIVE' };
      if (dto.employeeIds?.length) {
        employeeWhere.id = { in: dto.employeeIds };
      }

      const employees = await this.prisma.employee.findMany({
        where: employeeWhere,
        include: {
          contracts: {
            orderBy: { startDate: 'desc' as const },
            take: 1,
            select: { baseSalary: true, hourlyRate: true, salaryType: true, workHoursPerWeek: true },
          },
        },
      });

      if (employees.length === 0) {
        throw new BadRequestException('Keine aktiven Mitarbeiter gefunden');
      }

      // Create the PayrollRun
      const run = await this.prisma.payrollRun.create({
        data: {
          companyId,
          period: dto.period,
          periodStart,
          periodEnd,
          status: 'DRAFT',
          employees: employees.length,
          grossTotal: 0,
          netTotal: 0,
        },
      });

      // Generate payslips for each employee
      let totalGross = 0;
      let totalNet = 0;

      for (const emp of employees) {
        // Calculate salary from contract
        const contract = emp.contracts?.[0];
        const baseSalary = contract?.baseSalary ? Number(contract.baseSalary) : 0;
        const hourlyRate = contract?.hourlyRate ? Number(contract.hourlyRate) : 0;
        const workHours = contract?.workHoursPerWeek ? Number(contract.workHoursPerWeek) : 42.5;
        const monthlyHours = round2(workHours * 4.33);

        // Gross salary
        let grossSalary = baseSalary;
        if (!grossSalary && hourlyRate) {
          grossSalary = round2(hourlyRate * monthlyHours);
        }

        // Swiss deductions (Arbeitnehmer)
        const ahvIvEo = round2(grossSalary * RATES.AHV_IV_EO / 100);
        const alv = round2(grossSalary * RATES.ALV / 100);
        const bvg = round2(grossSalary * RATES.BVG / 100);
        const nbu = round2(grossSalary * RATES.NBU / 100);
        const ktg = round2(grossSalary * RATES.KTG / 100);
        const totalDeductions = round2(ahvIvEo + alv + bvg + nbu + ktg);
        const netSalary = round2(grossSalary - totalDeductions);

        // Employer contributions
        const ahvAg = round2(grossSalary * RATES.AHV_IV_EO_AG / 100);
        const alvAg = round2(grossSalary * RATES.ALV_AG / 100);
        const fak = round2(grossSalary * RATES.FAK / 100);
        const uvgBu = round2(grossSalary * RATES.UVG_BU / 100);
        const bvgAg = round2(grossSalary * RATES.BVG_AG / 100);
        const totalEmployerCost = round2(ahvAg + alvAg + fak + uvgBu + bvgAg);

        // Create payslip with items
        await this.prisma.payslip.create({
          data: {
            employeeId: emp.id,
            payrollRunId: run.id,
            year,
            month,
            grossSalary,
            netSalary,
            totalDeductions,
            totalExpenses: 0,
            totalEmployerCost,
            targetHours: monthlyHours,
            actualHours: monthlyHours,
            status: 'DRAFT',
            items: {
              create: [
                // Earnings
                { category: 'EARNING' as any, type: 'base', description: 'Grundlohn', amount: grossSalary, sortOrder: 0 },
                // Deductions (AN)
                { category: 'DEDUCTION' as any, type: 'ahv_iv_eo', description: 'AHV / IV / EO', amount: ahvIvEo, rate: RATES.AHV_IV_EO, sortOrder: 1 },
                { category: 'DEDUCTION' as any, type: 'alv', description: 'ALV', amount: alv, rate: RATES.ALV, sortOrder: 2 },
                { category: 'DEDUCTION' as any, type: 'bvg', description: 'BVG Pensionskasse', amount: bvg, rate: RATES.BVG, sortOrder: 3 },
                { category: 'DEDUCTION' as any, type: 'nbu', description: 'NBU (Nichtberufsunfall)', amount: nbu, rate: RATES.NBU, sortOrder: 4 },
                { category: 'DEDUCTION' as any, type: 'ktg', description: 'KTG (Krankentaggeld)', amount: ktg, rate: RATES.KTG, sortOrder: 5 },
                // Employer contributions (AG)
                { category: 'EMPLOYER_CONTRIBUTION' as any, type: 'ahv_ag', description: 'AHV / IV / EO (AG)', amount: ahvAg, sortOrder: 10 },
                { category: 'EMPLOYER_CONTRIBUTION' as any, type: 'alv_ag', description: 'ALV (AG)', amount: alvAg, sortOrder: 11 },
                { category: 'EMPLOYER_CONTRIBUTION' as any, type: 'fak', description: 'FAK (Familienausgleich)', amount: fak, sortOrder: 12 },
                { category: 'EMPLOYER_CONTRIBUTION' as any, type: 'uvg_bu', description: 'UVG Berufsunfall', amount: uvgBu, sortOrder: 13 },
                { category: 'EMPLOYER_CONTRIBUTION' as any, type: 'bvg_ag', description: 'BVG (AG)', amount: bvgAg, sortOrder: 14 },
              ],
            },
          },
        });

        totalGross += grossSalary;
        totalNet += netSalary;
      }

      // Update run totals
      const updated = await this.prisma.payrollRun.update({
        where: { id: run.id },
        data: {
          grossTotal: round2(totalGross),
          netTotal: round2(totalNet),
        },
      });

      return {
        id: updated.id,
        period: periodLabel(updated.period),
        periodKey: updated.period,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        status: RUN_STATUS_MAP[updated.status] || updated.status,
        grossTotal: Number(updated.grossTotal),
        netTotal: Number(updated.netTotal),
        employees: updated.employees,
        year,
        month,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('createRun failed:', error);
      throw new BadRequestException(`Fehler beim Erstellen des Lohnlaufs: ${error.message || error}`);
    }
  }

  // ==========================================
  // 2. POST /payroll/:id/complete
  // ==========================================
  async completeRun(runId: string, companyId: string) {
    try {
      const dbRun = await this.prisma.payrollRun.findFirst({
        where: { id: runId, companyId },
      });

      if (!dbRun) {
        // Fallback: virtual run ID like "2026-02"
        const { year, month } = parsePeriod(runId);
        if (year && month) {
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
        throw new NotFoundException('Lohnlauf nicht gefunden');
      }

      // Validate: only DRAFT runs can be completed
      if (dbRun.status !== 'DRAFT' && dbRun.status !== 'PROCESSING') {
        throw new BadRequestException(`Lohnlauf kann nicht abgeschlossen werden (Status: ${RUN_STATUS_MAP[dbRun.status] || dbRun.status})`);
      }

      // Atomic transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Update all linked payslips
        await tx.payslip.updateMany({
          where: { payrollRunId: dbRun.id },
          data: { status: 'PAID', paymentDate: new Date() },
        });

        // Also link orphaned payslips for this period
        const { year, month } = parsePeriod(dbRun.period);
        if (year && month) {
          await tx.payslip.updateMany({
            where: {
              employee: { companyId },
              year,
              month,
              payrollRunId: null,
            },
            data: { status: 'PAID', paymentDate: new Date(), payrollRunId: dbRun.id },
          });
        }

        // Recalculate totals
        const payslips = await tx.payslip.findMany({
          where: { payrollRunId: dbRun.id },
        });
        const grossTotal = round2(payslips.reduce((s, p) => s + Number(p.grossSalary), 0));
        const netTotal = round2(payslips.reduce((s, p) => s + Number(p.netSalary), 0));

        // Update run
        return tx.payrollRun.update({
          where: { id: dbRun.id },
          data: {
            status: 'COMPLETED',
            grossTotal,
            netTotal,
            employees: payslips.length,
          },
        });
      });

      return {
        id: result.id,
        period: periodLabel(result.period),
        periodKey: result.period,
        status: 'Abgeschlossen',
        grossTotal: Number(result.grossTotal),
        netTotal: Number(result.netTotal),
        employees: result.employees,
        message: `Lohnlauf ${periodLabel(result.period)} erfolgreich abgeschlossen`,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      console.error('completeRun failed:', error);
      throw new BadRequestException(`Fehler beim Abschliessen: ${error.message || error}`);
    }
  }

  // ==========================================
  // 3. GET /payroll/:id — PayrollRun Detail
  // ==========================================
  async findRunById(id: string, companyId: string) {
    try {
      const run = await this.prisma.payrollRun.findFirst({
        where: { id, companyId },
        include: {
          company: {
            select: { name: true, legalName: true, street: true, city: true, zipCode: true, vatNumber: true },
          },
          payslips: {
            include: {
              employee: {
                include: { department: { select: { name: true } } },
              },
              items: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      });

      if (!run) {
        throw new NotFoundException('Lohnlauf nicht gefunden');
      }

      const { year: y, month: m } = parsePeriod(run.period);
      const company = (run as any).company || {};
      const companyAddress = [company.street, `${company.zipCode || ''} ${company.city || ''}`].filter(Boolean).join(', ').trim();

      // Map payslips with full detail
      const data = (run.payslips || []).map(ps => {
        try {
          return this.mapPayslipDetail(ps as any, company, companyAddress);
        } catch {
          const emp = (ps as any).employee || {};
          return {
            id: ps.id, employeeId: ps.employeeId,
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unbekannt',
            firstName: emp.firstName || '', lastName: emp.lastName || '',
            position: emp.position || '',
            bruttoLohn: Number(ps.grossSalary || 0), nettoLohn: Number(ps.netSalary || 0),
            grossSalary: Number(ps.grossSalary || 0), netSalary: Number(ps.netSalary || 0),
            ahvIvEo: 0, alv: 0, bvg: 0, nbuKtg: 0, quellensteuer: 0,
            status: PAYSLIP_STATUS_MAP[ps.status] || ps.status,
            earnings: [], deductions: [],
          };
        }
      });

      data.sort((a: any, b: any) => (a.lastName || '').localeCompare(b.lastName || ''));

      return {
        id: run.id,
        period: periodLabel(run.period),
        periodKey: run.period,
        periodStart: run.periodStart?.toISOString() || null,
        periodEnd: run.periodEnd?.toISOString() || null,
        status: RUN_STATUS_MAP[run.status] || run.status,
        employees: run.employees,
        grossTotal: Number(run.grossTotal || 0),
        netTotal: Number(run.netTotal || 0),
        createdAt: run.createdAt?.toISOString() || null,
        updatedAt: run.updatedAt?.toISOString() || null,
        companyName: company.name || '',
        data,
        payslips: data,
        payrollRuns: [{
          id: run.id,
          period: periodLabel(run.period),
          periodKey: run.period,
          year: y, month: m,
          employees: run.employees,
          grossTotal: Number(run.grossTotal || 0),
          netTotal: Number(run.netTotal || 0),
          status: RUN_STATUS_MAP[run.status] || run.status,
          runDate: formatDate(run.createdAt),
        }],
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('findRunById failed:', error);
      throw new BadRequestException(`Fehler beim Laden des Lohnlaufs: ${error.message || error}`);
    }
  }

  // ==========================================
  // 4. GET /payroll — Overview
  // ==========================================
  async findAll(companyId: string, query: {
    page?: number; pageSize?: number; year?: number; month?: number;
    employeeId?: string; status?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 100;
    const skip = (page - 1) * pageSize;

    // 1) Real PayrollRuns
    const dbRuns = await this.prisma.payrollRun.findMany({
      where: { companyId },
      orderBy: { periodStart: 'desc' },
      include: { _count: { select: { payslips: true } } },
    });

    // 2) Orphaned payslips (not linked to any run)
    const orphanPayslips = await this.prisma.payslip.findMany({
      where: { employee: { companyId }, payrollRunId: null },
      select: { year: true, month: true, grossSalary: true, netSalary: true, status: true, createdAt: true },
    });

    const virtualRunMap = new Map<string, any>();
    for (const ps of orphanPayslips) {
      const key = `${ps.year}-${String(ps.month).padStart(2, '0')}`;
      if (dbRuns.some(r => r.period === key)) continue;
      if (!virtualRunMap.has(key)) {
        virtualRunMap.set(key, {
          id: key, period: key,
          periodLabel: `${MONTH_NAMES_DE[ps.month]} ${ps.year}`,
          year: ps.year, month: ps.month,
          employees: 0, grossTotal: 0, netTotal: 0,
          runDate: null, statuses: new Set<string>(),
        });
      }
      const run = virtualRunMap.get(key);
      run.employees += 1;
      run.grossTotal += Number(ps.grossSalary);
      run.netTotal += Number(ps.netSalary);
      run.statuses.add(ps.status);
      if (!run.runDate || ps.createdAt > run.runDate) run.runDate = ps.createdAt;
    }

    // Map real runs
    const realRuns = dbRuns.map(run => {
      const { year: y, month: m } = parsePeriod(run.period);
      return {
        id: run.id,
        period: periodLabel(run.period),
        periodKey: run.period,
        year: y, month: m,
        employees: run._count.payslips || run.employees,
        grossTotal: round2(Number(run.grossTotal)),
        netTotal: round2(Number(run.netTotal)),
        runDate: formatDate(run.createdAt),
        status: RUN_STATUS_MAP[run.status] || run.status,
      };
    });

    // Map virtual runs
    const virtualRuns = Array.from(virtualRunMap.values()).map(run => {
      let status = 'Entwurf';
      if (run.statuses.has('PAID') && run.statuses.size === 1) status = 'Abgeschlossen';
      else if (run.statuses.has('PENDING')) status = 'In Bearbeitung';
      return {
        id: run.id, period: run.periodLabel, periodKey: run.id,
        year: run.year, month: run.month,
        employees: run.employees,
        grossTotal: round2(run.grossTotal), netTotal: round2(run.netTotal),
        runDate: run.runDate ? formatDate(new Date(run.runDate)) : null,
        status,
      };
    });

    const payrollRuns = [...realRuns, ...virtualRuns].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    // 3) Get employee payroll data for the latest/active run
    const latestRun = payrollRuns.find(r => r.status !== 'Abgeschlossen') || payrollRuns[0];
    const targetYear = query.year || latestRun?.year;
    const targetMonth = query.month || latestRun?.month;

    const payslipWhere: any = { employee: { companyId } };
    if (targetYear) payslipWhere.year = targetYear;
    if (targetMonth) payslipWhere.month = targetMonth;
    if (query.employeeId) payslipWhere.employeeId = query.employeeId;

    const [rawData, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where: payslipWhere, skip, take: pageSize,
        orderBy: { employee: { lastName: 'asc' } },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, position: true, email: true } },
          items: true,
        },
      }),
      this.prisma.payslip.count({ where: payslipWhere }),
    ]);

    const data = rawData.map(ps => this.mapPayslipToFrontend(ps as any));

    return {
      payrollRuns,
      data,
      total, page, pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ==========================================
  // GET /payroll/stats
  // ==========================================
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
      totalAHV += this.sumItemsByType(ps.items, ['ahv', 'social', 'ahv_iv_eo']) || round2(gross * RATES.AHV_IV_EO / 100);
      totalBVG += this.sumItemsByType(ps.items, ['bvg', 'pension']) || round2(gross * RATES.BVG / 100);
    }

    return {
      totalGross: round2(totalGross),
      totalNet: round2(totalNet),
      totalAHV: round2(totalAHV),
      totalBVG: round2(totalBVG),
      employeeCount: payslips.length,
    };
  }

  // ==========================================
  // 5. GET /payslips/:id — Single Payslip Detail
  // ==========================================
  async findOne(id: string, companyId: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id, employee: { companyId } },
      include: {
        employee: {
          include: {
            department: { select: { name: true } },
            company: {
              select: { name: true, legalName: true, street: true, city: true, zipCode: true, vatNumber: true },
            },
            contracts: {
              orderBy: { startDate: 'desc' as const },
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
    const emp = ps.employee || {};
    const company = emp.company || {};
    const contract = emp.contracts?.[0];
    const items = ps.items || [];

    const earnings = items.filter((i: any) => i.category === 'EARNING')
      .map((i: any) => ({ description: i.description, amount: Number(i.amount), type: i.type }));
    const deductions = items.filter((i: any) => i.category === 'DEDUCTION')
      .map((i: any) => ({ description: i.description, amount: Number(i.amount), rate: i.rate ? Number(i.rate) : null, type: i.type }));
    const employerContributions = items.filter((i: any) => i.category === 'EMPLOYER_CONTRIBUTION')
      .map((i: any) => ({ description: i.description, amount: Number(i.amount) }));
    const expenses = items.filter((i: any) => i.category === 'EXPENSE')
      .map((i: any) => ({ description: i.description, amount: Number(i.amount) }));

    const companyAddress = [company.street, `${company.zipCode || ''} ${company.city || ''}`].filter(Boolean).join(', ').trim();

    return {
      id: ps.id,
      employeeId: ps.employeeId,
      payrollRunId: ps.payrollRunId,
      employee: {
        id: emp.id,
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        position: emp.position || '',
        email: emp.email || '',
        ahvNumber: emp.ahvNumber || '',
        birthDate: emp.dateOfBirth?.toISOString() || null,
        entryDate: emp.hireDate?.toISOString() || null,
        department: emp.department?.name || '',
        salaryClass: contract?.wageClass || '',
        workload: contract?.workHoursPerWeek ? Number(contract.workHoursPerWeek) : null,
      },
      employer: {
        name: company.legalName || company.name || '',
        address: companyAddress,
        uid: company.vatNumber || '',
      },
      period: `${MONTH_NAMES_DE[ps.month]} ${ps.year}`,
      periodStart: new Date(ps.year, ps.month - 1, 1).toISOString(),
      periodEnd: new Date(ps.year, ps.month, 0).toISOString(),
      paymentDate: ps.paymentDate?.toISOString() || null,
      sendDate: ps.sendDate?.toISOString() || null,
      status: PAYSLIP_STATUS_MAP[ps.status] || ps.status,
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
      bruttoLohn: Number(ps.grossSalary),
      nettoLohn: Number(ps.netSalary),
      bankAccount: {
        iban: emp.iban || '',
        bank: '',
      },
      createdAt: ps.createdAt.toISOString(),
      updatedAt: ps.updatedAt.toISOString(),
    };
  }

  // ==========================================
  // 6. POST /payslips/:id/send
  // ==========================================
  async sendPayslip(id: string, companyId: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id, employee: { companyId } },
      include: { employee: { select: { firstName: true, lastName: true, email: true } } },
    });

    if (!payslip) throw new NotFoundException('Lohnabrechnung nicht gefunden');

    // Mark as sent
    await this.prisma.payslip.update({
      where: { id },
      data: { sendDate: new Date() },
    });

    const emp = payslip.employee;
    const name = `${emp.firstName} ${emp.lastName}`;

    // TODO: Integrate email service here if available
    // For now, just mark as sent
    return {
      success: true,
      message: `Lohnabrechnung an ${name} versendet`,
      sendDate: new Date().toISOString(),
    };
  }

  // ==========================================
  // PAYSLIPS — List
  // ==========================================
  async findAllPayslips(companyId: string, query: {
    page?: number; pageSize?: number; employeeId?: string; period?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { employee: { companyId } };
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.period) {
      const { year, month } = parsePeriod(query.period);
      if (year) where.year = year;
      if (month) where.month = month;
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
      paymentDate: ps.paymentDate?.toISOString() || null,
      createdAt: ps.createdAt.toISOString(),
    }));

    return { data: mapped, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ==========================================
  // PAYSLIPS — CRUD
  // ==========================================
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

  /**
   * DELETE /payroll/:id — Delete a PayrollRun with all payslips
   */
  async removeRun(id: string, companyId: string) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id, companyId },
      include: { payslips: { select: { id: true } } },
    });

    if (!run) {
      throw new NotFoundException('Lohnlauf nicht gefunden');
    }

    // Atomic deletion: items → payslips → run
    const payslipIds = run.payslips.map(ps => ps.id);
    await this.prisma.$transaction(async (tx) => {
      if (payslipIds.length > 0) {
        await tx.payslipItem.deleteMany({ where: { payslipId: { in: payslipIds } } });
        await tx.payslip.deleteMany({ where: { payrollRunId: id } });
      }
      await tx.payrollRun.delete({ where: { id } });
    });

    return { success: true, message: `Lohnlauf ${periodLabel(run.period)} gelöscht` };
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  /**
   * Maps a Payslip (with employee + items) for the PayrollRun detail page
   */
  private mapPayslipDetail(payslip: any, company: any, companyAddress: string) {
    const emp = payslip.employee || {};
    const items = payslip.items || [];
    const gross = Number(payslip.grossSalary || 0);
    const net = Number(payslip.netSalary || 0);

    const earnings = items
      .filter((i: any) => i.category === 'EARNING')
      .map((i: any) => ({ description: i.description, amount: Number(i.amount), type: i.type }));
    const deductions = items
      .filter((i: any) => i.category === 'DEDUCTION')
      .map((i: any) => ({ description: i.description, amount: Number(i.amount), rate: i.rate ? Number(i.rate) : null, type: i.type }));

    return {
      id: payslip.id,
      employeeId: payslip.employeeId,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unbekannt',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      position: emp.position || '',
      department: emp.department?.name || '',
      ahvNumber: emp.ahvNumber || '',
      grossSalary: gross,
      netSalary: net,
      bruttoLohn: gross,
      nettoLohn: net,
      ahvIvEo: this.sumItemsByType(items, ['ahv', 'social', 'ahv_iv_eo']) || round2(gross * RATES.AHV_IV_EO / 100),
      alv: this.sumItemsByType(items, ['alv', 'unemployment']) || round2(gross * RATES.ALV / 100),
      bvg: this.sumItemsByType(items, ['bvg', 'pension']) || round2(gross * RATES.BVG / 100),
      nbuKtg: this.sumItemsByType(items, ['nbu', 'ktg', 'insurance', 'accident']) || round2(gross * (RATES.NBU + RATES.KTG) / 100),
      quellensteuer: this.sumItemsByType(items, ['quellensteuer', 'tax', 'withholding']) || 0,
      status: PAYSLIP_STATUS_MAP[payslip.status] || payslip.status,
      year: payslip.year,
      month: payslip.month,
      earnings,
      deductions,
      bankAccount: {
        iban: emp.iban || '',
        bank: '',
      },
      employer: {
        name: company.legalName || company.name || '',
        address: companyAddress,
      },
    };
  }

  /**
   * Maps a Payslip for the Payroll overview list (data array)
   */
  private mapPayslipToFrontend(payslip: any) {
    const items = payslip.items || [];
    const gross = Number(payslip.grossSalary || 0);
    const emp = payslip.employee || {};
    const firstName = emp.firstName || '';
    const lastName = emp.lastName || '';
    return {
      id: payslip.id,
      employeeId: payslip.employeeId,
      name: `${firstName} ${lastName}`.trim() || 'Unbekannt',
      firstName,
      lastName,
      position: emp.position || '',
      role: emp.position || '',
      bruttoLohn: gross,
      nettoLohn: Number(payslip.netSalary || 0),
      ahvIvEo: this.sumItemsByType(items, ['ahv', 'social', 'ahv_iv_eo']) || round2(gross * RATES.AHV_IV_EO / 100),
      alv: this.sumItemsByType(items, ['alv', 'unemployment']) || round2(gross * RATES.ALV / 100),
      bvg: this.sumItemsByType(items, ['bvg', 'pension']) || round2(gross * RATES.BVG / 100),
      nbuKtg: this.sumItemsByType(items, ['nbu', 'ktg', 'insurance', 'accident']) || round2(gross * (RATES.NBU + RATES.KTG) / 100),
      quellensteuer: this.sumItemsByType(items, ['quellensteuer', 'tax', 'withholding']) || 0,
      status: PAYSLIP_STATUS_MAP[payslip.status] || payslip.status,
      year: payslip.year,
      month: payslip.month,
    };
  }

  private sumItemsByType(items: any[], typeKeywords: string[]): number {
    const sum = items
      .filter((item: any) =>
        item.category === 'DEDUCTION' &&
        typeKeywords.some(kw => (item.type || '').toLowerCase().includes(kw))
      )
      .reduce((s: number, item: any) => s + Math.abs(Number(item.amount)), 0);
    return round2(sum);
  }
}
