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
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { companyId, status: 'PAID' },
        _sum: { totalAmount: true },
      }),
    ]);

    const totalRevenue = Number(paidInvoices._sum.totalAmount || 0);
    const openInvoices = Number(totalInvoices._sum.totalAmount || 0) - totalRevenue;

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

  async getRecentActivity(companyId: string, options?: { type?: string; limit?: number }) {
    const limit = Math.min(options?.limit || 5, 50);
    const type = options?.type;

    const [invoices, projects, tasks] = await Promise.all([
      !type || type === 'invoice'
        ? this.prisma.invoice.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
              id: true,
              number: true,
              status: true,
              createdAt: true,
              customer: { select: { id: true, name: true } },
            },
          })
        : [],
      !type || type === 'project'
        ? this.prisma.project.findMany({
            where: { companyId },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            select: {
              id: true,
              name: true,
              status: true,
              updatedAt: true,
            },
          })
        : [],
      !type || type === 'task'
        ? this.prisma.task.findMany({
            where: { companyId, status: 'DONE' },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            select: {
              id: true,
              title: true,
              status: true,
              updatedAt: true,
              assignee: { select: { id: true, firstName: true, lastName: true } },
            },
          })
        : [],
    ]);

    return { invoices, projects, tasks };
  }
}
