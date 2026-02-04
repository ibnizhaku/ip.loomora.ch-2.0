import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateGoodsReceiptDto, 
  UpdateGoodsReceiptDto, 
  QualityCheckDto,
} from './dto/goods-receipt.dto';
import { GoodsReceiptStatus, QualityStatus } from '@prisma/client';

@Injectable()
export class GoodsReceiptsService {
  constructor(private prisma: PrismaService) {}

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
    if (supplierId) where.purchaseOrder = { supplierId };
    if (startDate || endDate) {
      where.receiptDate = {};
      if (startDate) where.receiptDate.gte = new Date(startDate);
      if (endDate) where.receiptDate.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { purchaseOrder: { number: { contains: search, mode: 'insensitive' } } },
        { purchaseOrder: { supplier: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.goodsReceipt.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { receiptDate: 'desc' },
        include: {
          purchaseOrder: {
            select: {
              id: true,
              number: true,
              supplier: { select: { id: true, name: true } },
            },
          },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
      }),
      this.prisma.goodsReceipt.count({ where }),
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
    const goodsReceipt = await this.prisma.goodsReceipt.findFirst({
      where: { id, companyId },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            items: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!goodsReceipt) {
      throw new NotFoundException('Wareneingang nicht gefunden');
    }

    return goodsReceipt;
  }

  async create(companyId: string, dto: CreateGoodsReceiptDto) {
    // Validate purchase order
    const purchaseOrder = await this.prisma.purchaseOrder.findFirst({
      where: { id: dto.purchaseOrderId, companyId },
      include: { items: true },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Bestellung nicht gefunden');
    }

    // Check if all items are received
    const totalOrdered = dto.items.reduce((sum, item) => sum + item.orderedQuantity, 0);
    const totalReceived = dto.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
    const status = totalReceived >= totalOrdered 
      ? GoodsReceiptStatus.COMPLETE 
      : totalReceived > 0 
        ? GoodsReceiptStatus.PARTIAL 
        : GoodsReceiptStatus.PENDING;

    // Generate number
    const count = await this.prisma.goodsReceipt.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `WE-${year}-${String(count + 1).padStart(4, '0')}`;

    const goodsReceipt = await this.prisma.goodsReceipt.create({
      data: {
        companyId,
        purchaseOrderId: dto.purchaseOrderId,
        number,
        status,
        receiptDate: dto.receiptDate ? new Date(dto.receiptDate) : new Date(),
        deliveryNoteNumber: dto.deliveryNoteNumber,
        carrier: dto.carrier,
        notes: dto.notes,
        items: {
          create: dto.items.map((item, index) => ({
            productId: item.productId,
            orderedQuantity: item.orderedQuantity,
            receivedQuantity: item.receivedQuantity,
            unit: item.unit || 'Stk',
            qualityStatus: item.qualityStatus || QualityStatus.NOT_CHECKED,
            qualityNotes: item.qualityNotes,
            batchNumber: item.batchNumber,
            serialNumber: item.serialNumber,
            storageLocation: item.storageLocation,
            position: index + 1,
          })),
        },
      },
      include: {
        purchaseOrder: {
          include: { supplier: true },
        },
        items: {
          include: { product: true },
        },
      },
    });

    // Update inventory for received items
    for (const item of dto.items) {
      if (item.receivedQuantity > 0) {
        await this.updateInventory(item.productId, item.receivedQuantity, goodsReceipt.number);
      }
    }

    // Update purchase order status if fully received
    if (status === GoodsReceiptStatus.COMPLETE) {
      await this.prisma.purchaseOrder.update({
        where: { id: dto.purchaseOrderId },
        data: { status: 'RECEIVED' },
      });
    } else if (status === GoodsReceiptStatus.PARTIAL) {
      await this.prisma.purchaseOrder.update({
        where: { id: dto.purchaseOrderId },
        data: { status: 'PARTIAL' },
      });
    }

    return goodsReceipt;
  }

  async update(id: string, companyId: string, dto: UpdateGoodsReceiptDto) {
    const goodsReceipt = await this.findOne(id, companyId);

    if (goodsReceipt.status === GoodsReceiptStatus.COMPLETE) {
      throw new BadRequestException('Abgeschlossener Wareneingang kann nicht bearbeitet werden');
    }

    let updateData: any = {
      status: dto.status,
      deliveryNoteNumber: dto.deliveryNoteNumber,
      notes: dto.notes,
    };

    // If items updated, recalculate and update inventory
    if (dto.items) {
      // Reverse previous inventory changes
      for (const existingItem of goodsReceipt.items) {
        if (existingItem.receivedQuantity > 0) {
          await this.updateInventory(
            existingItem.productId, 
            -Number(existingItem.receivedQuantity), 
            `${goodsReceipt.number}-KORREKTUR`
          );
        }
      }

      // Delete existing items
      await this.prisma.goodsReceiptItem.deleteMany({
        where: { goodsReceiptId: id },
      });

      // Create new items
      updateData.items = {
        create: dto.items.map((item, index) => ({
          productId: item.productId,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          unit: item.unit || 'Stk',
          qualityStatus: item.qualityStatus || QualityStatus.NOT_CHECKED,
          qualityNotes: item.qualityNotes,
          batchNumber: item.batchNumber,
          serialNumber: item.serialNumber,
          storageLocation: item.storageLocation,
          position: index + 1,
        })),
      };

      // Update inventory with new values
      for (const item of dto.items) {
        if (item.receivedQuantity > 0) {
          await this.updateInventory(item.productId, item.receivedQuantity, goodsReceipt.number);
        }
      }

      // Recalculate status
      const totalOrdered = dto.items.reduce((sum, item) => sum + item.orderedQuantity, 0);
      const totalReceived = dto.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
      updateData.status = totalReceived >= totalOrdered 
        ? GoodsReceiptStatus.COMPLETE 
        : totalReceived > 0 
          ? GoodsReceiptStatus.PARTIAL 
          : GoodsReceiptStatus.PENDING;
    }

    return this.prisma.goodsReceipt.update({
      where: { id },
      data: updateData,
      include: {
        purchaseOrder: {
          include: { supplier: true },
        },
        items: {
          include: { product: true },
        },
      },
    });
  }

  async delete(id: string, companyId: string) {
    const goodsReceipt = await this.findOne(id, companyId);

    // Reverse inventory changes
    for (const item of goodsReceipt.items) {
      if (item.receivedQuantity > 0) {
        await this.updateInventory(
          item.productId, 
          -Number(item.receivedQuantity), 
          `${goodsReceipt.number}-STORNO`
        );
      }
    }

    await this.prisma.goodsReceiptItem.deleteMany({
      where: { goodsReceiptId: id },
    });

    return this.prisma.goodsReceipt.delete({ where: { id } });
  }

  // Quality check for specific item
  async performQualityCheck(id: string, companyId: string, dto: QualityCheckDto) {
    const goodsReceipt = await this.findOne(id, companyId);
    
    const item = goodsReceipt.items.find(i => i.id === dto.itemId);
    if (!item) {
      throw new NotFoundException('Position nicht gefunden');
    }

    await this.prisma.goodsReceiptItem.update({
      where: { id: dto.itemId },
      data: {
        qualityStatus: dto.status,
        qualityNotes: dto.notes,
      },
    });

    // If rejected, adjust inventory
    if (dto.status === QualityStatus.FAILED && dto.rejectedQuantity) {
      await this.updateInventory(
        item.productId,
        -dto.rejectedQuantity,
        `${goodsReceipt.number}-QC-REJECT`
      );
    }

    return this.findOne(id, companyId);
  }

  // Get pending receipts (orders awaiting goods)
  async getPendingReceipts(companyId: string) {
    const pendingOrders = await this.prisma.purchaseOrder.findMany({
      where: {
        companyId,
        status: { in: ['SENT', 'CONFIRMED', 'PARTIAL'] },
      },
      include: {
        supplier: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { expectedDate: 'asc' },
    });

    return pendingOrders.map(order => ({
      ...order,
      isOverdue: order.expectedDate && new Date(order.expectedDate) < new Date(),
    }));
  }

  // Statistics
  async getStatistics(companyId: string) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, thisMonth, byStatus, pendingOrders] = await Promise.all([
      this.prisma.goodsReceipt.count({ where: { companyId } }),
      this.prisma.goodsReceipt.count({
        where: {
          companyId,
          receiptDate: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.goodsReceipt.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true,
      }),
      this.prisma.purchaseOrder.count({
        where: {
          companyId,
          status: { in: ['SENT', 'CONFIRMED', 'PARTIAL'] },
        },
      }),
    ]);

    return {
      total,
      thisMonth,
      pendingOrders,
      byStatus: byStatus.map(s => ({
        status: s.status,
        count: s._count,
      })),
    };
  }

  private async updateInventory(productId: string, quantity: number, reference: string) {
    // Update product stock
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: { increment: quantity },
      },
    });

    // Create inventory movement record
    await this.prisma.inventoryMovement.create({
      data: {
        productId,
        type: quantity > 0 ? 'IN' : 'ADJUSTMENT',
        quantity: Math.abs(quantity),
        reference,
        notes: quantity > 0 ? 'Wareneingang' : 'Korrektur/Storno',
      },
    });
  }
}
