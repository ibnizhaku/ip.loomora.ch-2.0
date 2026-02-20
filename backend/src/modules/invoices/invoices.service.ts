import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto, RecordPaymentDto } from './dto/invoice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { InvoiceStatus, PaymentStatus, PaymentType } from '@prisma/client';
import { mapInvoiceResponse } from '../../common/mappers/response.mapper';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/notification.dto';
import { generateSwissQrReference } from '../../common/utils/swiss-qr-reference.util';

@Injectable()
export class InvoicesService {
  private readonly VAT_RATE = 0.081;

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async findAll(companyId: string, query: PaginationDto & { status?: string; customerId?: string; overdue?: string }) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, customerId, overdue } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
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
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
              phone: true,
              street: true,
              zipCode: true,
              city: true,
              country: true,
              vatNumber: true,
              taxId: true,
            },
          },
          project: {
            select: { id: true, number: true, name: true },
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            select: { id: true, description: true, quantity: true, unitPrice: true, total: true, vatRate: true },
          },
          _count: {
            select: { items: true, payments: true },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    // Enrich with computed fields and map to frontend format
    const enrichedData = data.map((invoice) => {
      const enriched = {
        ...invoice,
        openAmount: Number(invoice.totalAmount) - Number(invoice.paidAmount),
        isOverdue: invoice.status !== InvoiceStatus.PAID && new Date(invoice.dueDate) < new Date(),
      };
      return mapInvoiceResponse(enriched);
    });

    return {
      data: enrichedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const [invoice, company] = await Promise.all([
      this.prisma.invoice.findFirst({
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
      }),
      this.prisma.company.findFirst({ where: { id: companyId } }),
    ]);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const enriched = {
      ...invoice,
      qrIban: (invoice as any).qrIban || company?.qrIban || null,
      openAmount: Number(invoice.totalAmount) - Number(invoice.paidAmount),
      isOverdue: invoice.status !== InvoiceStatus.PAID && new Date(invoice.dueDate) < new Date(),
    };
    return mapInvoiceResponse(enriched);
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

    // QR-Referenz nach SIX Swiss Payment Standard (QRR, 27 Stellen, MOD10 rekursiv)
    const invoiceCount = await this.prisma.invoice.count({ where: { companyId } });
    const qrReference = generateSwissQrReference(invoiceCount + 1);

    const created = await this.prisma.invoice.create({
      data: {
        number,
        customerId: dto.customerId,
        projectId: dto.projectId,
        orderId: dto.orderId,
        status: (dto as any).status || InvoiceStatus.DRAFT,
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
    return mapInvoiceResponse(created);
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

      const updated = await this.prisma.invoice.update({
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
      return mapInvoiceResponse(updated);
    }

    const updated = await this.prisma.invoice.update({
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
    return mapInvoiceResponse(updated);
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

  async sendInvoice(id: string, companyId: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { customer: { select: { id: true, name: true, email: true } } },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Stornierte Rechnungen dürfen nicht versendet werden
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Stornierte Rechnungen können nicht versendet werden');
    }

    // Bereits bezahlte Rechnungen nicht nochmal auf SENT setzen
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Bezahlte Rechnungen können nicht auf "Versendet" gesetzt werden');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.SENT },
      include: { customer: { select: { id: true, name: true, email: true } } },
    });

    // Notification an Ersteller senden (falls anderer Benutzer)
    if (invoice.createdById && invoice.createdById !== userId) {
      await this.notificationsService.create(companyId, {
        title: 'Rechnung versendet',
        message: `Rechnung ${invoice.number} an ${invoice.customer?.name || 'Kunde'} wurde versendet`,
        type: NotificationType.SUCCESS,
        category: 'invoice',
        actionUrl: `/invoices/${id}`,
        userId: invoice.createdById,
        sourceType: 'invoice',
        sourceId: id,
      });
    }

    return updated;
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

  async getStatsAmounts(companyId: string) {
    const [totalAgg, paidAgg, pendingAgg, overdueAgg] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { companyId },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { companyId, status: InvoiceStatus.PAID },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { companyId, status: InvoiceStatus.SENT },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { companyId, status: InvoiceStatus.OVERDUE },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      total: Number(totalAgg._sum.totalAmount) || 0,
      paid: Number(paidAgg._sum.totalAmount) || 0,
      pending: Number(pendingAgg._sum.totalAmount) || 0,
      overdue: Number(overdueAgg._sum.totalAmount) || 0,
    };
  }

  // Auto-Overdue Check (run daily via cron or manually)
  async checkOverdue(companyId: string, userId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL] },
        dueDate: { lt: today },
      },
    });

    const updated = await this.prisma.$transaction(
      overdueInvoices.map((invoice) =>
        this.prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.OVERDUE },
        })
      )
    );

    // Audit log
    if (userId && overdueInvoices.length > 0) {
      await this.prisma.auditLog.create({
        data: {
          module: 'INVOICES',
          entityType: 'INVOICE',
          action: 'UPDATE',
          description: `${overdueInvoices.length} invoices marked as OVERDUE`,
          metadata: { invoiceIds: overdueInvoices.map(i => i.id) },
          retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
          companyId,
          userId,
        },
      });
    }

    return {
      updated: updated.length,
      invoices: updated.map(i => ({ id: i.id, number: i.number })),
    };
  }

  // Create invoice from time entries (billable hours)
  async createFromTimeEntries(companyId: string, userId: string, params: {
    projectId?: string;
    customerId: string;
    startDate: string;
    endDate: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Find billable time entries
      const where: any = {
        companyId,
        isBillable: true,
        date: {
          gte: new Date(params.startDate),
          lte: new Date(params.endDate),
        },
      };

      if (params.projectId) {
        where.projectId = params.projectId;
      }

      const timeEntries = await tx.timeEntry.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true } },
          project: { select: { name: true } },
          task: { select: { title: true } },
        },
        orderBy: [{ date: 'asc' }, { userId: 'asc' }],
      });

      if (timeEntries.length === 0) {
        throw new BadRequestException('Keine abrechenbaren Stunden im gewählten Zeitraum');
      }

      // Group by user and calculate items
      const userGroups = new Map<string, any[]>();
      timeEntries.forEach(entry => {
        const key = entry.userId;
        if (!userGroups.has(key)) userGroups.set(key, []);
        userGroups.get(key)!.push(entry);
      });

      const items = [];
      let position = 1;

      for (const [userId, entries] of userGroups.entries()) {
        const totalHours = entries.reduce((sum, e) => sum + e.duration, 0) / 60; // minutes to hours
        const hourlyRate = Number(entries[0].hourlyRate || 100); // Default 100 CHF
        const userName = `${entries[0].user.firstName} ${entries[0].user.lastName}`;
        const total = totalHours * hourlyRate;

        items.push({
          position,
          description: `${userName} - ${totalHours.toFixed(2)}h à CHF ${hourlyRate.toFixed(2)}`,
          quantity: totalHours,
          unit: 'Std',
          unitPrice: hourlyRate,
          discount: 0,
          vatRate: 8.1,
          vatAmount: total * 0.081,
          total: total,
        });
        position++;
      }

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const vatAmount = subtotal * 0.081;
      const totalAmount = subtotal + vatAmount;

      // Generate invoice number
      const year = new Date().getFullYear();
      const lastInvoice = await tx.invoice.findFirst({
        where: { companyId, number: { startsWith: `RE-${year}` } },
        orderBy: { number: 'desc' },
      });
      
      const lastNum = lastInvoice?.number ? parseInt(lastInvoice.number.split('-')[2] || '0') : 0;
      const invoiceNumber = `RE-${year}-${String(lastNum + 1).padStart(3, '0')}`;

      // QR-Referenz nach SIX Swiss Payment Standard (QRR, 27 Stellen, MOD10 rekursiv)
      const invoiceCount = await tx.invoice.count({ where: { companyId } });
      const qrReference = generateSwissQrReference(invoiceCount + 1);

      // Create invoice
      const invoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          customerId: params.customerId,
          projectId: params.projectId,
          status: InvoiceStatus.DRAFT,
          date: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          subtotal,
          vatAmount,
          totalAmount,
          paidAmount: 0,
          qrReference,
          notes: `Stundenabrechnung ${params.startDate} - ${params.endDate}`,
          companyId,
          createdById: userId,
          items: {
            create: items,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          module: 'INVOICES',
          entityType: 'INVOICE',
          action: 'CREATE',
          description: `Invoice ${invoice.number} created from ${timeEntries.length} time entries (${(items.reduce((s, i) => s + i.quantity, 0)).toFixed(2)}h)`,
          metadata: { timeEntryIds: timeEntries.map(e => e.id), totalHours: items.reduce((s, i) => s + i.quantity, 0) },
          retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
          companyId,
          userId,
        },
      });

      return invoice;
    });
  }

  // Rückgabe von Zählern (nicht CHF-Beträgen) – Frontend QRInvoice erwartet { total, paid, pending, overdue }
  async getStats(companyId: string) {
    const [total, paid, overdue] = await Promise.all([
      this.prisma.invoice.count({ where: { companyId } }),
      this.prisma.invoice.count({ where: { companyId, status: InvoiceStatus.PAID } }),
      this.prisma.invoice.count({ where: { companyId, status: InvoiceStatus.OVERDUE } }),
    ]);
    const pending = Math.max(0, total - paid - overdue);
    return { total, paid, pending, overdue };
  }

  // Bestehende Rechnungen ohne qrReference nachrüsten (nur fehlende)
  async backfillQrReferences() {
    const invoices = await this.prisma.invoice.findMany({
      where: { qrReference: null },
      select: { id: true, number: true },
      orderBy: { createdAt: 'asc' },
    });
    let count = 0;
    for (const inv of invoices) {
      const numeric = inv.number.replace(/\D/g, '');
      const base = numeric.padStart(26, '0').substring(0, 26);
      const qrReference = generateSwissQrReference(parseInt(numeric, 10) || count + 1);
      await this.prisma.invoice.update({ where: { id: inv.id }, data: { qrReference } });
      count++;
    }
    return { updated: count };
  }
}
