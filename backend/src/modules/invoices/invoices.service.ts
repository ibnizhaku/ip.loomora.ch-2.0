import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto, RecordPaymentDto } from './dto/invoice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { InvoiceStatus, PaymentStatus, PaymentType } from '@prisma/client';

@Injectable()
export class InvoicesService {
  private readonly VAT_RATE = 0.081;

  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto & { status?: string; customerId?: string; overdue?: string }) {
    const { page = 1, pageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, customerId, overdue } = query;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { qrReference: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (overdue === 'true') {
      where.status = { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] };
      where.dueDate = { lt: new Date() };
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: { id: true, name: true, companyName: true },
          },
          project: {
            select: { id: true, number: true, name: true },
          },
          _count: {
            select: { items: true, payments: true },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    // Enrich with computed fields
    const enrichedData = data.map((invoice) => ({
      ...invoice,
      openAmount: Number(invoice.totalAmount) - Number(invoice.paidAmount),
      isOverdue: invoice.status !== InvoiceStatus.PAID && new Date(invoice.dueDate) < new Date(),
    }));

    return {
      data: enrichedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        project: true,
        order: true,
        items: {
          orderBy: { position: 'asc' },
          include: { product: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        reminders: {
          orderBy: { sentAt: 'desc' },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      ...invoice,
      openAmount: Number(invoice.totalAmount) - Number(invoice.paidAmount),
      isOverdue: invoice.status !== InvoiceStatus.PAID && new Date(invoice.dueDate) < new Date(),
    };
  }

  async create(companyId: string, userId: string, dto: CreateInvoiceDto) {
    // Generate invoice number
    let number = dto.number;
    if (!number) {
      const year = new Date().getFullYear();
      const lastInvoice = await this.prisma.invoice.findFirst({
        where: { companyId, number: { startsWith: `RE-${year}` } },
        orderBy: { number: 'desc' },
      });
      
      const lastNum = lastInvoice?.number 
        ? parseInt(lastInvoice.number.split('-')[2] || '0') 
        : 0;
      number = `RE-${year}-${String(lastNum + 1).padStart(3, '0')}`;
    }

    // Calculate totals
    const items = dto.items.map((item) => {
      const discount = item.discount || 0;
      const discountedPrice = item.unitPrice * (1 - discount / 100);
      const total = discountedPrice * item.quantity;
      return { ...item, total };
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * this.VAT_RATE;
    const total = subtotal + vatAmount;

    // Generate QR reference
    const qrReference = String(Date.now()).padStart(27, '0');

    return this.prisma.invoice.create({
      data: {
        number,
        customerId: dto.customerId,
        projectId: dto.projectId,
        orderId: dto.orderId,
        status: InvoiceStatus.DRAFT,
        date: dto.issueDate ? new Date(dto.issueDate) : new Date(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal,
        vatAmount,
        totalAmount: total,
        qrReference,
        notes: dto.notes,
        internalNotes: dto.internalNotes,
        companyId,
        createdById: userId,
        items: {
          create: items.map((item, index) => ({
            position: index + 1,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || 'Stk',
            unitPrice: item.unitPrice,
            discount: item.discount,
            vatRate: this.VAT_RATE * 100,
            vatAmount: item.total * this.VAT_RATE,
            total: item.total,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateInvoiceDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot modify paid invoice');
    }

    if (dto.items) {
      const items = dto.items.map((item) => {
        const discount = item.discount || 0;
        const discountedPrice = item.unitPrice * (1 - discount / 100);
        const total = discountedPrice * item.quantity;
        return { ...item, total };
      });

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const vatAmount = subtotal * this.VAT_RATE;
      const total = subtotal + vatAmount;

      await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

      return this.prisma.invoice.update({
        where: { id },
        data: {
          customerId: dto.customerId,
          projectId: dto.projectId,
          status: dto.status as InvoiceStatus,
          date: dto.issueDate ? new Date(dto.issueDate) : undefined,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          subtotal,
          vatAmount,
          totalAmount: total,
          notes: dto.notes,
          internalNotes: dto.internalNotes,
          items: {
            create: items.map((item, index) => ({
              position: index + 1,
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit || 'Stk',
              unitPrice: item.unitPrice,
              discount: item.discount,
              vatRate: this.VAT_RATE * 100,
              vatAmount: item.total * this.VAT_RATE,
              total: item.total,
            })),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        projectId: dto.projectId,
        status: dto.status as InvoiceStatus,
        date: dto.issueDate ? new Date(dto.issueDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        internalNotes: dto.internalNotes,
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async recordPayment(id: string, companyId: string, userId: string, dto: RecordPaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const newPaidAmount = Number(invoice.paidAmount) + dto.amount;
    
    if (newPaidAmount > Number(invoice.totalAmount)) {
      throw new BadRequestException('Payment amount exceeds invoice total');
    }

    // Create payment record
    const year = new Date().getFullYear();
    const paymentCount = await this.prisma.payment.count({ where: { companyId } });
    const paymentNumber = `ZE-${year}-${String(paymentCount + 1).padStart(5, '0')}`;

    await this.prisma.payment.create({
      data: {
        number: paymentNumber,
        invoiceId: id,
        customerId: invoice.customerId,
        type: 'INCOMING',
        amount: dto.amount,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        method: 'BANK_TRANSFER',
        reference: dto.reference,
        status: 'COMPLETED',
        notes: dto.notes,
        companyId,
      },
    });

    // Update invoice
    const newStatus = newPaidAmount >= Number(invoice.totalAmount)
      ? InvoiceStatus.PAID 
      : invoice.status;

    return this.prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        paidAt: newPaidAmount >= Number(invoice.totalAmount) ? new Date() : undefined,
        status: newStatus,
      },
      include: {
        customer: true,
        payments: true,
      },
    });
  }

  async sendInvoice(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.SENT },
    });
  }

  async cancelInvoice(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (Number(invoice.paidAmount) > 0) {
      throw new BadRequestException('Cannot cancel invoice with payments');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
    });
  }

  async remove(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be deleted');
    }

    await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    return this.prisma.invoice.delete({ where: { id } });
  }

  // Get open items (Debtors)
  async getOpenItems(companyId: string) {
    const openInvoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] },
      },
      include: {
        customer: {
          select: { id: true, name: true, companyName: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return openInvoices.map((invoice) => ({
      ...invoice,
      openAmount: Number(invoice.totalAmount) - Number(invoice.paidAmount),
      daysOverdue: Math.max(0, Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))),
    }));
  }
}
