import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeliveryNoteDto, UpdateDeliveryNoteDto, DeliveryNoteStatus } from './dto/delivery-note.dto';
import { mapDeliveryNoteResponse } from '../../common/mappers/response.mapper';

@Injectable()
export class DeliveryNotesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    customerId?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, customerId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.deliveryNote.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          order: { select: { id: true, number: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
      }),
      this.prisma.deliveryNote.count({ where }),
    ]);

    return {
      data: data.map(mapDeliveryNoteResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const deliveryNote = await this.prisma.deliveryNote.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        order: { select: { id: true, number: true } },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!deliveryNote) {
      throw new NotFoundException('Lieferschein nicht gefunden');
    }

    return mapDeliveryNoteResponse(deliveryNote);
  }

  async create(companyId: string, dto: CreateDeliveryNoteDto) {
    // Generate delivery note number
    const count = await this.prisma.deliveryNote.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `LS-${year}-${String(count + 1).padStart(4, '0')}`;

    const status = dto.status || DeliveryNoteStatus.DRAFT;

    const created = await this.prisma.deliveryNote.create({
      data: {
        companyId,
        customerId: dto.customerId,
        orderId: dto.orderId,
        number,
        status,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        deliveryAddress: dto.deliveryAddress,
        notes: dto.notes,
        carrier: dto.carrier,
        trackingNumber: dto.trackingNumber,
        shippedAt: status === DeliveryNoteStatus.SHIPPED ? new Date() : undefined,
        items: {
          create: dto.items.map((item, index) => ({
            productId: item.productId || undefined,
            quantity: item.quantity,
            unit: item.unit || 'Stk',
            description: item.description,
            position: item.position || index + 1,
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
    return mapDeliveryNoteResponse(created);
  }

  async update(id: string, companyId: string, dto: UpdateDeliveryNoteDto) {
    const deliveryNote = await this.findOne(id, companyId);

    // If items are provided, delete existing and create new
    if (dto.items) {
      await this.prisma.deliveryNoteItem.deleteMany({
        where: { deliveryNoteId: id },
      });
    }

    const updated = await this.prisma.deliveryNote.update({
      where: { id },
      data: {
        status: dto.status,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        deliveryAddress: dto.deliveryAddress,
        notes: dto.notes,
        carrier: dto.carrier,
        trackingNumber: dto.trackingNumber,
        shippedAt: dto.status === DeliveryNoteStatus.SHIPPED ? new Date() : undefined,
        deliveredAt: dto.status === DeliveryNoteStatus.DELIVERED ? new Date() : undefined,
        items: dto.items ? {
          create: dto.items.map((item, index) => ({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit || 'Stk',
            description: item.description,
            position: index + 1,
          })),
        } : undefined,
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
    return mapDeliveryNoteResponse(updated);
  }

  async ship(id: string, companyId: string, dto?: { carrier?: string; trackingNumber?: string }) {
    const deliveryNote = await this.prisma.deliveryNote.findFirst({
      where: { id, companyId },
    });

    if (!deliveryNote) throw new NotFoundException('Lieferschein nicht gefunden');

    if (deliveryNote.status !== 'DRAFT') {
      throw new BadRequestException('Nur Entwürfe können versendet werden');
    }

    const updated = await this.prisma.deliveryNote.update({
      where: { id },
      data: {
        status: 'SHIPPED',
        shippedAt: new Date(),
        carrier: dto?.carrier || deliveryNote.carrier,
        trackingNumber: dto?.trackingNumber || deliveryNote.trackingNumber,
      },
      include: {
        customer: true,
        order: { select: { id: true, number: true } },
        items: { include: { product: true } },
      },
    });

    return mapDeliveryNoteResponse(updated);
  }

  async delete(id: string, companyId: string) {
    await this.findOne(id, companyId);
    
    await this.prisma.deliveryNoteItem.deleteMany({
      where: { deliveryNoteId: id },
    });

    return this.prisma.deliveryNote.delete({ where: { id } });
  }

  async getStats(companyId: string) {
    const [total, draft, shipped, delivered] = await Promise.all([
      this.prisma.deliveryNote.count({ where: { companyId } }),
      this.prisma.deliveryNote.count({ where: { companyId, status: 'DRAFT' } }),
      this.prisma.deliveryNote.count({ where: { companyId, status: 'SHIPPED' } }),
      this.prisma.deliveryNote.count({ where: { companyId, status: 'DELIVERED' } }),
    ]);
    return { total, draft, shipped, delivered };
  }

  // Convert from order
  async createFromOrder(orderId: string, companyId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, companyId },
      include: { items: true, customer: true },
    });

    if (!order) {
      throw new NotFoundException('Auftrag nicht gefunden');
    }

    const count = await this.prisma.deliveryNote.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `LS-${year}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.deliveryNote.create({
      data: {
        companyId,
        customerId: order.customerId,
        orderId: order.id,
        number,
        status: DeliveryNoteStatus.DRAFT,
        deliveryAddress: `${order.customer.street || ''}, ${order.customer.zipCode || ''} ${order.customer.city || ''}`.trim(),
        items: {
          create: order.items.map((item, index) => ({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit || 'Stk',
            description: item.description,
            position: index + 1,
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
  }
}
