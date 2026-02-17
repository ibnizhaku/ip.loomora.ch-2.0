import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateAccountDto, 
  UpdateAccountDto, 
  CreateBankAccountDto, 
  UpdateBankAccountDto,
  AccountType,
} from './dto/finance.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // =====================
  // CHART OF ACCOUNTS
  // =====================

  async findAllAccounts(companyId: string, query: PaginationDto & { type?: string }) {
    const { page: rawPage = 1, pageSize: rawPageSize = 100, search, sortBy = 'number', sortOrder = 'asc', type } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 100;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      this.prisma.chartOfAccount.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          parent: { select: { id: true, number: true, name: true } },
        },
      }),
      this.prisma.chartOfAccount.count({ where }),
    ]);

    // Calculate balances from journal entries
    const enrichedData = await Promise.all(
      data.map(async (account: any) => {
        const balance = await this.calculateAccountBalance(account.id, account.type);
        return { ...account, balance };
      }),
    );

    return {
      data: enrichedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneAccount(id: string, companyId: string) {
    const account = await this.prisma.chartOfAccount.findFirst({
      where: { id, companyId },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const balance = await this.calculateAccountBalance(id, account.type);
    return { ...account, balance };
  }

  async createAccount(companyId: string, dto: CreateAccountDto) {
    return this.prisma.chartOfAccount.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async updateAccount(id: string, companyId: string, dto: UpdateAccountDto) {
    const account = await this.prisma.chartOfAccount.findFirst({
      where: { id, companyId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.prisma.chartOfAccount.update({
      where: { id },
      data: dto,
    });
  }

  private async calculateAccountBalance(accountId: string, accountType: string): Promise<number> {
    // Get journal lines for this account
    const result = await this.prisma.journalLine.aggregate({
      where: { accountId },
      _sum: { debit: true, credit: true },
    });

    const debit = Number(result._sum?.debit || 0);
    const credit = Number(result._sum?.credit || 0);

    // For ASSET and EXPENSE: balance = debit - credit
    // For LIABILITY, EQUITY, REVENUE: balance = credit - debit
    if (accountType === AccountType.ASSET || accountType === AccountType.EXPENSE) {
      return debit - credit;
    }
    return credit - debit;
  }

  // =====================
  // BANK ACCOUNTS
  // =====================

  async findAllBankAccounts(companyId: string) {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { companyId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      include: {
        _count: { select: { transactions: true } },
      },
    });
    return accounts.map((a: any) => this.mapBankAccount(a));
  }

  private mapBankAccount(a: any) {
    return {
      ...a,
      bank: a.bankName || a.name,
      balance: Number(a.balance),
      type: 'checking' as const,
      lastSync: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('de-CH') : null,
      status: 'active' as const,
    };
  }

  async findOneBankAccount(id: string, companyId: string) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, companyId },
      include: {
        transactions: {
          take: 20,
          orderBy: { bookingDate: 'desc' },
        },
      },
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return this.mapBankAccount(bankAccount);
  }

  async createBankAccount(companyId: string, dto: CreateBankAccountDto) {
    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.bankAccount.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.bankAccount.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async updateBankAccount(id: string, companyId: string, dto: UpdateBankAccountDto) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, companyId },
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    if (dto.isDefault) {
      await this.prisma.bankAccount.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.bankAccount.update({
      where: { id },
      data: dto,
    });
  }

  // =====================
  // FINANCIAL SUMMARIES
  // =====================

  async getBalanceSheet(companyId: string) {
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { companyId, isActive: true },
    });

    const balances = await Promise.all(
      accounts.map(async (account: any) => {
        const balance = await this.calculateAccountBalance(account.id, account.type);
        return { ...account, balance };
      }),
    );

    const assets = balances.filter((a: any) => a.type === AccountType.ASSET);
    const liabilities = balances.filter((a: any) => a.type === AccountType.LIABILITY);
    const equity = balances.filter((a: any) => a.type === AccountType.EQUITY);

    const totalAssets = assets.reduce((sum: number, a: any) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum: number, a: any) => sum + a.balance, 0);
    const totalEquity = equity.reduce((sum: number, a: any) => sum + a.balance, 0);

    return {
      assets,
      liabilities,
      equity,
      totals: {
        assets: totalAssets,
        liabilities: totalLiabilities,
        equity: totalEquity,
        liabilitiesAndEquity: totalLiabilities + totalEquity,
      },
    };
  }

  async getIncomeStatement(companyId: string, startDate?: Date, endDate?: Date) {
    const where: any = { companyId, isActive: true };

    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { ...where, type: { in: [AccountType.REVENUE, AccountType.EXPENSE] } },
    });

    const balances = await Promise.all(
      accounts.map(async (account: any) => {
        const journalWhere: any = { accountId: account.id };
        
        if (startDate || endDate) {
          journalWhere.journalEntry = {};
          if (startDate) journalWhere.journalEntry.date = { gte: startDate };
          if (endDate) journalWhere.journalEntry.date = { ...journalWhere.journalEntry.date, lte: endDate };
        }

        const result = await this.prisma.journalLine.aggregate({
          where: journalWhere,
          _sum: { debit: true, credit: true },
        });

        const debit = Number(result._sum?.debit || 0);
        const credit = Number(result._sum?.credit || 0);
        const balance = account.type === AccountType.EXPENSE ? debit - credit : credit - debit;

        return { ...account, balance };
      }),
    );

    const revenue = balances.filter((a: any) => a.type === AccountType.REVENUE);
    const expenses = balances.filter((a: any) => a.type === AccountType.EXPENSE);

    const totalRevenue = revenue.reduce((sum: number, a: any) => sum + a.balance, 0);
    const totalExpenses = expenses.reduce((sum: number, a: any) => sum + a.balance, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      revenue,
      expenses,
      totals: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netIncome,
      },
    };
  }

  // Recent transactions for Finance Dashboard (/finance root endpoint)
  async getRecentTransactions(companyId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { companyId },
      orderBy: { date: 'desc' },
      take: 20,
      include: {
        customer: { select: { name: true, companyName: true } },
      },
    });

    const purchaseInvoices = await this.prisma.purchaseInvoice.findMany({
      where: { companyId },
      orderBy: { date: 'desc' },
      take: 10,
      include: {
        supplier: { select: { name: true, companyName: true } },
      },
    });

    const incomeItems = invoices.map((inv: any) => ({
      id: inv.id,
      description: `Rechnung ${inv.number}` + (inv.customer ? ` – ${inv.customer.companyName || inv.customer.name}` : ''),
      category: 'Rechnung',
      amount: Number(inv.totalAmount),
      type: 'income' as const,
      date: inv.date ? new Date(inv.date).toLocaleDateString('de-CH') : '',
      status: inv.status === 'PAID' ? 'completed' : 'pending',
    }));

    const expenseItems = purchaseInvoices.map((pi: any) => ({
      id: pi.id,
      description: `Eingangsrechnung ${pi.number}` + (pi.supplier ? ` – ${pi.supplier.companyName || pi.supplier.name}` : ''),
      category: 'Eingangsrechnung',
      amount: Number(pi.totalAmount),
      type: 'expense' as const,
      date: pi.date ? new Date(pi.date).toLocaleDateString('de-CH') : '',
      status: pi.status === 'PAID' ? 'completed' : 'pending',
    }));

    // Merge and sort by date descending, take 20
    const all = [...incomeItems, ...expenseItems].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

    return { data: all };
  }

    // Monthly summary for Finance dashboard chart
  async getMonthlySummary(companyId: string) {
    const months: string[] = [];
    const now = new Date();

    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7)); // "YYYY-MM"
    }

    const result = await Promise.all(
      months.map(async (monthStr) => {
        const [year, month] = monthStr.split('-').map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const [incomeAgg, expenseAgg] = await Promise.all([
          this.prisma.invoice.aggregate({
            where: {
              companyId,
              status: 'PAID',
              updatedAt: { gte: start, lte: end },
            },
            _sum: { totalAmount: true },
          }),
          this.prisma.purchaseInvoice.aggregate({
            where: {
              companyId,
              status: 'PAID',
              updatedAt: { gte: start, lte: end },
            },
            _sum: { totalAmount: true },
          }),
        ]);

        const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

        const income = Number(incomeAgg._sum.totalAmount || 0);
        const expense = Number(expenseAgg._sum.totalAmount || 0);
        return {
          month: monthNames[month - 1],
          income,
          expense,
          profit: income - expense,
        };
      }),
    );

    return result;
  }
}
