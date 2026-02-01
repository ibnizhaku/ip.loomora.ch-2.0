import { FastifyPluginAsync } from 'fastify';

const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // Dashboard statistics
  fastify.get('/stats', async (request: any) => {
    const companyId = request.user.companyId;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      customerCount,
      productCount,
      openQuotes,
      openOrders,
      openInvoices,
      overdueInvoices,
      monthlyRevenue,
      yearlyRevenue,
      recentInvoices,
      recentOrders,
    ] = await Promise.all([
      // Customers
      fastify.prisma.customer.count({
        where: { companyId, isActive: true },
      }),

      // Products
      fastify.prisma.product.count({
        where: { companyId, isActive: true },
      }),

      // Open quotes
      fastify.prisma.quote.count({
        where: { companyId, status: { in: ['DRAFT', 'SENT'] } },
      }),

      // Open orders
      fastify.prisma.order.count({
        where: { companyId, status: { in: ['DRAFT', 'SENT', 'CONFIRMED'] } },
      }),

      // Open invoices
      fastify.prisma.invoice.count({
        where: { companyId, status: { in: ['SENT', 'PARTIAL'] } },
      }),

      // Overdue invoices
      fastify.prisma.invoice.count({
        where: { companyId, status: 'OVERDUE' },
      }),

      // Monthly revenue (paid invoices this month)
      fastify.prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'PAID',
          date: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),

      // Yearly revenue
      fastify.prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'PAID',
          date: { gte: startOfYear },
        },
        _sum: { total: true },
      }),

      // Recent invoices
      fastify.prisma.invoice.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { name: true } },
        },
      }),

      // Recent orders
      fastify.prisma.order.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { name: true } },
        },
      }),
    ]);

    return {
      customers: customerCount,
      products: productCount,
      quotes: {
        open: openQuotes,
      },
      orders: {
        open: openOrders,
      },
      invoices: {
        open: openInvoices,
        overdue: overdueInvoices,
      },
      revenue: {
        monthly: monthlyRevenue._sum.total || 0,
        yearly: yearlyRevenue._sum.total || 0,
      },
      recent: {
        invoices: recentInvoices,
        orders: recentOrders,
      },
    };
  });

  // Revenue chart data (last 12 months)
  fastify.get('/revenue-chart', async (request: any) => {
    const companyId = request.user.companyId;
    const months: { month: string; revenue: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const result = await fastify.prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'PAID',
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { total: true },
      });

      months.push({
        month: startOfMonth.toLocaleDateString('de-CH', { month: 'short', year: '2-digit' }),
        revenue: Number(result._sum.total || 0),
      });
    }

    return months;
  });

  // Top customers
  fastify.get('/top-customers', async (request: any) => {
    const companyId = request.user.companyId;

    const customers = await fastify.prisma.customer.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        name: true,
        invoices: {
          where: { status: 'PAID' },
          select: { total: true },
        },
      },
    });

    const customersWithRevenue = customers
      .map((c) => ({
        id: c.id,
        name: c.name,
        revenue: c.invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return customersWithRevenue;
  });

  // Low stock products
  fastify.get('/low-stock', async (request: any) => {
    const companyId = request.user.companyId;

    const products = await fastify.prisma.product.findMany({
      where: {
        companyId,
        isActive: true,
        isService: false,
        minStock: { not: null },
      },
    });

    const lowStock = products
      .filter((p) => p.minStock && Number(p.stockQuantity) <= Number(p.minStock))
      .map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        stock: Number(p.stockQuantity),
        minStock: Number(p.minStock),
      }));

    return lowStock;
  });

  // Upcoming tasks / deadlines
  fastify.get('/upcoming', async (request: any) => {
    const companyId = request.user.companyId;
    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    const [expiringQuotes, upcomingDeliveries, dueSoonInvoices] = await Promise.all([
      // Quotes expiring soon
      fastify.prisma.quote.findMany({
        where: {
          companyId,
          status: 'SENT',
          validUntil: { gte: today, lte: in7Days },
        },
        include: { customer: { select: { name: true } } },
        orderBy: { validUntil: 'asc' },
        take: 5,
      }),

      // Orders with delivery date soon
      fastify.prisma.order.findMany({
        where: {
          companyId,
          status: 'CONFIRMED',
          deliveryDate: { gte: today, lte: in7Days },
        },
        include: { customer: { select: { name: true } } },
        orderBy: { deliveryDate: 'asc' },
        take: 5,
      }),

      // Invoices due soon
      fastify.prisma.invoice.findMany({
        where: {
          companyId,
          status: { in: ['SENT', 'PARTIAL'] },
          dueDate: { gte: today, lte: in7Days },
        },
        include: { customer: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
    ]);

    return {
      expiringQuotes,
      upcomingDeliveries,
      dueSoonInvoices,
    };
  });
};

export default dashboardRoutes;
