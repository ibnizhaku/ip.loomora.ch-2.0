import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreatePurchaseInvoiceDto, 
  UpdatePurchaseInvoiceDto, 
  ApproveInvoiceDto,
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
        purchaseOrder: { select: { id: true, number: true } },
        payments: { select: { id: true, amount: true, paymentDate: true, method: true } },
      },
    });

    if (!purchaseInvoice) {
      throw new NotFoundException('Einkaufsrechnung nicht gefunden');
    }

    return mapPurchaseInvoiceResponse(purchaseInvoice);
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

    return this.prisma.purchaseInvoice.create({
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

    return this.prisma.purchaseInvoice.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        purchaseOrder: { select: { id: true, number: true } },
      },
    });
  }

  async delete(id: string, companyId: string) {
    const purchaseInvoice = await this.findOne(id, companyId);

    if (purchaseInvoice.status === PurchaseInvoiceStatus.PAID) {
      throw new BadRequestException('Bezahlte Rechnung kann nicht gelöscht werden');
    }

    return this.prisma.purchaseInvoice.delete({ where: { id } });
  }

  // Approve invoice for payment
  async approve(id: string, companyId: string, dto: ApproveInvoiceDto) {
    const purchaseInvoice = await this.findOne(id, companyId);

    if (purchaseInvoice.status !== PurchaseInvoiceStatus.PENDING) {
      throw new BadRequestException('Nur ausstehende Rechnungen können freigegeben werden');
    }

    const updatedInvoice = await this.prisma.purchaseInvoice.update({
      where: { id },
      data: {
        status: PurchaseInvoiceStatus.APPROVED,
        notes: dto.approvalNote 
          ? `${purchaseInvoice.notes || ''}\n[Freigabe] ${dto.approvalNote}`
          : purchaseInvoice.notes,
      },
      include: {
        supplier: true,
      },
    });

    // TODO: If schedulePayment is true, create a scheduled payment

    return {
      ...updatedInvoice,
      message: 'Rechnung wurde zur Zahlung freigegeben',
    };
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
  async createFromPurchaseOrder(purchaseOrderId: string, companyId: string, externalNumber: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, companyId },
      include: { items: true, supplier: true },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Bestellung nicht gefunden');
    }

    const count = await this.prisma.purchaseInvoice.count({ where: { companyId } });
    const year = new Date().getFullYear();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (purchaseOrder.supplier.paymentTermDays || 30));

    return this.prisma.purchaseInvoice.create({
      data: {
        companyId,
        supplierId: purchaseOrder.supplierId,
        purchaseOrderId,
        number: externalNumber,
        date: new Date(),
        dueDate,
        status: PurchaseInvoiceStatus.PENDING,
        subtotal: purchaseOrder.subtotal,
        vatAmount: purchaseOrder.vatAmount,
        totalAmount: purchaseOrder.total,
      },
      include: {
        supplier: true,
        purchaseOrder: { select: { id: true, number: true } },
      },
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
          status: { in: ['DRAFT', 'PENDING', 'APPROVED'] },
          dueDate: { lt: today },
        },
      }),
      this.prisma.purchaseInvoice.aggregate({
        where: {
          companyId,
          status: { in: ['PENDING', 'APPROVED'] },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      total,
      overdue,
      totalOpenAmount: totalOpen._sum.totalAmount || 0,
      byStatus: byStatus.map(s => ({
        status: s.status,
        count: s._count,
        amount: s._sum.totalAmount || 0,
      })),
    };
  }
}
