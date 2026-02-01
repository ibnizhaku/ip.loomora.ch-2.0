import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function supplierRoutes(fastify: FastifyInstance) {
  // Get all suppliers with pagination
  fastify.get('/suppliers', async (request, reply) => {
    const { page = 1, pageSize = 20, search, sortBy = 'name', sortOrder = 'asc' } = request.query as any;
    const user = (request as any).user;

    const where: any = {
      companyId: user.companyId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { purchaseOrders: true },
          },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    // Calculate aggregates
    const suppliersWithStats = await Promise.all(
      suppliers.map(async (supplier) => {
        const orderStats = await prisma.purchaseOrder.aggregate({
          where: { 
            supplierId: supplier.id,
            status: { not: 'CANCELLED' },
          },
          _sum: { total: true },
          _count: true,
        });

        return {
          ...supplier,
          totalOrders: orderStats._count,
          totalValue: orderStats._sum.total || 0,
        };
      })
    );

    return {
      data: suppliersWithStats,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize)),
    };
  });

  // Get single supplier
  fastify.get('/suppliers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    const supplier = await prisma.supplier.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        products: {
          take: 10,
          orderBy: { name: 'asc' },
        },
        purchaseOrders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!supplier) {
      return reply.status(404).send({ error: 'Lieferant nicht gefunden' });
    }

    // Calculate stats
    const orderStats = await prisma.purchaseOrder.aggregate({
      where: { 
        supplierId: supplier.id,
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
      _count: true,
    });

    return {
      ...supplier,
      totalOrders: orderStats._count,
      totalValue: orderStats._sum.total || 0,
    };
  });

  // Create supplier
  fastify.post('/suppliers', async (request, reply) => {
    const user = (request as any).user;
    const data = request.body as any;

    // Generate supplier number if not provided
    if (!data.number) {
      const lastSupplier = await prisma.supplier.findFirst({
        where: { companyId: user.companyId },
        orderBy: { number: 'desc' },
      });
      
      const lastNum = lastSupplier?.number 
        ? parseInt(lastSupplier.number.replace(/\D/g, '')) || 0 
        : 0;
      data.number = `LF-${String(lastNum + 1).padStart(4, '0')}`;
    }

    const supplier = await prisma.supplier.create({
      data: {
        ...data,
        companyId: user.companyId,
      },
    });

    return supplier;
  });

  // Update supplier
  fastify.put('/suppliers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;
    const data = request.body as any;

    const existing = await prisma.supplier.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Lieferant nicht gefunden' });
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data,
    });

    return supplier;
  });

  // Delete supplier
  fastify.delete('/suppliers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    const existing = await prisma.supplier.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Lieferant nicht gefunden' });
    }

    // Check for related records
    const relatedOrders = await prisma.purchaseOrder.count({
      where: { supplierId: id },
    });

    if (relatedOrders > 0) {
      // Soft delete - just deactivate
      await prisma.supplier.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Lieferant wurde deaktiviert (hat verknüpfte Bestellungen)' };
    }

    await prisma.supplier.delete({ where: { id } });
    return { message: 'Lieferant gelöscht' };
  });
}
