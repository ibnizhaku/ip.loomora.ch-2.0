import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1),
  companyName: z.string().optional(),
  salutation: z.string().optional(),
  street: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('CH'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().optional(),
  vatNumber: z.string().optional(),
  paymentTermDays: z.number().default(30),
  creditLimit: z.number().optional(),
  discount: z.number().optional(),
  notes: z.string().optional(),
});

const customerRoutes: FastifyPluginAsync = async (fastify) => {
  // All routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // List customers
  fastify.get('/', async (request: any) => {
    const { search, limit = 50, offset = 0 } = request.query as any;

    const where: any = {
      companyId: request.user.companyId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      fastify.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
          _count: {
            select: {
              invoices: true,
              orders: true,
            },
          },
        },
      }),
      fastify.prisma.customer.count({ where }),
    ]);

    return { customers, total };
  });

  // Get single customer
  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params;

    const customer = await fastify.prisma.customer.findFirst({
      where: {
        id,
        companyId: request.user.companyId,
      },
      include: {
        contacts: true,
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return reply.status(404).send({ error: 'Kunde nicht gefunden' });
    }

    return customer;
  });

  // Create customer
  fastify.post('/', async (request: any) => {
    const data = customerSchema.parse(request.body);

    // Generate customer number
    const company = await fastify.prisma.company.findUnique({
      where: { id: request.user.companyId },
    });

    const customerCount = await fastify.prisma.customer.count({
      where: { companyId: request.user.companyId },
    });

    const number = `KD-${String(customerCount + 1).padStart(4, '0')}`;

    const customer = await fastify.prisma.customer.create({
      data: {
        ...data,
        number,
        companyId: request.user.companyId,
      },
    });

    // Audit log
    await fastify.prisma.auditLog.create({
      data: {
        userId: request.user.id,
        action: 'CREATE',
        entityType: 'customer',
        entityId: customer.id,
        newValue: customer as any,
      },
    });

    return customer;
  });

  // Update customer
  fastify.put('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const data = customerSchema.partial().parse(request.body);

    const existing = await fastify.prisma.customer.findFirst({
      where: {
        id,
        companyId: request.user.companyId,
      },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Kunde nicht gefunden' });
    }

    const customer = await fastify.prisma.customer.update({
      where: { id },
      data,
    });

    // Audit log
    await fastify.prisma.auditLog.create({
      data: {
        userId: request.user.id,
        action: 'UPDATE',
        entityType: 'customer',
        entityId: customer.id,
        oldValue: existing as any,
        newValue: customer as any,
      },
    });

    return customer;
  });

  // Delete customer (soft delete)
  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params;

    const existing = await fastify.prisma.customer.findFirst({
      where: {
        id,
        companyId: request.user.companyId,
      },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Kunde nicht gefunden' });
    }

    const customer = await fastify.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit log
    await fastify.prisma.auditLog.create({
      data: {
        userId: request.user.id,
        action: 'DELETE',
        entityType: 'customer',
        entityId: customer.id,
        oldValue: existing as any,
      },
    });

    return { success: true };
  });
};

export default customerRoutes;
