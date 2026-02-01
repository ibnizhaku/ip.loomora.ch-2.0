import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const invoiceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // List invoices
  fastify.get('/', async (request: any) => {
    const { customerId, status, limit = 50, offset = 0 } = request.query as any;

    const where: any = {
      companyId: request.user.companyId,
    };

    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      fastify.prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
          customer: true,
          order: { select: { number: true } },
          createdBy: { select: { firstName: true, lastName: true } },
          _count: { select: { items: true, payments: true, reminders: true } },
        },
      }),
      fastify.prisma.invoice.count({ where }),
    ]);

    return { invoices, total };
  });

  // Get single invoice
  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params;

    const invoice = await fastify.prisma.invoice.findFirst({
      where: { id, companyId: request.user.companyId },
      include: {
        customer: true,
        order: { select: { id: true, number: true } },
        items: {
          orderBy: { position: 'asc' },
          include: { product: true },
        },
        payments: { orderBy: { date: 'desc' } },
        reminders: { orderBy: { level: 'asc' } },
        creditNotes: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!invoice) {
      return reply.status(404).send({ error: 'Rechnung nicht gefunden' });
    }

    return invoice;
  });

  // Update invoice status
  fastify.patch('/:id/status', async (request: any, reply) => {
    const { id } = request.params;
    const { status } = z.object({
      status: z.enum(['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED']),
    }).parse(request.body);

    const invoice = await fastify.prisma.invoice.findFirst({
      where: { id, companyId: request.user.companyId },
    });

    if (!invoice) {
      return reply.status(404).send({ error: 'Rechnung nicht gefunden' });
    }

    const updated = await fastify.prisma.invoice.update({
      where: { id },
      data: { status },
    });

    return updated;
  });

  // Record payment
  fastify.post('/:id/payments', async (request: any, reply) => {
    const { id } = request.params;
    const schema = z.object({
      amount: z.number().positive(),
      method: z.enum(['BANK_TRANSFER', 'CREDIT_CARD', 'TWINT', 'PAYPAL', 'CASH', 'INVOICE']),
      date: z.string().transform((s) => new Date(s)).optional(),
      reference: z.string().optional(),
      notes: z.string().optional(),
      bankAccountId: z.string().optional(),
    });

    const data = schema.parse(request.body);

    const invoice = await fastify.prisma.invoice.findFirst({
      where: { id, companyId: request.user.companyId },
    });

    if (!invoice) {
      return reply.status(404).send({ error: 'Rechnung nicht gefunden' });
    }

    const newPaidAmount = Number(invoice.paidAmount) + data.amount;
    const remaining = Number(invoice.total) - newPaidAmount;

    // Determine new status
    let newStatus = invoice.status;
    if (remaining <= 0) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIAL';
    }

    // Create payment and update invoice
    const [payment] = await fastify.prisma.$transaction([
      fastify.prisma.payment.create({
        data: {
          invoiceId: id,
          customerId: invoice.customerId,
          amount: data.amount,
          method: data.method,
          date: data.date || new Date(),
          reference: data.reference,
          notes: data.notes,
          bankAccountId: data.bankAccountId,
          companyId: request.user.companyId,
        },
      }),
      fastify.prisma.invoice.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      }),
    ]);

    // Audit log
    await fastify.prisma.auditLog.create({
      data: {
        userId: request.user.id,
        action: 'CREATE',
        entityType: 'payment',
        entityId: payment.id,
        newValue: {
          invoiceNumber: invoice.number,
          amount: data.amount,
          method: data.method,
        } as any,
      },
    });

    return payment;
  });

  // Create reminder (Mahnung)
  fastify.post('/:id/reminders', async (request: any, reply) => {
    const { id } = request.params;

    const invoice = await fastify.prisma.invoice.findFirst({
      where: { id, companyId: request.user.companyId },
      include: { reminders: true },
    });

    if (!invoice) {
      return reply.status(404).send({ error: 'Rechnung nicht gefunden' });
    }

    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
      return reply.status(400).send({ error: 'Rechnung ist bereits bezahlt oder storniert' });
    }

    // Determine reminder level
    const existingLevels = invoice.reminders.map((r) => r.level);
    let nextLevel: 'FIRST' | 'SECOND' | 'THIRD';
    let fee = 0;

    if (!existingLevels.includes('FIRST')) {
      nextLevel = 'FIRST';
      fee = 0; // First reminder usually free
    } else if (!existingLevels.includes('SECOND')) {
      nextLevel = 'SECOND';
      fee = 20; // CHF 20 fee
    } else if (!existingLevels.includes('THIRD')) {
      nextLevel = 'THIRD';
      fee = 40; // CHF 40 fee
    } else {
      return reply.status(400).send({ error: 'Maximale Anzahl Mahnungen erreicht' });
    }

    // Calculate new due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const reminder = await fastify.prisma.reminder.create({
      data: {
        invoiceId: id,
        level: nextLevel,
        sentAt: new Date(),
        dueDate,
        fee,
      },
    });

    // Update invoice status to overdue
    await fastify.prisma.invoice.update({
      where: { id },
      data: { status: 'OVERDUE' },
    });

    return reminder;
  });

  // Create credit note
  fastify.post('/:id/credit-note', async (request: any, reply) => {
    const { id } = request.params;
    const schema = z.object({
      reason: z.string(),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        unitPrice: z.number().min(0),
        vatRate: z.enum(['STANDARD', 'REDUCED', 'SPECIAL', 'EXEMPT']).default('STANDARD'),
      })),
    });

    const data = schema.parse(request.body);

    const invoice = await fastify.prisma.invoice.findFirst({
      where: { id, companyId: request.user.companyId },
    });

    if (!invoice) {
      return reply.status(404).send({ error: 'Rechnung nicht gefunden' });
    }

    const company = await fastify.prisma.company.findUnique({
      where: { id: request.user.companyId },
    });

    if (!company) throw new Error('Company not found');

    const year = new Date().getFullYear();
    const counter = company.creditNoteCounter + 1;
    const number = `GS-${year}-${String(counter).padStart(4, '0')}`;

    // Calculate totals
    const VAT_RATES = {
      STANDARD: 0.081,
      REDUCED: 0.026,
      SPECIAL: 0.038,
      EXEMPT: 0,
    };

    let subtotal = 0;
    let vatAmount = 0;

    const itemsWithTotals = data.items.map((item, index) => {
      const total = item.quantity * item.unitPrice;
      const vat = total * VAT_RATES[item.vatRate];
      subtotal += total;
      vatAmount += vat;

      return {
        ...item,
        position: index + 1,
        total,
      };
    });

    const total = subtotal + vatAmount;

    const creditNote = await fastify.prisma.$transaction(async (tx) => {
      await tx.company.update({
        where: { id: request.user.companyId },
        data: { creditNoteCounter: counter },
      });

      return tx.creditNote.create({
        data: {
          number,
          customerId: invoice.customerId,
          invoiceId: id,
          date: new Date(),
          reason: data.reason,
          subtotal,
          vatAmount,
          total,
          companyId: request.user.companyId,
          items: {
            create: itemsWithTotals,
          },
        },
        include: { items: true },
      });
    });

    return creditNote;
  });

  // Get overdue invoices (for automatic reminder generation)
  fastify.get('/overdue', async (request: any) => {
    const today = new Date();

    const overdueInvoices = await fastify.prisma.invoice.findMany({
      where: {
        companyId: request.user.companyId,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        dueDate: { lt: today },
      },
      include: {
        customer: true,
        reminders: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return overdueInvoices;
  });

  // Statistics
  fastify.get('/stats', async (request: any) => {
    const companyId = request.user.companyId;

    const [total, open, overdue, paid, revenue] = await Promise.all([
      fastify.prisma.invoice.count({ where: { companyId } }),
      fastify.prisma.invoice.count({
        where: { companyId, status: { in: ['SENT', 'PARTIAL'] } },
      }),
      fastify.prisma.invoice.count({
        where: { companyId, status: 'OVERDUE' },
      }),
      fastify.prisma.invoice.count({
        where: { companyId, status: 'PAID' },
      }),
      fastify.prisma.invoice.aggregate({
        where: { companyId, status: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    return {
      total,
      open,
      overdue,
      paid,
      revenue: revenue._sum.total || 0,
    };
  });
};

export default invoiceRoutes;
