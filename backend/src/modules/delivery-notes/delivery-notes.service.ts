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
    orderId?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, customerId, orderId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (orderId) where.orderId = orderId;
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
          items: { select: { id: true } },
          _count: { select: { items: true } },
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
          orderBy: { position: 'asc' },
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    if (!deliveryNote) {
      throw new NotFoundException('Lieferschein nicht gefunden');
    }

    return mapDeliveryNoteResponse(deliveryNote);
  }

  async create(companyId: string, dto: CreateDeliveryNoteDto, userId?: string) {
    if (!dto.orderId) {
      throw new BadRequestException('Ein Lieferschein muss einem Auftrag zugeordnet sein.');
    }

    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, companyId },
      include: { customer: true },
    });
    if (!order) {
      throw new NotFoundException('Auftrag nicht gefunden oder keine Berechtigung.');
    }

    const status = dto.status || DeliveryNoteStatus.DRAFT;

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id: companyId },
        data: { deliveryCounter: { increment: 1 } },
        select: { deliveryCounter: true },
      });

      const number = `LS-${new Date().getFullYear()}-${String(company.deliveryCounter).padStart(4, '0')}`;

      const deliveryNote = await tx.deliveryNote.create({
        data: {
          companyId,
          customerId: dto.customerId || order.customerId,
          orderId: dto.orderId,
          number,
          status,
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : new Date(),
          deliveryAddress: (dto.deliveryAddress as any) ?? undefined,
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
          order: { select: { id: true, number: true } },
          items: { include: { product: true } },
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            action: 'CREATE',
            module: 'DOCUMENTS',
            entityId: deliveryNote.id,
            entityType: 'DeliveryNote',
            entityName: deliveryNote.number,
            description: `Lieferschein ${deliveryNote.number} für Auftrag ${order.number} erstellt`,
            userId,
            companyId,
            retentionUntil: new Date(Date.now() + 10 * 365.25 * 24 * 60 * 60 * 1000),
          },
        });
      }

      return mapDeliveryNoteResponse(deliveryNote);
    });
  }

  async createFromOrder(orderId: string, companyId: string, userId?: string, itemIds?: string[]) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, companyId },
      include: { items: true, customer: true },
    });

    if (!order) {
      throw new NotFoundException('Auftrag nicht gefunden');
    }

    // Wenn itemIds angegeben → nur diese Positionen verwenden, sonst alle
    const selectedItems = itemIds && itemIds.length > 0
      ? order.items.filter((item) => itemIds.includes(item.id))
      : order.items;

    if (selectedItems.length === 0) {
      throw new BadRequestException('Keine Auftragspositionen für den Lieferschein gefunden');
    }

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id: companyId },
        data: { deliveryCounter: { increment: 1 } },
        select: { deliveryCounter: true },
      });

      const number = `LS-${new Date().getFullYear()}-${String(company.deliveryCounter).padStart(4, '0')}`;

      const deliveryAddress = [
        order.customer.street,
        order.customer.zipCode && order.customer.city
          ? `${order.customer.zipCode} ${order.customer.city}`
          : order.customer.city,
      ]
        .filter(Boolean)
        .join(', ');

      const deliveryNote = await tx.deliveryNote.create({
        data: {
          companyId,
          customerId: order.customerId,
          orderId: order.id,
          number,
          status: DeliveryNoteStatus.DRAFT,
          deliveryDate: new Date(),
          deliveryAddress: deliveryAddress ? { address: deliveryAddress } : undefined,
          items: {
            create: selectedItems.map((item, index) => ({
              productId: item.productId || undefined,
              quantity: item.quantity,
              unit: item.unit || 'Stk',
              description: item.description,
              position: index + 1,
            })),
          },
        },
        include: {
          customer: true,
          order: { select: { id: true, number: true } },
          items: { orderBy: { position: 'asc' }, include: { product: true } },
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            action: 'CREATE',
            module: 'DOCUMENTS',
            entityId: deliveryNote.id,
            entityType: 'DeliveryNote',
            entityName: deliveryNote.number,
            description: `Lieferschein ${deliveryNote.number} aus Auftrag ${order.number} erstellt${itemIds?.length ? ` (${selectedItems.length} Positionen)` : ''}`,
            userId,
            companyId,
            retentionUntil: new Date(Date.now() + 10 * 365.25 * 24 * 60 * 60 * 1000),
          },
        });
      }

      return mapDeliveryNoteResponse(deliveryNote);
    });
  }

  async update(id: string, companyId: string, dto: UpdateDeliveryNoteDto) {
    await this.findOne(id, companyId);

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
        deliveryAddress: (dto.deliveryAddress as any) ?? undefined,
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
        order: { select: { id: true, number: true } },
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
}
