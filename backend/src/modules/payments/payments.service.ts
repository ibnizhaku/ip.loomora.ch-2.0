import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreatePaymentDto, 
  UpdatePaymentDto, 
  ReconcilePaymentDto,
} from './dto/payment.dto';
import { PaymentStatus, PaymentType } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    method?: string;
    customerId?: string;
    supplierId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const { 
      page = 1, 
      pageSize = 20, 
      type, 
      status, 
      method,
      customerId, 
      supplierId, 
      startDate, 
      endDate, 
      search 
    } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (type) where.type = type;
    if (status) where.status = status;
    if (method) where.method = method;
    if (customerId) where.customerId = customerId;
    if (supplierId) where.supplierId = supplierId;
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { qrReference: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { paymentDate: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
          invoice: { select: { id: true, number: true, totalAmount: true } },
          purchaseInvoice: { select: { id: true, number: true, totalAmount: true } },
          bankAccount: { select: { id: true, name: true, iban: true } },
        },
      }),
      this.prisma.payment.count({ where }),
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
    const payment = await this.prisma.payment.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        supplier: true,
        invoice: { include: { items: true } },
        purchaseInvoice: true,
        bankAccount: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Zahlung nicht gefunden');
    }

    return payment;
  }

  async create(companyId: string, dto: CreatePaymentDto) {
    // Validate invoice/purchase invoice exists
    if (dto.invoiceId) {
      const invoice = await this.prisma.invoice.findFirst({
        where: { id: dto.invoiceId, companyId },
      });
      if (!invoice) {
        throw new NotFoundException('Rechnung nicht gefunden');
      }
      dto.customerId = invoice.customerId;
    }

    if (dto.purchaseInvoiceId) {
      const purchaseInvoice = await this.prisma.purchaseInvoice.findFirst({
        where: { id: dto.purchaseInvoiceId, companyId },
      });
      if (!purchaseInvoice) {
        throw new NotFoundException('Einkaufsrechnung nicht gefunden');
      }
      dto.supplierId = purchaseInvoice.supplierId;
    }

    // Generate payment number
    const count = await this.prisma.payment.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const prefix = dto.type === PaymentType.INCOMING ? 'ZE' : 'ZA'; // Zahlungseingang / Zahlungsausgang
    const number = `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;

    const payment = await this.prisma.payment.create({
      data: {
        companyId,
        number,
        type: dto.type,
        amount: dto.amount,
        method: dto.method,
        status: PaymentStatus.COMPLETED,
        invoiceId: dto.invoiceId,
        purchaseInvoiceId: dto.purchaseInvoiceId,
        customerId: dto.customerId,
        supplierId: dto.supplierId,
        bankAccountId: dto.bankAccountId,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        reference: dto.reference,
        qrReference: dto.qrReference,
        notes: dto.notes,
      },
      include: {
        customer: true,
        supplier: true,
        invoice: true,
        purchaseInvoice: true,
        bankAccount: true,
      },
    });

    // Update invoice status if fully paid
    if (dto.invoiceId) {
      await this.updateInvoicePaymentStatus(dto.invoiceId);
    }

    if (dto.purchaseInvoiceId) {
      await this.updatePurchaseInvoicePaymentStatus(dto.purchaseInvoiceId);
    }

    return payment;
  }

  async update(id: string, companyId: string, dto: UpdatePaymentDto) {
    await this.findOne(id, companyId);

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: dto.status,
        amount: dto.amount,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        reference: dto.reference,
        notes: dto.notes,
      },
      include: {
        customer: true,
        supplier: true,
        invoice: true,
        purchaseInvoice: true,
        bankAccount: true,
      },
    });
  }

  async delete(id: string, companyId: string) {
    const payment = await this.findOne(id, companyId);

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Abgeschlossene Zahlung kann nicht gelöscht werden');
    }

    return this.prisma.payment.delete({ where: { id } });
  }

  // Reconcile payment with invoice
  async reconcile(id: string, companyId: string, dto: ReconcilePaymentDto) {
    const payment = await this.findOne(id, companyId);

    if (payment.invoiceId) {
      throw new BadRequestException('Zahlung ist bereits einer Rechnung zugeordnet');
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, companyId },
    });

    if (!invoice) {
      throw new NotFoundException('Rechnung nicht gefunden');
    }

    // Update payment with invoice reference
    await this.prisma.payment.update({
      where: { id },
      data: { invoiceId: dto.invoiceId },
    });

    // Update invoice payment status
    if (dto.markInvoicePaid) {
      await this.updateInvoicePaymentStatus(dto.invoiceId);
    }

    return this.findOne(id, companyId);
  }

  // Get payment statistics
  async getStatistics(companyId: string, params: { startDate?: string; endDate?: string } = {}) {
    const { startDate, endDate } = params;
    const dateFilter: any = {};
    
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const where: any = { 
      companyId, 
      status: PaymentStatus.COMPLETED,
    };
    if (Object.keys(dateFilter).length > 0) {
      where.paymentDate = dateFilter;
    }

    const [incoming, outgoing, byMethod] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...where, type: PaymentType.INCOMING },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { ...where, type: PaymentType.OUTGOING },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      incoming: {
        count: incoming._count,
        total: incoming._sum.amount || 0,
      },
      outgoing: {
        count: outgoing._count,
        total: outgoing._sum.amount || 0,
      },
      netCashflow: (incoming._sum.amount || 0) - (outgoing._sum.amount || 0),
      byMethod: byMethod.map(m => ({
        method: m.method,
        count: m._count,
        total: m._sum.amount || 0,
      })),
    };
  }

  // Find payments by QR reference (for camt.054 matching)
  async findByQrReference(qrReference: string, companyId: string) {
    // First check if payment already exists
    const existingPayment = await this.prisma.payment.findFirst({
      where: { qrReference, companyId },
    });

    if (existingPayment) {
      return { matched: true, payment: existingPayment };
    }

    // Try to find matching invoice by QR reference
    const invoice = await this.prisma.invoice.findFirst({
      where: { qrReference, companyId },
      include: { customer: true },
    });

    if (invoice) {
      return { 
        matched: false, 
        invoice,
        suggestion: 'Rechnung gefunden. Zahlung kann erstellt werden.',
      };
    }

    return { matched: false, invoice: null };
  }

  private async updateInvoicePaymentStatus(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) return;

    const payments = await this.prisma.payment.aggregate({
      where: { 
        invoiceId, 
        status: PaymentStatus.COMPLETED,
        type: PaymentType.INCOMING,
      },
      _sum: { amount: true },
    });

    const totalPaid = payments._sum.amount || 0;
    const invoiceTotal = Number(invoice.totalAmount);

    let newStatus = invoice.status;
    if (totalPaid >= invoiceTotal) {
      newStatus = 'PAID';
    } else if (totalPaid > 0) {
      newStatus = 'PARTIAL';
    }

    if (newStatus !== invoice.status) {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { 
          status: newStatus,
          paidAt: newStatus === 'PAID' ? new Date() : undefined,
        },
      });
    }
  }

  private async updatePurchaseInvoicePaymentStatus(purchaseInvoiceId: string) {
    const purchaseInvoice = await this.prisma.purchaseInvoice.findUnique({
      where: { id: purchaseInvoiceId },
    });

    if (!purchaseInvoice) return;

    const payments = await this.prisma.payment.aggregate({
      where: { 
        purchaseInvoiceId, 
        status: PaymentStatus.COMPLETED,
        type: PaymentType.OUTGOING,
      },
      _sum: { amount: true },
    });

    const totalPaid = payments._sum.amount || 0;
    const invoiceTotal = Number(purchaseInvoice.totalAmount);

    if (totalPaid >= invoiceTotal) {
      await this.prisma.purchaseInvoice.update({
        where: { id: purchaseInvoiceId },
        data: { status: 'PAID' },
      });
    }
  }
}
