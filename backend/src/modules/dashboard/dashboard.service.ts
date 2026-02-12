import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // All KPIs calculated server-side
  async getStats(companyId: string) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      customerCount,
      activeProjects,
      totalInvoices,
      paidInvoices,
      employeeCount,
      currentMonthRevenue,
      previousMonthRevenue,
      timeEntriesThisMonth,
      activeEmployeeCount,
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
      this.prisma.employee.count({ where: { companyId } }),
      // Current month paid revenue
      this.prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'PAID',
          updatedAt: { gte: currentMonthStart },
        },
        _sum: { totalAmount: true },
      }),
      // Previous month paid revenue
      this.prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'PAID',
          updatedAt: { gte: previousMonthStart, lte: previousMonthEnd },
        },
        _sum: { totalAmount: true },
      }),
      // Time entries this month (sum of duration in hours)
      this.prisma.timeEntry.aggregate({
        where: {
          companyId,
          date: { gte: currentMonthStart },
        },
        _sum: { duration: true },
      }),
      // Active employees for utilization calculation
      this.prisma.employee.count({ where: { companyId, status: 'ACTIVE' } }),
    ]);

    const totalRevenue = Number(paidInvoices._sum.totalAmount || 0);
    const openInvoices = Number(totalInvoices._sum.totalAmount || 0) - totalRevenue;

    // Calculate revenue change percentage
    const currRevenue = Number(currentMonthRevenue._sum.totalAmount || 0);
    const prevRevenue = Number(previousMonthRevenue._sum.totalAmount || 0);
    let revenueChange = '+0.0%';
    if (prevRevenue > 0) {
      const change = ((currRevenue - prevRevenue) / prevRevenue) * 100;
      revenueChange = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    } else if (currRevenue > 0) {
      revenueChange = '+100.0%';
    }

    // Calculate utilization rate
    // Available hours = active employees * 8h * working days this month
    const workingDaysThisMonth = this.getWorkingDaysInMonth(now.getFullYear(), now.getMonth());
    const availableHours = activeEmployeeCount * 8 * workingDaysThisMonth;
    const bookedHours = Number(timeEntriesThisMonth._sum.duration || 0);
    const utilizationRate = availableHours > 0
      ? Math.round((bookedHours / availableHours) * 100)
      : 0;

    return {
      totalRevenue,
      openInvoices,
      activeProjects,
      customerCount,
      employeeCount,
      revenueChange,
      utilizationRate,
    };
  }

  private getWorkingDaysInMonth(year: number, month: number): number {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(year, month, day).getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
    return workingDays;
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
            where: { companyId },
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
