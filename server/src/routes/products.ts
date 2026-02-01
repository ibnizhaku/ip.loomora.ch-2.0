import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  unit: z.string().default('Stk'),
  purchasePrice: z.number().min(0),
  salePrice: z.number().min(0),
  vatRate: z.enum(['STANDARD', 'REDUCED', 'SPECIAL', 'EXEMPT']).default('STANDARD'),
  stockQuantity: z.number().default(0),
  minStock: z.number().optional(),
  maxStock: z.number().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  isService: z.boolean().default(false),
  imageUrl: z.string().optional(),
});

const productRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // List products
  fastify.get('/', async (request: any) => {
    const { search, categoryId, limit = 50, offset = 0 } = request.query as any;

    const where: any = {
      companyId: request.user.companyId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      fastify.prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
          category: true,
          supplier: true,
        },
      }),
      fastify.prisma.product.count({ where }),
    ]);

    return { products, total };
  });

  // Get single product
  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params;

    const product = await fastify.prisma.product.findFirst({
      where: {
        id,
        companyId: request.user.companyId,
      },
      include: {
        category: true,
        supplier: true,
        inventoryMovements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return reply.status(404).send({ error: 'Produkt nicht gefunden' });
    }

    return product;
  });

  // Create product
  fastify.post('/', async (request: any) => {
    const data = productSchema.parse(request.body);

    // Generate SKU
    const productCount = await fastify.prisma.product.count({
      where: { companyId: request.user.companyId },
    });

    const sku = `ART-${String(productCount + 1).padStart(4, '0')}`;

    const product = await fastify.prisma.product.create({
      data: {
        ...data,
        sku,
        companyId: request.user.companyId,
      },
    });

    // Audit log
    await fastify.prisma.auditLog.create({
      data: {
        userId: request.user.id,
        action: 'CREATE',
        entityType: 'product',
        entityId: product.id,
        newValue: product as any,
      },
    });

    return product;
  });

  // Update product
  fastify.put('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const data = productSchema.partial().parse(request.body);

    const existing = await fastify.prisma.product.findFirst({
      where: {
        id,
        companyId: request.user.companyId,
      },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Produkt nicht gefunden' });
    }

    const product = await fastify.prisma.product.update({
      where: { id },
      data,
    });

    await fastify.prisma.auditLog.create({
      data: {
        userId: request.user.id,
        action: 'UPDATE',
        entityType: 'product',
        entityId: product.id,
        oldValue: existing as any,
        newValue: product as any,
      },
    });

    return product;
  });

  // Update stock
  fastify.post('/:id/stock', async (request: any, reply) => {
    const { id } = request.params;
    const schema = z.object({
      type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']),
      quantity: z.number(),
      reference: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(request.body);

    const product = await fastify.prisma.product.findFirst({
      where: {
        id,
        companyId: request.user.companyId,
      },
    });

    if (!product) {
      return reply.status(404).send({ error: 'Produkt nicht gefunden' });
    }

    // Calculate new stock
    let newStock = Number(product.stockQuantity);
    if (data.type === 'IN' || data.type === 'RETURN') {
      newStock += data.quantity;
    } else if (data.type === 'OUT') {
      newStock -= data.quantity;
    } else {
      newStock = data.quantity; // ADJUSTMENT sets absolute value
    }

    // Update in transaction
    const [updatedProduct, movement] = await fastify.prisma.$transaction([
      fastify.prisma.product.update({
        where: { id },
        data: { stockQuantity: newStock },
      }),
      fastify.prisma.inventoryMovement.create({
        data: {
          productId: id,
          ...data,
        },
      }),
    ]);

    return { product: updatedProduct, movement };
  });

  // Delete product (soft delete)
  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params;

    const existing = await fastify.prisma.product.findFirst({
      where: {
        id,
        companyId: request.user.companyId,
      },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Produkt nicht gefunden' });
    }

    await fastify.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await fastify.prisma.auditLog.create({
      data: {
        userId: request.user.id,
        action: 'DELETE',
        entityType: 'product',
        entityId: id,
        oldValue: existing as any,
      },
    });

    return { success: true };
  });

  // Categories
  fastify.get('/categories', async (request: any) => {
    const categories = await fastify.prisma.productCategory.findMany({
      where: { companyId: request.user.companyId },
      include: {
        _count: { select: { products: true } },
      },
    });
    return categories;
  });

  fastify.post('/categories', async (request: any) => {
    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      parentId: z.string().optional(),
    });

    const data = schema.parse(request.body);

    const category = await fastify.prisma.productCategory.create({
      data: {
        ...data,
        companyId: request.user.companyId,
      },
    });

    return category;
  });
};

export default productRoutes;
