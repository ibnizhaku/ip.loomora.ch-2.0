import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateAccountDto, 
  UpdateAccountDto, 
  CreateBankAccountDto, 
  UpdateBankAccountDto 
} from './dto/finance.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AccountType } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // =====================
  // CHART OF ACCOUNTS
  // =====================

  async findAllAccounts(companyId: string, query: PaginationDto & { type?: string }) {
    const { page = 1, pageSize = 100, search, sortBy = 'number', sortOrder = 'asc', type } = query;
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
      this.prisma.account.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          parent: { select: { id: true, number: true, name: true } },
          _count: { select: { journalEntries: true } },
        },
      }),
      this.prisma.account.count({ where }),
    ]);

    // Calculate balances from journal entries
    const enrichedData = await Promise.all(
      data.map(async (account) => {
        const balance = await this.calculateAccountBalance(account.id);
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
    const account = await this.prisma.account.findFirst({
      where: { id, companyId },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const balance = await this.calculateAccountBalance(id);
    return { ...account, balance };
  }

  async createAccount(companyId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async updateAccount(id: string, companyId: string, dto: UpdateAccountDto) {
    const account = await this.prisma.account.findFirst({
      where: { id, companyId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  private async calculateAccountBalance(accountId: string): Promise<number> {
    const result = await this.prisma.journalEntry.aggregate({
      where: { accountId },
      _sum: { debit: true, credit: true },
    });

    const debit = result._sum.debit || 0;
    const credit = result._sum.credit || 0;

    // For ASSET and EXPENSE: balance = debit - credit
    // For LIABILITY, EQUITY, REVENUE: balance = credit - debit
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return 0;

    if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
      return debit - credit;
    }
    return credit - debit;
  }

  // =====================
  // BANK ACCOUNTS
  // =====================

  async findAllBankAccounts(companyId: string) {
    return this.prisma.bankAccount.findMany({
      where: { companyId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      include: {
        _count: { select: { transactions: true } },
      },
    });
  }

  async findOneBankAccount(id: string, companyId: string) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, companyId },
      include: {
        transactions: {
          take: 20,
          orderBy: { transactionDate: 'desc' },
        },
      },
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return bankAccount;
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
    const accounts = await this.prisma.account.findMany({
      where: { companyId, isActive: true },
    });

    const balances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await this.calculateAccountBalance(account.id);
        return { ...account, balance };
      }),
    );

    const assets = balances.filter((a) => a.type === AccountType.ASSET);
    const liabilities = balances.filter((a) => a.type === AccountType.LIABILITY);
    const equity = balances.filter((a) => a.type === AccountType.EQUITY);

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0);

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

    const accounts = await this.prisma.account.findMany({
      where: { ...where, type: { in: [AccountType.REVENUE, AccountType.EXPENSE] } },
    });

    const balances = await Promise.all(
      accounts.map(async (account) => {
        const journalWhere: any = { accountId: account.id };
        if (startDate) journalWhere.date = { gte: startDate };
        if (endDate) journalWhere.date = { ...journalWhere.date, lte: endDate };

        const result = await this.prisma.journalEntry.aggregate({
          where: journalWhere,
          _sum: { debit: true, credit: true },
        });

        const debit = result._sum.debit || 0;
        const credit = result._sum.credit || 0;
        const balance = account.type === AccountType.EXPENSE ? debit - credit : credit - debit;

        return { ...account, balance };
      }),
    );

    const revenue = balances.filter((a) => a.type === AccountType.REVENUE);
    const expenses = balances.filter((a) => a.type === AccountType.EXPENSE);

    const totalRevenue = revenue.reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
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
}
