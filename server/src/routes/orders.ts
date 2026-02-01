import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const orderRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // List orders
  fastify.get('/', async (request: any) => {
    const { customerId, status, limit = 50, offset = 0 } = request.query as any;

    const where: any = {
      companyId: request.user.companyId,
    };

    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      fastify.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
          customer: true,
          quote: { select: { number: true } },
          createdBy: { select: { firstName: true, lastName: true } },
          _count: { select: { items: true, invoices: true, deliveryNotes: true } },
        },
      }),
      fastify.prisma.order.count({ where }),
    ]);

    return { orders, total };
  });

  // Get single order
  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params;

    const order = await fastify.prisma.order.findFirst({
      where: { id, companyId: request.user.companyId },
      include: {
        customer: true,
        quote: { select: { id: true, number: true } },
        items: {
          orderBy: { position: 'asc' },
          include: { product: true },
        },
        invoices: { orderBy: { createdAt: 'desc' } },
        deliveryNotes: { orderBy: { createdAt: 'desc' } },
        createdBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!order) {
      return reply.status(404).send({ error: 'Auftrag nicht gefunden' });
    }

    return order;
  });

  // Update order status
  fastify.patch('/:id/status', async (request: any, reply) => {
    const { id } = request.params;
    const { status } = z.object({
      status: z.enum(['DRAFT', 'SENT', 'CONFIRMED', 'CANCELLED']),
    }).parse(request.body);

    const order = await fastify.prisma.order.findFirst({
      where: { id, companyId: request.user.companyId },
    });

    if (!order) {
      return reply.status(404).send({ error: 'Auftrag nicht gefunden' });
    }

    const updated = await fastify.prisma.order.update({
      where: { id },
      data: { status },
    });

    return updated;
  });

  // Create delivery note from order
  fastify.post('/:id/create-delivery-note', async (request: any, reply) => {
    const { id } = request.params;

    const order = await fastify.prisma.order.findFirst({
      where: { id, companyId: request.user.companyId },
      include: { items: true, customer: true },
    });

    if (!order) {
      return reply.status(404).send({ error: 'Auftrag nicht gefunden' });
    }

    const company = await fastify.prisma.company.findUnique({
      where: { id: request.user.companyId },
    });

    if (!company) throw new Error('Company not found');

    const year = new Date().getFullYear();
    const counter = company.deliveryCounter + 1;
    const number = `LS-${year}-${String(counter).padStart(4, '0')}`;

    const deliveryNote = await fastify.prisma.$transaction(async (tx) => {
      await tx.company.update({
        where: { id: request.user.companyId },
        data: { deliveryCounter: counter },
      });

      return tx.deliveryNote.create({
        data: {
          number,
          customerId: order.customerId,
          orderId: order.id,
          date: new Date(),
          shippingAddress: order.shippingAddress,
          companyId: request.user.companyId,
          items: {
            create: order.items.map((item) => ({
              position: item.position,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
            })),
          },
        },
        include: { items: true },
      });
    });

    return deliveryNote;
  });

  // Create invoice from order
  fastify.post('/:id/create-invoice', async (request: any, reply) => {
    const { id } = request.params;

    const order = await fastify.prisma.order.findFirst({
      where: { id, companyId: request.user.companyId },
      include: { items: true, customer: true },
    });

    if (!order) {
      return reply.status(404).send({ error: 'Auftrag nicht gefunden' });
    }

    const company = await fastify.prisma.company.findUnique({
      where: { id: request.user.companyId },
    });

    if (!company) throw new Error('Company not found');

    const year = new Date().getFullYear();
    const counter = company.invoiceCounter + 1;
    const number = `RE-${year}-${String(counter).padStart(4, '0')}`;

    // Generate QR reference (26 digits)
    const qrReference = generateQRReference(counter);

    // Calculate due date based on customer payment terms
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (order.customer.paymentTermDays || 30));

    const invoice = await fastify.prisma.$transaction(async (tx) => {
      await tx.company.update({
        where: { id: request.user.companyId },
        data: { invoiceCounter: counter },
      });

      return tx.invoice.create({
        data: {
          number,
          customerId: order.customerId,
          orderId: order.id,
          date: new Date(),
          dueDate,
          status: 'DRAFT',
          billingAddress: order.billingAddress,
          subtotal: order.subtotal,
          discountPercent: order.discountPercent,
          discountAmount: order.discountAmount,
          vatAmount: order.vatAmount,
          total: order.total,
          qrReference,
          qrIban: company.iban,
          notes: order.notes,
          createdById: request.user.id,
          companyId: request.user.companyId,
          items: {
            create: order.items.map((item) => ({
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
        include: { items: true, customer: true },
      });
    });

    return invoice;
  });
};

// Generate Swiss QR reference (26 digits with check digit)
function generateQRReference(counter: number): string {
  const base = String(counter).padStart(25, '0');
  const checkDigit = calculateMod10Recursive(base);
  return base + checkDigit;
}

// Mod10 recursive algorithm for Swiss QR reference
function calculateMod10Recursive(input: string): number {
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
  let carry = 0;
  for (const char of input) {
    carry = table[(carry + parseInt(char)) % 10];
  }
  return (10 - carry) % 10;
}

export default orderRoutes;
