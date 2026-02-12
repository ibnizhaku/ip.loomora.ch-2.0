import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderStatus } from './dto/purchase-order.dto';
import { mapPurchaseOrderResponse } from '../../common/mappers/response.mapper';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  private readonly VAT_RATE = 8.1;

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    supplierId?: string;
    projectId?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, supplierId, projectId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true, number: true } },
          items: true,
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data: data.map(mapPurchaseOrderResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findFirst({
      where: { id, companyId },
      include: {
        supplier: true,
        project: { select: { id: true, name: true, number: true } },
        items: true,
        purchaseInvoices: { select: { id: true, number: true, status: true, totalAmount: true } },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Bestellung nicht gefunden');
    }

    return mapPurchaseOrderResponse(purchaseOrder);
  }

  async create(companyId: string, dto: CreatePurchaseOrderDto) {
    // Validate supplier
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, companyId },
    });
    if (!supplier) {
      throw new NotFoundException('Lieferant nicht gefunden');
    }

    // Calculate totals
    let subtotal = 0;
    const itemsWithTotals = dto.items.map((item, index) => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;

      return {
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || 'Stk',
        unitPrice: item.unitPrice,
        vatRate: 'STANDARD' as const,
        total: lineTotal,
        position: index + 1,
      };
    });

    const vatAmount = subtotal * (this.VAT_RATE / 100);
    const total = subtotal + vatAmount;

    // Generate number
    const count = await this.prisma.purchaseOrder.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `BE-${year}-${String(count + 1).padStart(4, '0')}`;

    const created = await this.prisma.purchaseOrder.create({
      data: {
        companyId,
        supplierId: dto.supplierId,
        projectId: dto.projectId,
        number,
        status: 'DRAFT',
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
        notes: dto.notes,
        subtotal,
        vatAmount,
        total,
        items: {
          create: itemsWithTotals,
        },
      },
      include: {
        supplier: true,
        project: { select: { id: true, name: true } },
        items: true,
      },
    });
    return mapPurchaseOrderResponse(created);
  }

  async update(id: string, companyId: string, dto: UpdatePurchaseOrderDto) {
    const purchaseOrder = await this.findOne(id, companyId);

    // Check if status is a final state (CONFIRMED is the closest to "completed" in DocumentStatus)
    if (purchaseOrder.status === 'CONFIRMED') {
      throw new BadRequestException('Bestätigte Bestellung kann nicht bearbeitet werden');
    }

    let updateData: any = {
      status: dto.status,
      expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
      notes: dto.notes,
    };

    // Recalculate if items changed
    if (dto.items) {
      await this.prisma.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id },
      });

      let subtotal = 0;
      const itemsWithTotals = dto.items.map((item, index) => {
        const vatRate = item.vatRate ?? this.VAT_RATE;
        const lineTotal = item.quantity * item.unitPrice;
        subtotal += lineTotal;

        return {
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'Stk',
          unitPrice: item.unitPrice,
          vatRate: vatRate.toString(),
          total: lineTotal,
          position: index + 1,
        };
      });

      const vatAmount = subtotal * (this.VAT_RATE / 100);
      const total = subtotal + vatAmount;

      updateData = {
        ...updateData,
        subtotal,
        vatAmount,
        total,
        items: { create: itemsWithTotals },
      };
    }

    // Set sent date when status changes to SENT
    if (dto.status === 'SENT' && purchaseOrder.status === 'DRAFT') {
      updateData.date = new Date();
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        project: { select: { id: true, name: true } },
        items: true,
      },
    });
    return mapPurchaseOrderResponse(updated);
  }

  async delete(id: string, companyId: string) {
    const purchaseOrder = await this.findOne(id, companyId);

    if (purchaseOrder.status !== 'DRAFT') {
      throw new BadRequestException('Nur Entwürfe können gelöscht werden');
    }

    await this.prisma.purchaseOrderItem.deleteMany({
      where: { purchaseOrderId: id },
    });

    return this.prisma.purchaseOrder.delete({ where: { id } });
  }

  // Send purchase order
  async send(id: string, companyId: string, method: string, recipientEmail?: string) {
    const purchaseOrder = await this.findOne(id, companyId);

    if (purchaseOrder.status === 'DRAFT') {
      await this.prisma.purchaseOrder.update({
        where: { id },
        data: { 
          status: 'SENT',
          date: new Date(),
        },
      });
    }

    // In production, this would:
    // - Generate PDF (Swiss business letter format)
    // - Send email if method is EMAIL
    // - Return PDF for download if method is PDF/PRINT

    return {
      success: true,
      message: `Bestellung ${purchaseOrder.number} wurde ${method === 'EMAIL' ? 'per E-Mail versendet' : 'als PDF generiert'}`,
      purchaseOrderId: id,
    };
  }

  // Statistics
  async getStatistics(companyId: string) {
    const [total, byStatus, totalValue] = await Promise.all([
      this.prisma.purchaseOrder.count({ where: { companyId } }),
      this.prisma.purchaseOrder.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true,
        _sum: { total: true },
      }),
      this.prisma.purchaseOrder.aggregate({
        where: { companyId },
        _sum: { total: true },
      }),
    ]);

    const statusMap = new Map<string, number>(byStatus.map(s => [s.status as string, s._count]));
    const valueMap = new Map<string, number>(byStatus.map(s => [s.status as string, Number(s._sum.total || 0)]));
    const pendingValue = (valueMap.get('DRAFT') || 0) + (valueMap.get('SENT') || 0);

    return {
      totalOrders: total,
      draftOrders: statusMap.get('DRAFT') || 0,
      sentOrders: statusMap.get('SENT') || 0,
      confirmedOrders: statusMap.get('CONFIRMED') || 0,
      receivedOrders: statusMap.get('CANCELLED') || 0,
      totalValue: Number(totalValue._sum.total || 0),
      pendingValue,
    };
  }
}
