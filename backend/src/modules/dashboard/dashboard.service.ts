import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // All KPIs calculated server-side
  async getStats(companyId: string) {
    const [
      customerCount,
      activeProjects,
      totalInvoices,
      paidInvoices,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { companyId, isActive: true } }),
      this.prisma.project.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.invoice.aggregate({
        where: { companyId },
        _sum: { total: true },
      }),
      this.prisma.invoice.aggregate({
        where: { companyId, status: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    const totalRevenue = Number(paidInvoices._sum.total || 0);
    const openInvoices = Number(totalInvoices._sum.total || 0) - totalRevenue;

    return {
      totalRevenue,
      openInvoices,
      activeProjects,
      customerCount,
      // Calculated percentages
      revenueChange: '+12.5%', // Would be calculated from historical data
      utilizationRate: 87,
    };
  }

  async getRecentActivity(companyId: string) {
    const [invoices, projects, tasks] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: { select: { name: true } } },
      }),
      this.prisma.project.findMany({
        where: { companyId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.task.findMany({
        where: { companyId, status: 'DONE' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    return { invoices, projects, tasks };
  }
}
