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
          orderBy: { bookingDate: 'desc' },
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
}
