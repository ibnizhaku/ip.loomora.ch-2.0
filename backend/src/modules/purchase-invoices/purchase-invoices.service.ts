import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreatePurchaseInvoiceDto, 
  UpdatePurchaseInvoiceDto, 
  ApproveInvoiceDto,
  RecordPaymentDto,
  PurchaseInvoiceStatus,
  OcrExtractedDataDto,
} from './dto/purchase-invoice.dto';
import { mapPurchaseInvoiceResponse } from '../../common/mappers/response.mapper';

@Injectable()
export class PurchaseInvoicesService {
  constructor(private prisma: PrismaService) {}

  private readonly VAT_RATE = 8.1;

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    supplierId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, supplierId, startDate, endDate, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.purchaseInvoice.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: 'desc' },
        include: {
          supplier: { select: { id: true, name: true } },
          purchaseOrder: { select: { id: true, number: true } },
        },
      }),
      this.prisma.purchaseInvoice.count({ where }),
    ]);

    return {
      data: data.map(mapPurchaseInvoiceResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const purchaseInvoice = await this.prisma.purchaseInvoice.findFirst({
      where: { id, companyId },
      include: {
        supplier: true,
        purchaseOrder: {
          select: {
            id: true,
            number: true,
            items: {
              select: {
                id: true,
                position: true,
                description: true,
                quantity: true,
                unit: true,
                unitPrice: true,
                vatRate: true,
                total: true,
              },
              orderBy: { position: 'asc' },
            },
          },
        },
        payments: { select: { id: true, amount: true, paymentDate: true, method: true } },
      },
    });

    if (!purchaseInvoice) {
      throw new NotFoundException('Einkaufsrechnung nicht gefunden');
    }

    const mapped = mapPurchaseInvoiceResponse(purchaseInvoice);

    // Provide items[] for frontend — derive from purchaseOrder items or create synthetic entry
    const items = (purchaseInvoice.purchaseOrder as any)?.items || [
      {
        id: `${purchaseInvoice.id}-line`,
        description: `Einkaufsrechnung ${purchaseInvoice.number}`,
        quantity: 1,
        unitPrice: Number(purchaseInvoice.subtotal),
        totalPrice: Number(purchaseInvoice.subtotal),
        vatRate: this.VAT_RATE,
        vatAmount: Number(purchaseInvoice.vatAmount),
      },
    ];

    return {
      ...mapped,
      items,
    };
  }

  async create(companyId: string, dto: CreatePurchaseInvoiceDto) {
    // Validate supplier
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, companyId },
    });
    if (!supplier) {
      throw new NotFoundException('Lieferant nicht gefunden');
    }

    // Calculate totals
    let subtotal = 0;
    dto.items.forEach(item => {
      subtotal += item.quantity * item.unitPrice;
    });

    const vatAmount = subtotal * (this.VAT_RATE / 100);
    const totalAmount = subtotal + vatAmount;

    // Generate internal number
    const count = await this.prisma.purchaseInvoice.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const internalNumber = `ER-${year}-${String(count + 1).padStart(4, '0')}`;

    const created = await this.prisma.purchaseInvoice.create({
      data: {
        companyId,
        supplierId: dto.supplierId,
        purchaseOrderId: dto.purchaseOrderId,
        number: dto.externalNumber,
        date: new Date(dto.invoiceDate),
        dueDate: new Date(dto.dueDate),
        status: PurchaseInvoiceStatus.DRAFT,
        subtotal,
        vatAmount,
        totalAmount,
        documentUrl: dto.documentUrl,
        notes: dto.notes,
      },
      include: {
        supplier: true,
        purchaseOrder: { select: { id: true, number: true } },
      },
    });
    return mapPurchaseInvoiceResponse(created);
  }

  async update(id: string, companyId: string, dto: UpdatePurchaseInvoiceDto) {
    const purchaseInvoice = await this.findOne(id, companyId);

    if (purchaseInvoice.status === PurchaseInvoiceStatus.PAID) {
      throw new BadRequestException('Bezahlte Rechnung kann nicht bearbeitet werden');
    }

    let updateData: any = {
      status: dto.status,
      number: dto.externalNumber,
      date: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      documentUrl: dto.documentUrl,
      notes: dto.notes,
    };

    // Recalculate if items changed
    if (dto.items) {
      let subtotal = 0;
      dto.items.forEach(item => {
        subtotal += item.quantity * item.unitPrice;
      });

      const vatAmount = subtotal * (this.VAT_RATE / 100);
      const totalAmount = subtotal + vatAmount;

      updateData = {
        ...updateData,
        subtotal,
        vatAmount,
        totalAmount,
      };
    }

    const updated = await this.prisma.purchaseInvoice.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        purchaseOrder: { select: { id: true, number: true } },
      },
    });
    return mapPurchaseInvoiceResponse(updated);
  }

  async delete(id: string, companyId: string) {
    const purchaseInvoice = await this.findOne(id, companyId);

    if (purchaseInvoice.status === PurchaseInvoiceStatus.PAID) {
      throw new BadRequestException('Bezahlte Rechnung kann nicht gelöscht werden');
    }

    return this.prisma.purchaseInvoice.delete({ where: { id } });
  }

  // Prompt 1: Zahlungserfassung
  async recordPayment(id: string, companyId: string, dto: RecordPaymentDto) {
    const invoice = await this.prisma.purchaseInvoice.findFirst({
      where: { id, companyId },
    });
    if (!invoice) throw new NotFoundException('Rechnung nicht gefunden');
    if (invoice.status === 'CANCELLED') throw new BadRequestException('Stornierte Rechnung kann nicht bezahlt werden');

    return this.prisma.$transaction(async (tx) => {
      // Payment-Nummer generieren
      const payCount = await tx.payment.count({ where: { companyId } });
      const payNumber = `ZA-${new Date().getFullYear()}-${String(payCount + 1).padStart(5, '0')}`;

      const payment = await tx.payment.create({
        data: {
          number: payNumber,
          type: 'OUTGOING' as any,
          status: 'COMPLETED' as any,
          purchaseInvoiceId: id,
          supplierId: invoice.supplierId,
          amount: dto.amount,
          paymentDate: new Date(dto.paymentDate),
          method: dto.method,
          bankAccountId: dto.bankAccountId ?? undefined,
          notes: dto.note,
          companyId,
        },
      });

      const paidAmount = Number(invoice.paidAmount) + dto.amount;
      const isPaid = paidAmount >= Number(invoice.totalAmount);

      await tx.purchaseInvoice.update({
        where: { id },
        data: {
          paidAmount,
          status: isPaid ? 'PAID' : (invoice.status as any),
          paidDate: isPaid ? new Date() : undefined,
        },
      });

      return payment;
    });
  }

  // Prompt 2: Stornieren mit Audit-Trail
  async cancel(id: string, companyId: string, reason?: string) {
    const invoice = await this.prisma.purchaseInvoice.findFirst({ where: { id, companyId } });
    if (!invoice) throw new NotFoundException('Rechnung nicht gefunden');
    if (['CANCELLED', 'PAID'].includes(invoice.status as string)) {
      throw new BadRequestException(`Rechnung mit Status "${invoice.status}" kann nicht storniert werden`);
    }

    return this.prisma.purchaseInvoice.update({
      where: { id },
      data: {
        status: 'CANCELLED' as any,
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
      include: { supplier: true },
    });
  }

  // Prompt 5: Approve (fixed)
  async approve(id: string, companyId: string, dto: ApproveInvoiceDto) {
    const invoice = await this.prisma.purchaseInvoice.findFirst({ where: { id, companyId } });
    if (!invoice) throw new NotFoundException('Rechnung nicht gefunden');

    if (!['PENDING', 'DRAFT'].includes(invoice.status as string)) {
      throw new BadRequestException('Nur Rechnungen im Status DRAFT oder PENDING können freigegeben werden');
    }

    return this.prisma.purchaseInvoice.update({
      where: { id },
      data: {
        status: 'APPROVED' as any,
        approvedAt: new Date(),
        notes: dto.approvalNote
          ? `${invoice.notes || ''}\n[Freigabe] ${dto.approvalNote}`.trim()
          : invoice.notes,
      },
      include: { supplier: true },
    });
  }

  // Prompt 5: Reject
  async reject(id: string, companyId: string, reason?: string) {
    const invoice = await this.prisma.purchaseInvoice.findFirst({ where: { id, companyId } });
    if (!invoice) throw new NotFoundException('Rechnung nicht gefunden');

    if (!['PENDING', 'APPROVED'].includes(invoice.status as string)) {
      throw new BadRequestException('Nur Rechnungen im Status PENDING oder APPROVED können abgelehnt werden');
    }

    return this.prisma.purchaseInvoice.update({
      where: { id },
      data: {
        status: 'DRAFT' as any,
        rejectionNote: reason,
        rejectedAt: new Date(),
      },
      include: { supplier: true },
    });
  }

  // Simulate OCR extraction from PDF
  async extractFromDocument(documentUrl: string): Promise<OcrExtractedDataDto> {
    // In production, this would:
    // 1. Download the PDF from documentUrl
    // 2. Send to OCR service (e.g., Azure Form Recognizer, AWS Textract)
    // 3. Parse the extracted data

    // Simulated OCR result for demo
    return {
      supplierName: 'Muster Lieferant AG',
      invoiceNumber: 'INV-2024-' + Math.floor(Math.random() * 10000),
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: 1000,
      vatAmount: 81,
      totalAmount: 1081,
      items: [
        { description: 'Position 1', quantity: 10, unitPrice: 50, total: 500 },
        { description: 'Position 2', quantity: 5, unitPrice: 100, total: 500 },
      ],
      confidence: 85,
    };
  }

  // Create from purchase order
  async createFromPurchaseOrder(purchaseOrderId: string, companyId: string, externalNumber: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const purchaseOrder = await tx.purchaseOrder.findFirst({
        where: { id: purchaseOrderId, companyId },
        include: { items: true, supplier: true },
      });

      if (!purchaseOrder) {
        throw new NotFoundException('Bestellung nicht gefunden');
      }

      // Check if invoice already exists for this PO
      const existingInvoice = await tx.purchaseInvoice.findFirst({
        where: { purchaseOrderId, companyId },
      });

      if (existingInvoice) {
        throw new BadRequestException(`Purchase invoice ${existingInvoice.number} already exists for PO ${purchaseOrder.number}`);
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (purchaseOrder.supplier.paymentTermDays || 30));

      const invoice = await tx.purchaseInvoice.create({
        data: {
          companyId,
          supplierId: purchaseOrder.supplierId,
          purchaseOrderId,
          number: externalNumber,
          date: new Date(),
          dueDate,
          status: 'DRAFT',
          subtotal: purchaseOrder.subtotal,
          vatAmount: purchaseOrder.vatAmount,
          totalAmount: purchaseOrder.total,
          paidAmount: 0,
        },
        include: {
          supplier: true,
          purchaseOrder: { select: { id: true, number: true } },
        },
      });

      // Audit log
      if (userId) {
        await tx.auditLog.create({
          data: {
            module: 'FINANCE',
            entityType: 'PURCHASE_INVOICE',
            entityId: invoice.id,
            action: 'CREATE',
            description: `Purchase Invoice ${externalNumber} created from PO ${purchaseOrder.number}`,
            oldValues: { sourceType: 'PURCHASE_ORDER', purchaseOrderId, poNumber: purchaseOrder.number },
            newValues: { purchaseInvoiceId: invoice.id, externalNumber },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      }

      return invoice;
    });
  }

  // Get statistics
  async getStatistics(companyId: string) {
    const today = new Date();

    const [total, byStatus, overdue, totalOpen] = await Promise.all([
      this.prisma.purchaseInvoice.count({ where: { companyId } }),
      this.prisma.purchaseInvoice.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true,
        _sum: { totalAmount: true },
      }),
      this.prisma.purchaseInvoice.count({
        where: {
          companyId,
          status: { in: ['DRAFT', 'SENT'] },
          dueDate: { lt: today },
        },
      }),
      this.prisma.purchaseInvoice.aggregate({
        where: {
          companyId,
          status: { in: ['DRAFT', 'SENT'] },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const statusMap = new Map<string, { count: number; amount: number }>(
      byStatus.map(s => [s.status as string, { count: s._count, amount: Number(s._sum.totalAmount || 0) }])
    );
    const overdueValue = await this.prisma.purchaseInvoice.aggregate({
      where: { companyId, status: { in: ['DRAFT', 'SENT'] as any }, dueDate: { lt: today } },
      _sum: { totalAmount: true },
    });

    return {
      totalInvoices: total,
      pendingInvoices: (statusMap.get('DRAFT')?.count || 0) + (statusMap.get('SENT')?.count || 0),
      approvedInvoices: statusMap.get('CONFIRMED')?.count || 0,
      paidInvoices: statusMap.get('PAID')?.count || 0,
      overdueInvoices: overdue,
      totalValue: byStatus.reduce((sum, s) => sum + Number(s._sum.totalAmount || 0), 0),
      pendingValue: Number(totalOpen._sum?.totalAmount || 0),
      overdueValue: Number(overdueValue._sum?.totalAmount || 0),
    };
  }
}
