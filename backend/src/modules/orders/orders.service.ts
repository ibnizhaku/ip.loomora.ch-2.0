import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { DocumentStatus, InvoiceStatus } from '@prisma/client';
import { mapOrderResponse } from '../../common/mappers/response.mapper';

@Injectable()
export class OrdersService {
  private readonly VAT_RATE = 0.081;

  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto & { status?: string; customerId?: string }) {
    const { page = 1, pageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, customerId } = query;
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
      include: {
        customer: true,
        project: true,
        quote: true,
        items: {
          orderBy: { position: 'asc' },
          include: { product: true },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
        deliveryNotes: {
          orderBy: { createdAt: 'desc' },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
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

    return this.prisma.order.create({
      data: {
        number,
        customerId: dto.customerId,
        projectId: dto.projectId,
        quoteId: dto.quoteId,
        status: DocumentStatus.CONFIRMED,
        date: dto.orderDate ? new Date(dto.orderDate) : new Date(),
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        shippingAddress: dto.deliveryAddress ? { address: dto.deliveryAddress } : undefined,
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
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findFirst({
      where: { id, companyId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
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

      await this.prisma.orderItem.deleteMany({ where: { orderId: id } });

      return this.prisma.order.update({
        where: { id },
        data: {
          customerId: dto.customerId,
          projectId: dto.projectId,
          status: dto.status,
          date: dto.orderDate ? new Date(dto.orderDate) : undefined,
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
          shippingAddress: dto.deliveryAddress ? { address: dto.deliveryAddress } : undefined,
          subtotal,
          vatAmount,
          total,
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
              vatRate: 'STANDARD',
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

    return this.prisma.order.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        projectId: dto.projectId,
        status: dto.status,
        date: dto.orderDate ? new Date(dto.orderDate) : undefined,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        shippingAddress: dto.deliveryAddress ? { address: dto.deliveryAddress } : undefined,
        notes: dto.notes,
        internalNotes: dto.internalNotes,
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async createInvoice(id: string, companyId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, companyId },
      include: { items: true, customer: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Generate invoice number
    const year = new Date().getFullYear();
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { companyId, number: { startsWith: `RE-${year}` } },
      orderBy: { number: 'desc' },
    });
    
    const lastNum = lastInvoice?.number 
      ? parseInt(lastInvoice.number.split('-')[2] || '0') 
      : 0;
    const invoiceNumber = `RE-${year}-${String(lastNum + 1).padStart(3, '0')}`;

    // Generate QR reference (simplified)
    const qrReference = String(Date.now()).padStart(27, '0');

    const invoice = await this.prisma.invoice.create({
      data: {
        number: invoiceNumber,
        customerId: order.customerId,
        projectId: order.projectId,
        orderId: order.id,
        status: InvoiceStatus.DRAFT,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: order.subtotal,
        vatAmount: order.vatAmount,
        totalAmount: order.total,
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

    return invoice;
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
