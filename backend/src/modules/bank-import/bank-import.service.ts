import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  ImportCamtFileDto, 
  ReconcileTransactionDto,
  TransactionStatus,
  TransactionType,
  CamtNotification,
  CamtEntry,
  MatchSuggestionDto,
} from './dto/bank-import.dto';
import { PaymentsService } from '../payments/payments.service';
import { PaymentType, PaymentMethod } from '../payments/dto/payment.dto';

@Injectable()
export class BankImportService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) {}

  // Import camt.054 file (Swiss ISO 20022 bank notification)
  async importCamtFile(companyId: string, dto: ImportCamtFileDto) {
    // Verify bank account belongs to company
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id: dto.bankAccountId, companyId },
    });

    if (!bankAccount) {
      throw new NotFoundException('Bankkonto nicht gefunden');
    }

    // Parse XML
    const notification = this.parseCamt054(dto.xmlContent);
    
    // Validate IBAN matches
    if (notification.account.iban !== bankAccount.iban?.replace(/\s/g, '')) {
      throw new BadRequestException(
        `IBAN stimmt nicht überein. Erwartet: ${bankAccount.iban}, Erhalten: ${notification.account.iban}`
      );
    }

    const importedTransactions = [];
    const matchedTransactions = [];

    for (const entry of notification.entries) {
      for (const detail of entry.transactionDetails) {
        // Check for duplicate
        const existingTx = await this.prisma.bankTransaction.findFirst({
          where: {
            companyId,
            bankAccountId: dto.bankAccountId,
            entryReference: entry.entryReference,
          },
        });

        if (existingTx) {
          continue; // Skip duplicate
        }

        // Extract QR reference (26-digit Swiss QR reference)
        const qrReference = this.extractQrReference(detail.creditorReference, detail.remittanceInfo);

        // Create transaction record
        const transaction = await this.prisma.bankTransaction.create({
          data: {
            companyId,
            bankAccountId: dto.bankAccountId,
            entryReference: entry.entryReference,
            type: entry.creditDebitIndicator === 'CRDT' ? TransactionType.CREDIT : TransactionType.DEBIT,
            amount: entry.amount,
            currency: entry.currency,
            bookingDate: new Date(entry.bookingDate),
            valueDate: new Date(entry.valueDate),
            qrReference,
            creditorReference: detail.creditorReference,
            endToEndId: detail.endToEndId,
            remittanceInfo: detail.remittanceInfo,
            debtorName: detail.debtor?.name,
            debtorIban: detail.debtor?.iban,
            creditorName: detail.creditor?.name,
            creditorIban: detail.creditor?.iban,
            status: TransactionStatus.PENDING,
          },
        });

        importedTransactions.push(transaction);

        // Auto-reconcile if enabled
        if (dto.autoReconcile && qrReference) {
          const matchResult = await this.autoMatch(transaction, companyId);
          if (matchResult.matched) {
            matchedTransactions.push({
              transaction,
              invoice: matchResult.invoice,
            });
          }
        }
      }
    }

    return {
      imported: importedTransactions.length,
      matched: matchedTransactions.length,
      transactions: importedTransactions,
      matchedDetails: matchedTransactions,
    };
  }

  // Parse camt.054 XML (simplified parser)
  private parseCamt054(xmlContent: string): CamtNotification {
    // Basic XML parsing - in production use a proper XML parser like xml2js
    const getTagContent = (xml: string, tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
      const match = xml.match(regex);
      return match ? match[1].trim() : '';
    };

    const getAllMatches = (xml: string, tag: string): string[] => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
      const matches = [];
      let match;
      while ((match = regex.exec(xml)) !== null) {
        matches.push(match[1]);
      }
      return matches;
    };

    // Extract header info
    const messageId = getTagContent(xmlContent, 'MsgId');
    const creationDateTime = getTagContent(xmlContent, 'CreDtTm');
    const iban = getTagContent(xmlContent, 'IBAN');
    const currency = getTagContent(xmlContent, 'Ccy') || 'CHF';

    // Extract entries
    const entryBlocks = getAllMatches(xmlContent, 'Ntry');
    const entries: CamtEntry[] = entryBlocks.map(entryXml => {
      const amount = parseFloat(getTagContent(entryXml, 'Amt')) || 0;
      const creditDebit = getTagContent(entryXml, 'CdtDbtInd') as 'CRDT' | 'DBIT';
      const bookingDate = getTagContent(entryXml, 'BookgDt') || getTagContent(entryXml, 'Dt');
      const valueDate = getTagContent(entryXml, 'ValDt') || bookingDate;
      const entryReference = getTagContent(entryXml, 'NtryRef') || getTagContent(entryXml, 'AcctSvcrRef');

      // Extract transaction details
      const txDetailBlocks = getAllMatches(entryXml, 'TxDtls');
      const transactionDetails = txDetailBlocks.map(txXml => ({
        endToEndId: getTagContent(txXml, 'EndToEndId'),
        creditorReference: getTagContent(txXml, 'Ref') || getTagContent(txXml, 'CdtrRef'),
        remittanceInfo: getTagContent(txXml, 'Ustrd'),
        debtor: {
          name: getTagContent(txXml, 'Dbtr') ? getTagContent(getAllMatches(txXml, 'Dbtr')[0] || '', 'Nm') : undefined,
          iban: getTagContent(txXml, 'DbtrAcct') ? getTagContent(getAllMatches(txXml, 'DbtrAcct')[0] || '', 'IBAN') : undefined,
        },
        creditor: {
          name: getTagContent(txXml, 'Cdtr') ? getTagContent(getAllMatches(txXml, 'Cdtr')[0] || '', 'Nm') : undefined,
          iban: getTagContent(txXml, 'CdtrAcct') ? getTagContent(getAllMatches(txXml, 'CdtrAcct')[0] || '', 'IBAN') : undefined,
        },
      }));

      return {
        entryReference,
        amount,
        currency,
        creditDebitIndicator: creditDebit,
        status: getTagContent(entryXml, 'Sts'),
        bookingDate,
        valueDate,
        transactionDetails: transactionDetails.length > 0 ? transactionDetails : [{}],
      };
    });

    return {
      messageId,
      creationDateTime,
      account: { iban, currency },
      entries,
    };
  }

  // Extract Swiss QR reference (26 digits)
  private extractQrReference(creditorRef?: string, remittanceInfo?: string): string | null {
    // Swiss QR reference is 26 or 27 digits
    const qrPattern = /\b(\d{26,27})\b/;
    
    if (creditorRef) {
      const match = creditorRef.match(qrPattern);
      if (match) return match[1];
    }
    
    if (remittanceInfo) {
      const match = remittanceInfo.match(qrPattern);
      if (match) return match[1];
    }
    
    return null;
  }

  // Auto-match transaction with invoice
  private async autoMatch(transaction: any, companyId: string) {
    if (!transaction.qrReference) {
      return { matched: false };
    }

    // Find invoice by QR reference
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        companyId,
        qrReference: transaction.qrReference,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
      },
      include: { customer: true },
    });

    if (!invoice) {
      return { matched: false };
    }

    // Verify amount matches (with small tolerance for bank fees)
    const invoiceAmount = Number(invoice.totalAmount);
    const tolerance = 0.05; // 5 Rappen tolerance
    
    if (Math.abs(transaction.amount - invoiceAmount) > tolerance) {
      // Amount mismatch - mark as partial match
      await this.prisma.bankTransaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.MATCHED,
          matchedInvoiceId: invoice.id,
        },
      });
      return { matched: true, invoice, partial: true };
    }

    // Perfect match - create payment and reconcile
    const payment = await this.paymentsService.create(companyId, {
      type: PaymentType.INCOMING,
      amount: Number(transaction.amount),
      method: PaymentMethod.BANK_TRANSFER,
      invoiceId: invoice.id,
      bankAccountId: transaction.bankAccountId,
      paymentDate: transaction.bookingDate,
      qrReference: transaction.qrReference ?? undefined,
      reference: transaction.entryReference ?? undefined,
      notes: `Automatisch abgeglichen via camt.054 Import`,
    });

    await this.prisma.bankTransaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.RECONCILED,
        matchedInvoiceId: invoice.id,
        matchedPaymentId: payment.id,
      },
    });

    return { matched: true, invoice, payment };
  }

  // Get all transactions for a bank account
  async findAll(companyId: string, params: {
    bankAccountId?: string;
    status?: TransactionStatus;
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { bankAccountId, status, type, startDate, endDate, page = 1, pageSize = 50 } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (bankAccountId) where.bankAccountId = bankAccountId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) where.bookingDate.gte = new Date(startDate);
      if (endDate) where.bookingDate.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.bankTransaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { bookingDate: 'desc' },
        include: {
          bankAccount: { select: { id: true, name: true, iban: true } },
          matchedInvoice: { select: { id: true, number: true, totalAmount: true } },
          matchedPayment: { select: { id: true, number: true, amount: true } },
        },
      }),
      this.prisma.bankTransaction.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Get match suggestions for a transaction
  async getMatchSuggestions(transactionId: string, companyId: string): Promise<MatchSuggestionDto[]> {
    const transaction = await this.prisma.bankTransaction.findFirst({
      where: { id: transactionId, companyId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaktion nicht gefunden');
    }

    const suggestions: MatchSuggestionDto[] = [];

    // Strategy 1: Match by QR reference (highest confidence)
    if (transaction.qrReference) {
      const invoice = await this.prisma.invoice.findFirst({
        where: { companyId, qrReference: transaction.qrReference },
        include: { customer: true },
      });

      if (invoice) {
        suggestions.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          customerName: invoice.customer?.name || 'Unbekannt',
          amount: Number(invoice.totalAmount),
          confidence: 100,
          matchReason: 'QR-Referenz stimmt exakt überein',
        });
      }
    }

    // Strategy 2: Match by amount and debtor name
    if (transaction.debtorName) {
      const txAmount = Number(transaction.amount);
      const invoices = await this.prisma.invoice.findMany({
        where: {
          companyId,
          status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
          totalAmount: {
            gte: txAmount - 0.05,
            lte: txAmount + 0.05,
          },
          customer: {
            name: { contains: transaction.debtorName.split(' ')[0], mode: 'insensitive' },
          },
        },
        include: { customer: true },
        take: 5,
      });

      for (const invoice of invoices) {
        if (!suggestions.find(s => s.invoiceId === invoice.id)) {
          suggestions.push({
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            customerName: invoice.customer?.name || 'Unbekannt',
            amount: Number(invoice.totalAmount),
            confidence: 75,
            matchReason: 'Betrag und Kundenname stimmen überein',
          });
        }
      }
    }

    // Strategy 3: Match by amount only
    const txAmountForMatch = Number(transaction.amount);
    const amountMatches = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        totalAmount: {
          gte: txAmountForMatch - 0.01,
          lte: txAmountForMatch + 0.01,
        },
      },
      include: { customer: true },
      take: 10,
    });

    for (const invoice of amountMatches) {
      if (!suggestions.find(s => s.invoiceId === invoice.id)) {
        suggestions.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          customerName: invoice.customer?.name || 'Unbekannt',
          amount: Number(invoice.totalAmount),
          confidence: 50,
          matchReason: 'Betrag stimmt überein',
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Manually reconcile a transaction
  async reconcile(companyId: string, dto: ReconcileTransactionDto) {
    const transaction = await this.prisma.bankTransaction.findFirst({
      where: { id: dto.transactionId, companyId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaktion nicht gefunden');
    }

    if (transaction.status === TransactionStatus.RECONCILED) {
      throw new BadRequestException('Transaktion ist bereits abgeglichen');
    }

    let payment = null;

    // Create payment if requested
    if (dto.createPayment && dto.invoiceId) {
      payment = await this.paymentsService.create(companyId, {
        type: PaymentType.INCOMING,
        amount: Number(transaction.amount),
        method: PaymentMethod.BANK_TRANSFER,
        invoiceId: dto.invoiceId,
        bankAccountId: transaction.bankAccountId,
        paymentDate: transaction.bookingDate.toISOString(),
        qrReference: transaction.qrReference ?? undefined,
        reference: transaction.entryReference ?? undefined,
        notes: 'Manuell abgeglichen',
      });
    }

    // Update transaction
    return this.prisma.bankTransaction.update({
      where: { id: dto.transactionId },
      data: {
        status: TransactionStatus.RECONCILED,
        matchedInvoiceId: dto.invoiceId,
        matchedPaymentId: payment?.id,
      },
      include: {
        matchedInvoice: true,
        matchedPayment: true,
      },
    });
  }

  // Ignore a transaction
  async ignore(transactionId: string, companyId: string) {
    const transaction = await this.prisma.bankTransaction.findFirst({
      where: { id: transactionId, companyId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaktion nicht gefunden');
    }

    return this.prisma.bankTransaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.IGNORED },
    });
  }

  // Get single transaction by ID
  async findOne(transactionId: string, companyId: string) {
    const transaction = await this.prisma.bankTransaction.findFirst({
      where: { id: transactionId, companyId },
      include: {
        bankAccount: { select: { id: true, name: true, iban: true } },
        matchedInvoice: { select: { id: true, number: true, totalAmount: true } },
        matchedPayment: { select: { id: true, number: true, amount: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaktion nicht gefunden');
    }

    return transaction;
  }

  // Auto-reconcile all pending transactions
  async autoReconcileAll(companyId: string, bankAccountId?: string) {
    const where: any = { companyId, status: TransactionStatus.PENDING };
    if (bankAccountId) where.bankAccountId = bankAccountId;

    const pendingTransactions = await this.prisma.bankTransaction.findMany({
      where,
      orderBy: { bookingDate: 'desc' },
    });

    let reconciledCount = 0;
    let failedCount = 0;

    for (const transaction of pendingTransactions) {
      try {
        const result = await this.autoMatch(transaction, companyId);
        if (result.matched) {
          reconciledCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
      }
    }

    return {
      reconciled: reconciledCount,
      failed: failedCount,
      total: pendingTransactions.length,
    };
  }

  // Get reconciliation statistics
  async getStatistics(companyId: string, bankAccountId?: string) {
    const where: any = { companyId };
    if (bankAccountId) where.bankAccountId = bankAccountId;

    const [total, pending, matched, reconciled, ignored] = await Promise.all([
      this.prisma.bankTransaction.count({ where }),
      this.prisma.bankTransaction.count({ where: { ...where, status: TransactionStatus.PENDING } }),
      this.prisma.bankTransaction.count({ where: { ...where, status: TransactionStatus.MATCHED } }),
      this.prisma.bankTransaction.count({ where: { ...where, status: TransactionStatus.RECONCILED } }),
      this.prisma.bankTransaction.count({ where: { ...where, status: TransactionStatus.IGNORED } }),
    ]);

    const [creditSum, debitSum] = await Promise.all([
      this.prisma.bankTransaction.aggregate({
        where: { ...where, type: TransactionType.CREDIT, status: TransactionStatus.RECONCILED },
        _sum: { amount: true },
      }),
      this.prisma.bankTransaction.aggregate({
        where: { ...where, type: TransactionType.DEBIT, status: TransactionStatus.RECONCILED },
        _sum: { amount: true },
      }),
    ]);

    return {
      total,
      pending,
      matched,
      reconciled,
      ignored,
      reconciledCredits: creditSum._sum.amount || 0,
      reconciledDebits: debitSum._sum.amount || 0,
      reconciliationRate: total > 0 ? Math.round((reconciled / total) * 100) : 0,
    };
  }
}
