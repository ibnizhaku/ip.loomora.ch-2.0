import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { DocumentStatus } from '@prisma/client';
import { mapQuoteResponse } from '../../common/mappers/response.mapper';

@Injectable()
export class QuotesService {
  private readonly VAT_RATE = 0.081; // Swiss 8.1%

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
      this.prisma.quote.findMany({
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
            select: { items: true },
          },
        },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return {
      data: data.map(mapQuoteResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        project: true,
        items: {
          orderBy: { position: 'asc' },
          include: {
            product: true,
          },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return mapQuoteResponse(quote);
  }

  async create(companyId: string, userId: string, dto: CreateQuoteDto) {
    // Generate quote number
    let number = dto.number;
    if (!number) {
      const year = new Date().getFullYear();
      const lastQuote = await this.prisma.quote.findFirst({
        where: { companyId, number: { startsWith: `OFF-${year}` } },
        orderBy: { number: 'desc' },
      });
      
      const lastNum = lastQuote?.number 
        ? parseInt(lastQuote.number.split('-')[2] || '0') 
        : 0;
      number = `OFF-${year}-${String(lastNum + 1).padStart(3, '0')}`;
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

    const created = await this.prisma.quote.create({
      data: {
        number,
        customerId: dto.customerId,
        projectId: dto.projectId,
        status: DocumentStatus.DRAFT,
        date: dto.issueDate ? new Date(dto.issueDate) : new Date(),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
    return mapQuoteResponse(created);
  }

  async update(id: string, companyId: string, dto: UpdateQuoteDto) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, companyId },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // If items are being updated, recalculate totals
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

      // Delete existing items and create new ones
      await this.prisma.quoteItem.deleteMany({ where: { quoteId: id } });

      const updated = await this.prisma.quote.update({
        where: { id },
        data: {
          customerId: dto.customerId,
          projectId: dto.projectId,
          status: dto.status,
          date: dto.issueDate ? new Date(dto.issueDate) : undefined,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
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
      return mapQuoteResponse(updated);
    }

    const updated = await this.prisma.quote.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        projectId: dto.projectId,
        status: dto.status,
        date: dto.issueDate ? new Date(dto.issueDate) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        notes: dto.notes,
        internalNotes: dto.internalNotes,
      },
      include: {
        customer: true,
        items: true,
      },
    });
    return mapQuoteResponse(updated);
  }

  async convertToOrder(id: string, companyId: string, userId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, companyId },
      include: { items: true, customer: true },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    if (quote.status !== DocumentStatus.SENT && quote.status !== DocumentStatus.CONFIRMED) {
      throw new BadRequestException('Quote must be sent or confirmed to convert to order');
    }

    // Generate order number
    const year = new Date().getFullYear();
    const lastOrder = await this.prisma.order.findFirst({
      where: { companyId, number: { startsWith: `AB-${year}` } },
      orderBy: { number: 'desc' },
    });
    
    const lastNum = lastOrder?.number 
      ? parseInt(lastOrder.number.split('-')[2] || '0') 
      : 0;
    const orderNumber = `AB-${year}-${String(lastNum + 1).padStart(3, '0')}`;

    // Create order from quote
    const order = await this.prisma.order.create({
      data: {
        number: orderNumber,
        customerId: quote.customerId,
        projectId: quote.projectId,
        quoteId: quote.id,
        status: DocumentStatus.CONFIRMED,
        date: new Date(),
        subtotal: quote.subtotal,
        vatAmount: quote.vatAmount,
        total: quote.total,
        notes: quote.notes,
        companyId,
        createdById: userId,
        items: {
          create: quote.items.map((item, index) => ({
            position: item.position || index + 1,
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
      include: {
        customer: true,
        items: true,
      },
    });

    // Update quote status to confirmed (converted)
    await this.prisma.quote.update({
      where: { id },
      data: { status: DocumentStatus.CONFIRMED },
    });

    return order;
  }

  async remove(id: string, companyId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, companyId },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    if (quote.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException('Only draft quotes can be deleted');
    }

    await this.prisma.quoteItem.deleteMany({ where: { quoteId: id } });
    return this.prisma.quote.delete({ where: { id } });
  }
}
