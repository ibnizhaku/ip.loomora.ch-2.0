import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto, BudgetStatus, BudgetPeriod } from './dto/budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    year?: number;
    period?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, year, period, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (year) where.year = year;
    if (period) where.period = period;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.budget.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        include: {
          _count: { select: { lines: true } },
        },
      }),
      this.prisma.budget.count({ where }),
    ]);

    return {
      data: data.map((b: any) => this.mapBudget(b)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** Berechnet startDate, endDate und totalBudget für Frontend-Kompatibilität */
  private mapBudget(b: any) {
    let startDate: string;
    let endDate: string;
    if (b.period === 'YEARLY') {
      startDate = `${b.year}-01-01`;
      endDate   = `${b.year}-12-31`;
    } else if (b.period === 'QUARTERLY' && b.quarter) {
      const startMonth = (b.quarter - 1) * 3 + 1;
      const endMonth   = startMonth + 2;
      startDate = `${b.year}-${String(startMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(b.year, endMonth, 0).getDate();
      endDate   = `${b.year}-${String(endMonth).padStart(2, '0')}-${lastDay}`;
    } else if (b.period === 'MONTHLY' && b.month) {
      startDate = `${b.year}-${String(b.month).padStart(2, '0')}-01`;
      const lastDay = new Date(b.year, b.month, 0).getDate();
      endDate   = `${b.year}-${String(b.month).padStart(2, '0')}-${lastDay}`;
    } else {
      startDate = `${b.year}-01-01`;
      endDate   = `${b.year}-12-31`;
    }
    const totalBudget = Number(b.totalAmount || 0);
    return { ...b, startDate, endDate, totalBudget };
  }

  async findOne(id: string, companyId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, companyId },
      include: {
        lines: {
          include: {
            account: { select: { id: true, number: true, name: true, type: true } },
            costCenter: { select: { id: true, number: true, name: true } },
          },
          orderBy: { account: { number: 'asc' } },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget nicht gefunden');
    }

    // Calculate totals
    const totalBudget = budget.lines.reduce((sum, l) => sum + Number(l.amount), 0);

    return {
      ...budget,
      totalBudget,
    };
  }

  async create(companyId: string, dto: CreateBudgetDto) {
    // Generate number
    const count = await this.prisma.budget.count({ where: { companyId, year: dto.year } });
    const number = `BUD-${dto.year}-${String(count + 1).padStart(3, '0')}`;

    // Validate accounts
    const accountIds = [...new Set(dto.lines.map(l => l.accountId))];
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { id: { in: accountIds }, companyId },
    });
    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('Ein oder mehrere Konten nicht gefunden');
    }

    const totalAmount = dto.lines.reduce((sum, l) => sum + l.amount, 0);

    return this.prisma.budget.create({
      data: {
        companyId,
        number,
        name: dto.name,
        description: dto.description,
        period: dto.period,
        year: dto.year,
        quarter: dto.quarter,
        month: dto.month,
        status: BudgetStatus.DRAFT,
        totalAmount,
        lines: {
          create: dto.lines.map((line) => ({
            accountId: line.accountId,
            costCenterId: line.costCenterId,
            amount: line.amount,
            notes: line.notes,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: { select: { id: true, number: true, name: true } },
          },
        },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateBudgetDto) {
    const budget = await this.findOne(id, companyId);

    if (budget.status === BudgetStatus.CLOSED) {
      throw new BadRequestException('Geschlossenes Budget kann nicht bearbeitet werden');
    }

    // Update lines if provided
    if (dto.lines) {
      await this.prisma.budgetLine.deleteMany({ where: { budgetId: id } });
      
      await this.prisma.budgetLine.createMany({
        data: dto.lines.map((line) => ({
          budgetId: id,
          accountId: line.accountId,
          costCenterId: line.costCenterId,
          amount: line.amount,
          notes: line.notes,
        })),
      });
    }

    const totalAmount = dto.lines?.reduce((sum, l) => sum + l.amount, 0) || budget.totalBudget;

    return this.prisma.budget.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        totalAmount,
      },
      include: {
        lines: {
          include: {
            account: { select: { id: true, number: true, name: true } },
          },
        },
      },
    });
  }

  async approve(id: string, companyId: string) {
    const budget = await this.findOne(id, companyId);

    if (budget.status !== BudgetStatus.DRAFT) {
      throw new BadRequestException('Nur Entwürfe können genehmigt werden');
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        status: BudgetStatus.APPROVED,
        approvedAt: new Date(),
      },
    });
  }

  async activate(id: string, companyId: string) {
    const budget = await this.findOne(id, companyId);

    if (budget.status !== BudgetStatus.APPROVED) {
      throw new BadRequestException('Nur genehmigte Budgets können aktiviert werden');
    }

    return this.prisma.budget.update({
      where: { id },
      data: { status: BudgetStatus.ACTIVE },
    });
  }

  async delete(id: string, companyId: string) {
    const budget = await this.findOne(id, companyId);

    if (budget.status !== BudgetStatus.DRAFT) {
      throw new BadRequestException('Nur Entwürfe können gelöscht werden');
    }

    return this.prisma.budget.delete({ where: { id } });
  }

  // Budget vs Actual comparison
  async getComparison(companyId: string, params: {
    budgetId: string;
    includeDetails?: boolean;
  }) {
    const budget = await this.findOne(params.budgetId, companyId);

    // Determine date range based on budget period
    let startDate: Date;
    let endDate: Date;
    
    if (budget.period === BudgetPeriod.YEARLY) {
      startDate = new Date(`${budget.year}-01-01`);
      endDate = new Date(`${budget.year}-12-31`);
    } else if (budget.period === BudgetPeriod.QUARTERLY) {
      const startMonth = (budget.quarter! - 1) * 3 + 1;
      startDate = new Date(`${budget.year}-${String(startMonth).padStart(2, '0')}-01`);
      endDate = new Date(budget.year, startMonth + 2, 0); // Last day of quarter
    } else {
      startDate = new Date(`${budget.year}-${String(budget.month).padStart(2, '0')}-01`);
      endDate = new Date(budget.year, budget.month!, 0); // Last day of month
    }

    // Get actual amounts from journal entries
    const comparison = await Promise.all(
      budget.lines.map(async (line) => {
        const where: any = {
          accountId: line.accountId,
          journalEntry: {
            companyId,
            status: 'POSTED',
            date: { gte: startDate, lte: endDate },
          },
        };
        if (line.costCenterId) {
          where.costCenterId = line.costCenterId;
        }

        const result = await this.prisma.journalLine.aggregate({
          where,
          _sum: { debit: true, credit: true },
        });

        const actualDebit = Number(result._sum.debit || 0);
        const actualCredit = Number(result._sum.credit || 0);
        const actual = actualDebit - actualCredit;
        const budgetAmount = Number(line.amount);
        const variance = budgetAmount - actual;
        const variancePercent = budgetAmount !== 0 ? (variance / budgetAmount * 100) : 0;

        return {
          account: line.account,
          costCenter: line.costCenter,
          budgetAmount,
          actualAmount: actual,
          variance,
          variancePercent: variancePercent.toFixed(1),
          status: variance >= 0 ? 'UNDER_BUDGET' : 'OVER_BUDGET',
        };
      })
    );

    // Calculate totals
    const totals = comparison.reduce(
      (acc, item) => ({
        budgetTotal: acc.budgetTotal + item.budgetAmount,
        actualTotal: acc.actualTotal + item.actualAmount,
      }),
      { budgetTotal: 0, actualTotal: 0 }
    );

    return {
      budget: {
        id: budget.id,
        name: budget.name,
        period: budget.period,
        year: budget.year,
        quarter: budget.quarter,
        month: budget.month,
      },
      dateRange: { startDate, endDate },
      lines: comparison,
      totals: {
        ...totals,
        variance: totals.budgetTotal - totals.actualTotal,
        variancePercent: totals.budgetTotal !== 0 
          ? ((totals.budgetTotal - totals.actualTotal) / totals.budgetTotal * 100).toFixed(1)
          : '0',
      },
    };
  }
}
