import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const quoteItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).max(100).optional(),
  vatRate: z.enum(['STANDARD', 'REDUCED', 'SPECIAL', 'EXEMPT']).default('STANDARD'),
});

const quoteSchema = z.object({
  customerId: z.string(),
  validUntil: z.string().transform((s) => new Date(s)),
  billingAddress: z.any().optional(),
  shippingAddress: z.any().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(quoteItemSchema),
});

// VAT rates in Switzerland
const VAT_RATES = {
  STANDARD: 0.081,
  REDUCED: 0.026,
  SPECIAL: 0.038,
  EXEMPT: 0,
};

const quoteRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // List quotes
  fastify.get('/', async (request: any) => {
    const { customerId, status, limit = 50, offset = 0 } = request.query as any;

    const where: any = {
      companyId: request.user.companyId,
    };

    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [quotes, total] = await Promise.all([
      fastify.prisma.quote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
          customer: true,
          createdBy: {
            select: { firstName: true, lastName: true },
          },
          _count: { select: { items: true } },
        },
      }),
      fastify.prisma.quote.count({ where }),
    ]);

    return { quotes, total };
  });

  // Get single quote
  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params;

    const quote = await fastify.prisma.quote.findFirst({
      where: {
        id,
        companyId: request.user.companyId,
      },
      include: {
        customer: true,
        items: {
          orderBy: { position: 'asc' },
          include: { product: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!quote) {
      return reply.status(404).send({ error: 'Angebot nicht gefunden' });
    }

    return quote;
  });

  // Create quote
  fastify.post('/', async (request: any) => {
    const data = quoteSchema.parse(request.body);

    // Get company for counter
    const company = await fastify.prisma.company.findUnique({
      where: { id: request.user.companyId },
    });

    if (!company) throw new Error('Company not found');

    const year = new Date().getFullYear();
    const counter = company.quoteCounter + 1;
    const number = `AN-${year}-${String(counter).padStart(4, '0')}`;

    // Calculate totals
    let subtotal = 0;
    let totalVat = 0;

    const itemsWithTotals = data.items.map((item, index) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discountAmount = item.discount ? itemSubtotal * (item.discount / 100) : 0;
      const itemTotal = itemSubtotal - discountAmount;
      const itemVat = itemTotal * VAT_RATES[item.vatRate];

      subtotal += itemTotal;
      totalVat += itemVat;

      return {
        ...item,
        position: index + 1,
        total: itemTotal,
      };
    });

    const discountAmount = data.discountPercent ? subtotal * (data.discountPercent / 100) : 0;
    const discountedSubtotal = subtotal - discountAmount;
    const total = discountedSubtotal + totalVat;

    // Create in transaction
    const quote = await fastify.prisma.$transaction(async (tx) => {
      // Update counter
      await tx.company.update({
        where: { id: request.user.companyId },
        data: { quoteCounter: counter },
      });

      // Create quote with items
      return tx.quote.create({
        data: {
          number,
          customerId: data.customerId,
          date: new Date(),
          validUntil: data.validUntil,
          status: 'DRAFT',
          billingAddress: data.billingAddress,
          shippingAddress: data.shippingAddress,
          subtotal,
          discountPercent: data.discountPercent,
          discountAmount,
          vatAmount: totalVat,
          total,
          notes: data.notes,
          internalNotes: data.internalNotes,
          terms: data.terms,
          createdById: request.user.id,
          companyId: request.user.companyId,
          items: {
            create: itemsWithTotals,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });

    // Audit log
    await fastify.prisma.auditLog.create({
      data: {
        userId: request.user.id,
        action: 'CREATE',
        entityType: 'quote',
        entityId: quote.id,
        newValue: { number: quote.number, total: quote.total } as any,
      },
    });

    return quote;
  });

  // Update quote status
  fastify.patch('/:id/status', async (request: any, reply) => {
    const { id } = request.params;
    const { status } = z.object({
      status: z.enum(['DRAFT', 'SENT', 'CONFIRMED', 'CANCELLED']),
    }).parse(request.body);

    const quote = await fastify.prisma.quote.findFirst({
      where: { id, companyId: request.user.companyId },
    });

    if (!quote) {
      return reply.status(404).send({ error: 'Angebot nicht gefunden' });
    }

    const updated = await fastify.prisma.quote.update({
      where: { id },
      data: { status },
    });

    return updated;
  });

  // Convert quote to order
  fastify.post('/:id/convert-to-order', async (request: any, reply) => {
    const { id } = request.params;

    const quote = await fastify.prisma.quote.findFirst({
      where: { id, companyId: request.user.companyId },
      include: { items: true, customer: true },
    });

    if (!quote) {
      return reply.status(404).send({ error: 'Angebot nicht gefunden' });
    }

    if (quote.status !== 'CONFIRMED') {
      return reply.status(400).send({ error: 'Nur bestätigte Angebote können konvertiert werden' });
    }

    // Get company for order counter
    const company = await fastify.prisma.company.findUnique({
      where: { id: request.user.companyId },
    });

    if (!company) throw new Error('Company not found');

    const year = new Date().getFullYear();
    const counter = company.orderCounter + 1;
    const orderNumber = `AU-${year}-${String(counter).padStart(4, '0')}`;

    // Create order in transaction
    const order = await fastify.prisma.$transaction(async (tx) => {
      await tx.company.update({
        where: { id: request.user.companyId },
        data: { orderCounter: counter },
      });

      return tx.order.create({
        data: {
          number: orderNumber,
          customerId: quote.customerId,
          quoteId: quote.id,
          date: new Date(),
          status: 'DRAFT',
          billingAddress: quote.billingAddress ?? undefined,
          shippingAddress: quote.shippingAddress ?? undefined,
          subtotal: quote.subtotal,
          discountPercent: quote.discountPercent,
          discountAmount: quote.discountAmount,
          vatAmount: quote.vatAmount,
          total: quote.total,
          notes: quote.notes,
          internalNotes: quote.internalNotes,
          createdById: request.user.id,
          companyId: request.user.companyId,
          items: {
            create: quote.items.map((item) => ({
              position: item.position,
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              discount: item.discount,
              vatRate: item.vatRate,
              total: item.total,
            })),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });

    return order;
  });

  // Delete quote
  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params;

    const quote = await fastify.prisma.quote.findFirst({
      where: { id, companyId: request.user.companyId },
    });

    if (!quote) {
      return reply.status(404).send({ error: 'Angebot nicht gefunden' });
    }

    if (quote.status !== 'DRAFT') {
      return reply.status(400).send({ error: 'Nur Entwürfe können gelöscht werden' });
    }

    await fastify.prisma.quote.delete({ where: { id } });

    await fastify.prisma.auditLog.create({
      data: {
        userId: request.user.id,
        action: 'DELETE',
        entityType: 'quote',
        entityId: id,
        oldValue: { number: quote.number } as any,
      },
    });

    return { success: true };
  });
};

export default quoteRoutes;
