import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateCashTransactionDto, 
  UpdateCashTransactionDto, 
  CashTransactionType,
  CashBookClosingDto,
  CreateCashRegisterDto 
} from './dto/cash-book.dto';

@Injectable()
export class CashBookService {
  constructor(private prisma: PrismaService) {}

  // Swiss VAT rates
  private readonly VAT_RATES = {
    STANDARD: 0.081,
    REDUCED: 0.026,
    SPECIAL: 0.038,
    EXEMPT: 0,
  };

  // Cash Registers
  async findAllRegisters(companyId: string) {
    return this.prisma.cashRegister.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async createRegister(companyId: string, dto: CreateCashRegisterDto) {
    // If default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.cashRegister.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.cashRegister.create({
      data: {
        companyId,
        name: dto.name,
        location: dto.location,
        currentBalance: dto.openingBalance,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  // Cash Transactions
  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    registerId?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 50, registerId, startDate, endDate, type, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (registerId) where.cashRegisterId = registerId;
    if (type) where.type = type;
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

    const [data, total] = await Promise.all([
      this.prisma.cashTransaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ date: 'desc' }, { number: 'desc' }],
        include: {
          cashRegister: { select: { id: true, name: true } },
          account: { select: { id: true, number: true, name: true } },
          costCenter: { select: { id: true, number: true, name: true } },
        },
      }),
      this.prisma.cashTransaction.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const transaction = await this.prisma.cashTransaction.findFirst({
      where: { id, companyId },
      include: {
        cashRegister: { select: { id: true, name: true } },
        account: { select: { id: true, number: true, name: true } },
        costCenter: { select: { id: true, number: true, name: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Kassenbuchung nicht gefunden');
    }

    return transaction;
  }

  async create(companyId: string, registerId: string, dto: CreateCashTransactionDto) {
    // Validate register
    const register = await this.prisma.cashRegister.findFirst({
      where: { id: registerId, companyId },
    });
    if (!register) throw new NotFoundException('Kasse nicht gefunden');

    // Generate number
    const year = new Date(dto.date).getFullYear();
    const count = await this.prisma.cashTransaction.count({
      where: { 
        companyId,
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });
    const number = `KB-${year}-${String(count + 1).padStart(5, '0')}`;

    // Calculate VAT if provided
    let vatAmount = dto.vatAmount;
    if (!vatAmount && dto.vatRate && dto.vatRate !== 'EXEMPT') {
      const rate = this.VAT_RATES[dto.vatRate as keyof typeof this.VAT_RATES] || 0;
      vatAmount = dto.amount * rate / (1 + rate); // Extract VAT from gross amount
    }

    // Calculate balance change
    const balanceChange = dto.type === CashTransactionType.RECEIPT 
      ? dto.amount 
      : -dto.amount;

    const transaction = await this.prisma.cashTransaction.create({
      data: {
        companyId,
        cashRegisterId: registerId,
        number,
        date: new Date(dto.date),
        type: dto.type,
        amount: dto.amount,
        description: dto.description,
        reference: dto.reference,
        accountId: dto.accountId,
        costCenterId: dto.costCenterId,
        category: dto.category,
        vatRate: dto.vatRate,
        vatAmount: vatAmount || 0,
        balanceAfter: Number(register.currentBalance) + balanceChange,
      },
    });

    // Update register balance
    await this.prisma.cashRegister.update({
      where: { id: registerId },
      data: {
        currentBalance: { increment: balanceChange },
      },
    });

    return transaction;
  }

  async update(id: string, companyId: string, dto: UpdateCashTransactionDto) {
    const transaction = await this.findOne(id, companyId);

    if (transaction.isPosted) {
      throw new BadRequestException('Gebuchte Transaktion kann nicht bearbeitet werden');
    }

    // If amount changed, recalculate balance
    if (dto.amount !== undefined && dto.amount !== Number(transaction.amount)) {
      const oldChange = transaction.type === CashTransactionType.RECEIPT 
        ? Number(transaction.amount) 
        : -Number(transaction.amount);
      const newChange = transaction.type === CashTransactionType.RECEIPT 
        ? dto.amount 
        : -dto.amount;
      const balanceDiff = newChange - oldChange;

      await this.prisma.cashRegister.update({
        where: { id: transaction.cashRegisterId },
        data: {
          currentBalance: { increment: balanceDiff },
        },
      });
    }

    return this.prisma.cashTransaction.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        amount: dto.amount,
        description: dto.description,
        reference: dto.reference,
        accountId: dto.accountId,
        costCenterId: dto.costCenterId,
        category: dto.category,
        vatRate: dto.vatRate,
        vatAmount: dto.vatAmount,
      },
    });
  }

  async delete(id: string, companyId: string) {
    const transaction = await this.findOne(id, companyId);

    if (transaction.isPosted) {
      throw new BadRequestException('Gebuchte Transaktion kann nicht gelöscht werden');
    }

    // Reverse balance change
    const balanceChange = transaction.type === CashTransactionType.RECEIPT 
      ? -Number(transaction.amount) 
      : Number(transaction.amount);

    await this.prisma.cashRegister.update({
      where: { id: transaction.cashRegisterId },
      data: {
        currentBalance: { increment: balanceChange },
      },
    });

    return this.prisma.cashTransaction.delete({ where: { id } });
  }

  // Daily closing
  async performClosing(companyId: string, registerId: string, dto: CashBookClosingDto) {
    const register = await this.prisma.cashRegister.findFirst({
      where: { id: registerId, companyId },
    });
    if (!register) throw new NotFoundException('Kasse nicht gefunden');

    const systemBalance = Number(register.currentBalance);
    const difference = dto.countedAmount - systemBalance;

    // Create closing entry
    const year = new Date(dto.date).getFullYear();
    const count = await this.prisma.cashTransaction.count({
      where: { companyId, date: { gte: new Date(`${year}-01-01`) } },
    });
    const number = `KB-${year}-${String(count + 1).padStart(5, '0')}`;

    const closing = await this.prisma.cashClosing.create({
      data: {
        companyId,
        cashRegisterId: registerId,
        date: new Date(dto.date),
        systemBalance,
        countedAmount: dto.countedAmount,
        difference,
        notes: dto.notes,
      },
    });

    // If there's a difference, create adjustment transaction
    if (Math.abs(difference) > 0.01) {
      await this.prisma.cashTransaction.create({
        data: {
          companyId,
          cashRegisterId: registerId,
          number: `${number}-ADJ`,
          date: new Date(dto.date),
          type: difference > 0 ? CashTransactionType.RECEIPT : CashTransactionType.PAYMENT,
          amount: Math.abs(difference),
          description: `Kassendifferenz vom ${new Date(dto.date).toLocaleDateString('de-CH')}`,
          category: 'ADJUSTMENT',
          balanceAfter: dto.countedAmount,
          isPosted: true,
        },
      });

      await this.prisma.cashRegister.update({
        where: { id: registerId },
        data: { currentBalance: dto.countedAmount },
      });
    }

    // Mark all transactions for the day as posted
    await this.prisma.cashTransaction.updateMany({
      where: {
        cashRegisterId: registerId,
        date: {
          gte: new Date(new Date(dto.date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(dto.date).setHours(23, 59, 59, 999)),
        },
        isPosted: false,
      },
      data: { isPosted: true },
    });

    return {
      closing,
      systemBalance,
      countedAmount: dto.countedAmount,
      difference,
      adjustmentCreated: Math.abs(difference) > 0.01,
    };
  }

  // Get daily summary
  async getDailySummary(companyId: string, registerId: string, date: string) {
    const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

    const transactions = await this.prisma.cashTransaction.findMany({
      where: {
        companyId,
        cashRegisterId: registerId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { createdAt: 'asc' },
    });

    const receipts = transactions.filter(t => t.type === CashTransactionType.RECEIPT);
    const payments = transactions.filter(t => t.type === CashTransactionType.PAYMENT);

    const totalReceipts = receipts.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalPayments = payments.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalVat = transactions.reduce((sum, t) => sum + Number(t.vatAmount || 0), 0);

    // Get opening balance (from previous day's closing or register creation)
    const previousClosing = await this.prisma.cashClosing.findFirst({
      where: {
        cashRegisterId: registerId,
        date: { lt: startOfDay },
      },
      orderBy: { date: 'desc' },
    });

    const openingBalance = previousClosing 
      ? Number(previousClosing.countedAmount) 
      : (transactions.length > 0 ? Number(transactions[0].balanceAfter) - (transactions[0].type === CashTransactionType.RECEIPT ? Number(transactions[0].amount) : -Number(transactions[0].amount)) : 0);

    return {
      date,
      openingBalance,
      totalReceipts,
      totalPayments,
      netChange: totalReceipts - totalPayments,
      closingBalance: openingBalance + totalReceipts - totalPayments,
      transactionCount: transactions.length,
      totalVat,
      byCategory: this.groupByCategory(transactions),
    };
  }

  private groupByCategory(transactions: any[]) {
    const grouped: Record<string, { receipts: number; payments: number }> = {};
    
    transactions.forEach(t => {
      const category = t.category || 'Sonstige';
      if (!grouped[category]) {
        grouped[category] = { receipts: 0, payments: 0 };
      }
      if (t.type === CashTransactionType.RECEIPT) {
        grouped[category].receipts += Number(t.amount);
      } else {
        grouped[category].payments += Number(t.amount);
      }
    });

    return Object.entries(grouped).map(([category, amounts]) => ({
      category,
      ...amounts,
      net: amounts.receipts - amounts.payments,
    }));
  }
}
