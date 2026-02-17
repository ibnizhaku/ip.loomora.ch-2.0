import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateJournalEntryDto, 
  UpdateJournalEntryDto, 
  JournalEntryStatus,
  ReverseJournalEntryDto 
} from './dto/journal-entry.dto';

@Injectable()
export class JournalEntriesService {
  constructor(private prisma: PrismaService) {}

  // Swiss KMU Chart of Accounts (simplified)
  private readonly ACCOUNTS = {
    BANK: '1020',           // Bank
    DEBTORS: '1100',        // Debitoren
    CREDITORS: '2000',      // Kreditoren
    VAT_PAYABLE: '2200',    // Geschuldete MwSt
    REVENUE: '3000',        // Umsatzerlöse
    EXPENSE: '4000',        // Aufwand
  };

  /** Maps raw Prisma entry to frontend-expected field names */
  private mapEntry(entry: any) {
    const totalDebit = entry.lines?.reduce((s: number, l: any) => s + Number(l.debit || 0), 0) ?? Number(entry.totalAmount || 0);
    const totalCredit = entry.lines?.reduce((s: number, l: any) => s + Number(l.credit || 0), 0) ?? Number(entry.totalAmount || 0);
    return {
      ...entry,
      // Field aliases for frontend compatibility
      entryDate: entry.date,
      postingDate: entry.postedAt ?? null,
      totalDebit,
      totalCredit,
      sourceType: entry.documentType ?? null,
      sourceId: entry.documentId ?? null,
      // Map lines for frontend
      lines: entry.lines?.map((l: any) => ({
        ...l,
        accountCode: l.account?.number ?? null,
        accountName: l.account?.name ?? null,
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
      })) ?? [],
    };
  }

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    accountId?: string;
    costCenterId?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, startDate, endDate, accountId, costCenterId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (accountId) {
      where.lines = { some: { accountId } };
    }
    if (costCenterId) {
      where.lines = { some: { costCenterId } };
    }

