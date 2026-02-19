import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { DocumentStatus, InvoiceStatus } from '@prisma/client';
import { mapOrderResponse } from '../../common/mappers/response.mapper';

// Gemeinsames Full-Include für alle Order-Abfragen
const ORDER_FULL_INCLUDE = {
  customer: true,
  project: { select: { id: true, name: true, number: true } },
  quote: { select: { id: true, number: true } },
  items: { orderBy: { position: 'asc' as const }, include: { product: true } },
  invoices: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  deliveryNotes: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  assignedUsers: {
    select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
  },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  updatedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { items: true, invoices: true, deliveryNotes: true } },
} as const;

@Injectable()
export class OrdersService {
  private readonly VAT_RATE = 0.081;

  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto & { status?: string; customerId?: string }) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, customerId } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
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
          items: {
            select: { id: true, description: true, quantity: true, unitPrice: true, total: true, vatRate: true },
          },
          _count: {
            select: { items: true, invoices: true, deliveryNotes: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: data.map(mapOrderResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, companyId },
      include: ORDER_FULL_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return mapOrderResponse(order);
  }

  async create(companyId: string, userId: string, dto: CreateOrderDto) {
    // Generate order number
    let number = dto.number;
    if (!number) {
      const year = new Date().getFullYear();
      const lastOrder = await this.prisma.order.findFirst({
        where: { companyId, number: { startsWith: `AB-${year}` } },
        orderBy: { number: 'desc' },
      });
      
      const lastNum = lastOrder?.number 
        ? parseInt(lastOrder.number.split('-')[2] || '0') 
        : 0;
      number = `AB-${year}-${String(lastNum + 1).padStart(3, '0')}`;
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

    const created = await this.prisma.order.create({
      data: {
        number,
        customerId: dto.customerId,
        projectId: dto.projectId,
        quoteId: dto.quoteId,
        status: dto.status || DocumentStatus.CONFIRMED,
        date: dto.orderDate ? new Date(dto.orderDate) : new Date(),
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        deliveryAddress: (dto.deliveryAddress as any) ?? undefined,
        subtotal,
        vatAmount,
        total,
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
            vatRate: 'STANDARD',
            total: item.total,
          })),
        },
      },
      include: ORDER_FULL_INCLUDE,
    });
    return mapOrderResponse(created);
  }

  async update(id: string, companyId: string, dto: UpdateOrderDto, userId?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, companyId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const { assignedUserIds, items: dtoItems, ...rest } = dto;

    // Basisdaten für das Update
    const baseData: any = {
      customerId: rest.customerId,
      projectId: rest.projectId,
      status: rest.status,
      date: rest.orderDate ? new Date(rest.orderDate) : undefined,
      deliveryDate: rest.deliveryDate ? new Date(rest.deliveryDate) : undefined,
      deliveryAddress: (rest.deliveryAddress as any) ?? undefined,
      notes: rest.notes,
      internalNotes: rest.internalNotes,
    };
    // updatedByUserId setzen wenn userId übergeben und Status oder andere Felder geändert werden
    if (userId) {
      baseData.updatedByUserId = userId;
    }

    // Undefinierte Felder entfernen (kein unnötiger Überschreiben)
    Object.keys(baseData).forEach((k) => baseData[k] === undefined && delete baseData[k]);

    // assignedUsers M2M setzen wenn übergeben
    if (assignedUserIds !== undefined) {
      baseData.assignedUsers = {
        set: assignedUserIds.map((uid) => ({ id: uid })),
      };
    }

    // Items neu erstellen wenn übergeben
    if (dtoItems && dtoItems.length > 0) {
      const mappedItems = dtoItems.map((item) => {
        const discount = item.discount || 0;
        const discountedPrice = item.unitPrice * (1 - discount / 100);
        const total = discountedPrice * item.quantity;
        return { ...item, total };
      });

      const subtotal = mappedItems.reduce((sum, item) => sum + item.total, 0);
      const vatAmount = subtotal * this.VAT_RATE;
      const total = subtotal + vatAmount;

      await this.prisma.orderItem.deleteMany({ where: { orderId: id } });

      baseData.subtotal = subtotal;
      baseData.vatAmount = vatAmount;
      baseData.total = total;
      baseData.items = {
        create: mappedItems.map((item, index) => ({
          position: index + 1,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'Stk',
          unitPrice: item.unitPrice,
          discount: item.discount,
          vatRate: 'STANDARD',
          total: item.total,
        })),
      };
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: baseData,
      include: ORDER_FULL_INCLUDE,
    });

    return mapOrderResponse(updated);
  }

  async createInvoice(id: string, companyId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, companyId },
        include: { items: true, customer: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Check if invoice already exists for this order
      const existingInvoice = await tx.invoice.findFirst({
        where: { orderId: id, companyId },
      });

      if (existingInvoice) {
        throw new BadRequestException(`Order already has invoice ${existingInvoice.number}`);
      }

      // Generate invoice number
      const year = new Date().getFullYear();
      const lastInvoice = await tx.invoice.findFirst({
        where: { companyId, number: { startsWith: `RE-${year}` } },
        orderBy: { number: 'desc' },
      });
      
      const lastNum = lastInvoice?.number 
        ? parseInt(lastInvoice.number.split('-')[2] || '0') 
        : 0;
      const invoiceNumber = `RE-${year}-${String(lastNum + 1).padStart(3, '0')}`;

      // Generate Swiss QR reference (26-27 digits with check digit)
      const invoiceCount = await tx.invoice.count({ where: { companyId } });
      const referenceBase = `${companyId.substring(0, 8)}${String(invoiceCount + 1).padStart(10, '0')}`;
      const checkDigit = this.calculateMod10CheckDigit(referenceBase);
      const qrReference = referenceBase + checkDigit;

      const invoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          customerId: order.customerId,
          projectId: order.projectId,
          orderId: order.id,
          status: InvoiceStatus.DRAFT,
          date: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
          subtotal: order.subtotal,
          vatAmount: order.vatAmount,
          totalAmount: order.total,
          paidAmount: 0,
          qrReference,
          notes: order.notes,
          companyId,
          createdById: userId,
          items: {
            create: order.items.map((item, index) => ({
              position: item.position || index + 1,
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              discount: item.discount,
              vatRate: 8.1,
              vatAmount: Number(item.total) * 0.081,
              total: item.total,
            })),
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
          entityId: invoice.id,
          action: 'CREATE',
          description: `Invoice ${invoice.number} created from Order ${order.number}`,
          oldValues: { sourceType: 'ORDER', orderId: order.id, orderNumber: order.number },
          newValues: { invoiceId: invoice.id, invoiceNumber: invoice.number, qrReference },
          retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
          companyId,
          userId,
        },
      });

      return invoice;
    });
  }

  // Calculate Swiss MOD10 check digit for QR reference
  private calculateMod10CheckDigit(reference: string): string {
    const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
    let carry = 0;
    
    for (const char of reference) {
      carry = table[(carry + parseInt(char)) % 10];
    }
    
    return String((10 - carry) % 10);
  }

  async getStats(companyId: string) {
    const [total, draft, sent, confirmed, cancelled, totalAgg] = await Promise.all([
      this.prisma.order.count({ where: { companyId } }),
      this.prisma.order.count({ where: { companyId, status: DocumentStatus.DRAFT } }),
      this.prisma.order.count({ where: { companyId, status: DocumentStatus.SENT } }),
      this.prisma.order.count({ where: { companyId, status: DocumentStatus.CONFIRMED } }),
      this.prisma.order.count({ where: { companyId, status: DocumentStatus.CANCELLED } }),
      this.prisma.order.aggregate({
        where: { companyId },
        _sum: { total: true },
      }),
    ]);
    return {
      total,
      draft,
      sent,
      confirmed,
      cancelled,
      totalValue: Number(totalAgg._sum.total || 0),
    };
  }

  async createDeliveryNote(id: string, companyId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, companyId },
        include: { items: true, customer: true },
      });

      if (!order) throw new NotFoundException('Order not found');

      // Atomar inkrementieren via company.deliveryCounter
      const company = await tx.company.update({
        where: { id: companyId },
        data: { deliveryCounter: { increment: 1 } },
        select: { deliveryCounter: true },
      });

      const dnNumber = `LS-${new Date().getFullYear()}-${String(company.deliveryCounter).padStart(4, '0')}`;

      const deliveryAddress = [
        order.customer?.street,
        order.customer?.zipCode && order.customer?.city
          ? `${order.customer.zipCode} ${order.customer.city}`
          : order.customer?.city,
      ].filter(Boolean).join(', ');

      const deliveryNote = await tx.deliveryNote.create({
        data: {
          number: dnNumber,
          customerId: order.customerId,
          orderId: order.id,
          status: 'DRAFT' as any,
          date: new Date(),
          deliveryAddress: deliveryAddress ? { address: deliveryAddress } : undefined,
          createdById: userId,
          companyId,
          items: {
            create: order.items.map((item, index) => ({
              position: item.position || index + 1,
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
            })),
          },
        },
        include: {
          customer: true,
          order: { select: { id: true, number: true } },
          items: { orderBy: { position: 'asc' }, include: { product: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          module: 'DOCUMENTS',
          entityId: deliveryNote.id,
          entityType: 'DeliveryNote',
          entityName: deliveryNote.number,
          description: `Lieferschein ${deliveryNote.number} aus Auftrag ${order.number} erstellt`,
          userId,
          companyId,
          retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        },
      });

      return deliveryNote;
    });
  }

  async duplicate(id: string, companyId: string, userId: string) {
    const original = await this.prisma.order.findFirst({
      where: { id, companyId },
      include: { items: true },
    });

    if (!original) throw new NotFoundException('Order not found');

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id: companyId },
        data: { orderCounter: { increment: 1 } },
        select: { orderCounter: true },
      });

      const number = `AB-${new Date().getFullYear()}-${String(company.orderCounter).padStart(4, '0')}`;

      const newOrder = await tx.order.create({
        data: {
          number,
          customerId: original.customerId,
          projectId: original.projectId,
          status: DocumentStatus.DRAFT,
          date: new Date(),
          deliveryAddress: (original.deliveryAddress as any) ?? undefined,
          notes: original.notes,
          subtotal: original.subtotal,
          vatAmount: original.vatAmount,
          total: original.total,
          companyId,
          createdById: userId,
          items: {
            create: original.items.map((item, index) => ({
              position: index + 1,
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              discount: item.discount,
              vatRate: 'STANDARD',
              total: item.total,
            })),
          },
        },
        include: ORDER_FULL_INCLUDE,
      });

      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          module: 'ORDERS',
          entityId: newOrder.id,
          entityType: 'Order',
          entityName: newOrder.number,
          description: `Auftrag ${newOrder.number} dupliziert von ${original.number}`,
          oldValues: { sourceOrderId: original.id, sourceOrderNumber: original.number },
          newValues: { newOrderId: newOrder.id, newOrderNumber: newOrder.number },
          retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
          companyId,
          userId,
        },
      });

      return mapOrderResponse(newOrder);
    });
  }

  async updateStatus(id: string, companyId: string, status: DocumentStatus, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, companyId },
    });

    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id },
        data: { status, updatedByUserId: userId },
        include: ORDER_FULL_INCLUDE,
      });

      await tx.auditLog.create({
        data: {
          action: status === DocumentStatus.CANCELLED ? 'DELETE' : 'UPDATE',
          module: 'ORDERS',
          entityId: id,
          entityType: 'Order',
          entityName: result.number,
          description: `Auftrag ${result.number} Status geändert: ${order.status} → ${status}`,
          oldValues: { status: order.status },
          newValues: { status },
          retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
          companyId,
          userId,
        },
      });

      return result;
    });

    return mapOrderResponse(updated);
  }

  async remove(id: string, companyId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, companyId },
      include: { _count: { select: { invoices: true, deliveryNotes: true } } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order._count.invoices > 0 || order._count.deliveryNotes > 0) {
      throw new BadRequestException('Cannot delete order with linked invoices or delivery notes');
    }

    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    return this.prisma.order.delete({ where: { id } });
  }
}