    const [data, total] = await Promise.all([
      this.prisma.journalEntryExtended.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ date: 'desc' }, { number: 'desc' }],
        include: {
          lines: {
            include: {
              account: { select: { id: true, number: true, name: true } },
              costCenter: { select: { id: true, number: true, name: true } },
            },
          },
        },
      }),
      this.prisma.journalEntryExtended.count({ where }),
    ]);

    return {
      data: data.map((e: any) => this.mapEntry(e)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const entry = await this.prisma.journalEntryExtended.findFirst({
      where: { id, companyId },
      include: {
        lines: {
          include: {
            account: { select: { id: true, number: true, name: true, type: true } },
            costCenter: { select: { id: true, number: true, name: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        reversedBy: true,
        reversesEntry: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Buchung nicht gefunden');
    }

    return this.mapEntry(entry);
  }

  async create(companyId: string, dto: CreateJournalEntryDto) {
    // Validate balance (debits must equal credits)
    const totalDebit = dto.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = dto.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(`Buchung nicht ausgeglichen: Soll ${totalDebit.toFixed(2)} ≠ Haben ${totalCredit.toFixed(2)}`);
    }

    // Validate accounts exist
    const accountIds = [...new Set(dto.lines.map(l => l.accountId))];
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { id: { in: accountIds }, companyId },
    });
    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('Ein oder mehrere Konten nicht gefunden');
    }

    // Generate number
    const year = new Date(dto.date).getFullYear();
    const count = await this.prisma.journalEntryExtended.count({
      where: { 
        companyId,
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });
    const number = `JB-${year}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.journalEntryExtended.create({
      data: {
        companyId,
        number,
        date: new Date(dto.date),
        description: dto.description,
        reference: dto.reference,
        documentType: dto.documentType,
        documentId: dto.documentId,
        status: JournalEntryStatus.DRAFT,
        totalAmount: totalDebit,
        lines: {
          create: dto.lines.map((line, idx) => ({
            accountId: line.accountId,
            debit: line.debit || 0,
            credit: line.credit || 0,
            costCenterId: line.costCenterId,
            description: line.description,
            sortOrder: idx,
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

  async update(id: string, companyId: string, dto: UpdateJournalEntryDto) {
    const entry = await this.findOne(id, companyId);

    if (entry.status !== JournalEntryStatus.DRAFT) {
      throw new BadRequestException('Nur Entwürfe können bearbeitet werden');
    }

    // Validate balance if lines are updated
    if (dto.lines) {
      const totalDebit = dto.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
      const totalCredit = dto.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new BadRequestException(`Buchung nicht ausgeglichen: Soll ${totalDebit.toFixed(2)} ≠ Haben ${totalCredit.toFixed(2)}`);
      }

      // Delete existing lines and create new ones
      await this.prisma.journalLine.deleteMany({ where: { journalEntryId: id } });
      
      await this.prisma.journalLine.createMany({
        data: dto.lines.map((line, idx) => ({
          journalEntryId: id,
          accountId: line.accountId,
          debit: line.debit || 0,
          credit: line.credit || 0,
          costCenterId: line.costCenterId,
          description: line.description,
          sortOrder: idx,
        })),
      });
    }

    return this.prisma.journalEntryExtended.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        description: dto.description,
        reference: dto.reference,
        totalAmount: dto.lines?.reduce((sum, l) => sum + (l.debit || 0), 0),
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

  async post(id: string, companyId: string) {
    const entry = await this.findOne(id, companyId);

    if (entry.status !== JournalEntryStatus.DRAFT) {
      throw new BadRequestException('Nur Entwürfe können verbucht werden');
    }

    return this.prisma.journalEntryExtended.update({
      where: { id },
      data: {
        status: JournalEntryStatus.POSTED,
        postedAt: new Date(),
      },
    });
  }

  async reverse(id: string, companyId: string, dto: ReverseJournalEntryDto) {
    const entry = await this.findOne(id, companyId);

    if (entry.status !== JournalEntryStatus.POSTED) {
      throw new BadRequestException('Nur verbuchte Einträge können storniert werden');
    }

    // Create reversal entry
    const year = new Date(dto.reversalDate).getFullYear();
    const count = await this.prisma.journalEntryExtended.count({
      where: { 
        companyId,
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });
    const number = `JB-${year}-${String(count + 1).padStart(5, '0')}`;

    const reversalEntry = await this.prisma.journalEntryExtended.create({
      data: {
        companyId,
        number,
        date: new Date(dto.reversalDate),
        description: `Storno: ${entry.description}`,
        reference: entry.number,
        documentType: 'REVERSAL',
        reversesEntryId: id,
        status: JournalEntryStatus.POSTED,
        postedAt: new Date(),
        totalAmount: entry.totalAmount,
        lines: {
          create: entry.lines.map((line, idx) => ({
            accountId: line.accountId,
            debit: line.credit, // Swap debit/credit for reversal
            credit: line.debit,
            costCenterId: line.costCenterId,
            description: `Storno: ${line.description || ''}`,
            sortOrder: idx,
          })),
        },
      },
    });

    // Mark original as reversed
    await this.prisma.journalEntryExtended.update({
      where: { id },
      data: { status: JournalEntryStatus.REVERSED },
    });

    return reversalEntry;
  }

  async delete(id: string, companyId: string) {
    const entry = await this.findOne(id, companyId);

    if (entry.status !== JournalEntryStatus.DRAFT) {
      throw new BadRequestException('Nur Entwürfe können gelöscht werden');
    }

    return this.prisma.journalEntryExtended.delete({ where: { id } });
  }

  // Get account balance
  async getAccountBalance(companyId: string, accountId: string, params: {
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {
      journalEntry: { 
        companyId,
        status: JournalEntryStatus.POSTED,
      },
      accountId,
    };
    
    if (params.startDate || params.endDate) {
      where.journalEntry.date = {};
      if (params.startDate) where.journalEntry.date.gte = new Date(params.startDate);
      if (params.endDate) where.journalEntry.date.lte = new Date(params.endDate);
    }

    const result = await this.prisma.journalLine.aggregate({
      where,
      _sum: {
        debit: true,
        credit: true,
      },
    });

    return {
      accountId,
      debitTotal: Number(result._sum.debit || 0),
      creditTotal: Number(result._sum.credit || 0),
      balance: Number(result._sum.debit || 0) - Number(result._sum.credit || 0),
    };
  }

  // Trial Balance (Saldenliste)
  async getTrialBalance(companyId: string, params: {
    startDate: string;
    endDate: string;
  }) {
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { companyId, isActive: true },
      orderBy: { number: 'asc' },
    });

    const balances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await this.getAccountBalance(companyId, account.id, params);
        return {
          account: {
            id: account.id,
            number: account.number,
            name: account.name,
            type: account.type,
          },
          ...balance,
        };
      })
    );

    // Filter out zero balances
    return balances.filter(b => b.debitTotal !== 0 || b.creditTotal !== 0);
  }

  // Helper: Create automatic journal entry for invoice (when sent)
  async createInvoiceJournalEntry(invoice: any, companyId: string, tx?: any) {
    const prisma = tx || this.prisma;

    // Get or create default accounts
    const [debtorAccount, revenueAccount, vatAccount] = await Promise.all([
      prisma.chartOfAccount.findFirst({ where: { companyId, number: this.ACCOUNTS.DEBTORS } }),
      prisma.chartOfAccount.findFirst({ where: { companyId, number: this.ACCOUNTS.REVENUE } }),
      prisma.chartOfAccount.findFirst({ where: { companyId, number: this.ACCOUNTS.VAT_PAYABLE } }),
    ]);

    if (!debtorAccount || !revenueAccount || !vatAccount) {
      // Accounts not configured, skip auto-booking
      return null;
    }

    const year = new Date(invoice.date).getFullYear();
    const count = await prisma.journalEntryExtended.count({
      where: { companyId, date: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    });
    const number = `JB-${year}-${String(count + 1).padStart(5, '0')}`;

    const subtotal = Number(invoice.subtotal);
    const vatAmount = Number(invoice.vatAmount);
    const totalAmount = Number(invoice.totalAmount);

    return prisma.journalEntryExtended.create({
      data: {
        companyId,
        number,
        date: invoice.date || new Date(),
        description: `Rechnung ${invoice.number}`,
        reference: invoice.number,
        documentType: 'INVOICE',
        documentId: invoice.id,
        status: 'POSTED',
        totalAmount,
        postedAt: new Date(),
        lines: {
          create: [
            { accountId: debtorAccount.id, debit: totalAmount, credit: 0, description: `Rechnung ${invoice.number}`, sortOrder: 0 },
            { accountId: revenueAccount.id, debit: 0, credit: subtotal, description: 'Umsatzerlös', sortOrder: 1 },
            { accountId: vatAccount.id, debit: 0, credit: vatAmount, description: 'MwSt 8.1%', sortOrder: 2 },
          ],
        },
      },
    });
  }

  // Helper: Create automatic journal entry for payment
  async createPaymentJournalEntry(payment: any, companyId: string, tx?: any) {
    const prisma = tx || this.prisma;

    const [bankAccount, debtorAccount] = await Promise.all([
      prisma.chartOfAccount.findFirst({ where: { companyId, number: this.ACCOUNTS.BANK } }),
      prisma.chartOfAccount.findFirst({ where: { companyId, number: this.ACCOUNTS.DEBTORS } }),
    ]);

    if (!bankAccount || !debtorAccount) {
      return null;
    }

    const year = new Date(payment.paymentDate).getFullYear();
    const count = await prisma.journalEntryExtended.count({
      where: { companyId, date: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    });
    const number = `JB-${year}-${String(count + 1).padStart(5, '0')}`;

    const amount = Number(payment.amount);

    return prisma.journalEntryExtended.create({
      data: {
        companyId,
        number,
        date: payment.paymentDate || new Date(),
        description: `Zahlungseingang ${payment.number}`,
        reference: payment.reference || payment.number,
        documentType: 'PAYMENT',
        documentId: payment.id,
        status: 'POSTED',
        totalAmount: amount,
        postedAt: new Date(),
        lines: {
          create: [
            { accountId: bankAccount.id, debit: amount, credit: 0, description: `Zahlung ${payment.number}`, sortOrder: 0 },
            { accountId: debtorAccount.id, debit: 0, credit: amount, description: 'Debitorenausgleich', sortOrder: 1 },
          ],
        },
      },
    });
  }
}
