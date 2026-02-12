import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTimeEntryDto, UpdateTimeEntryDto, TimeEntryQueryDto, ApproveTimeEntriesDto, ApprovalStatus } from './dto/time-entry.dto';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, addDays } from 'date-fns';

@Injectable()
export class TimeEntriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, userId: string, query: TimeEntryQueryDto) {
    const { page = 1, pageSize = 50, startDate, endDate, projectId, approvalStatus, employeeId } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    // If employeeId is provided (admin filtering), use it; otherwise scope to current user
    const where: any = { companyId, userId: employeeId || userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (projectId) where.projectId = projectId;
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const [data, total] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.timeEntry.count({ where }),
    ]);

    // Transform to match frontend format
    const transformedData = data.map((e) => ({
      id: e.id,
      project: e.project?.name || 'Keine Zuordnung',
      task: e.task?.title || e.description || 'Keine Beschreibung',
      duration: e.duration,
      date: format(e.date, 'yyyy-MM-dd'),
      status: 'completed',
      approvalStatus: (e as any).approvalStatus || 'pending',
      employeeName: e.user ? `${e.user.firstName} ${e.user.lastName}` : undefined,
      employeeId: e.userId,
    }));

    return this.prisma.createPaginatedResponse(transformedData, total, page, pageSize);
  }

  async findAllEmployees(companyId: string, query: TimeEntryQueryDto) {
    const { page = 1, pageSize = 50, startDate, endDate, projectId, approvalStatus, employeeId } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { companyId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (projectId) where.projectId = projectId;
    if (approvalStatus) where.approvalStatus = approvalStatus;
    if (employeeId) where.userId = employeeId;

    const [data, total] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.timeEntry.count({ where }),
    ]);

    const transformedData = data.map((e) => ({
      id: e.id,
      project: e.project?.name || 'Keine Zuordnung',
      task: e.task?.title || e.description || 'Keine Beschreibung',
      duration: e.duration,
      date: format(e.date, 'yyyy-MM-dd'),
      status: 'completed',
      approvalStatus: (e as any).approvalStatus || 'pending',
      employeeName: e.user ? `${e.user.firstName} ${e.user.lastName}` : undefined,
      employeeId: e.userId,
    }));

    return this.prisma.createPaginatedResponse(transformedData, total, page, pageSize);
  }

  async create(companyId: string, userId: string, dto: CreateTimeEntryDto) {
    const entry = await this.prisma.timeEntry.create({
      data: {
        userId,
        projectId: dto.projectId,
        taskId: dto.taskId,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
        duration: dto.duration,
        isBillable: dto.isBillable ?? true,
        hourlyRate: dto.hourlyRate,
        companyId,
        // approvalStatus will default to 'pending' if column exists
      } as any,
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });

    return entry;
  }

  async update(id: string, companyId: string, userId: string, dto: UpdateTimeEntryDto) {
    const entry = await this.prisma.timeEntry.findFirst({
      where: { id, companyId, userId },
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    return this.prisma.timeEntry.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        taskId: dto.taskId,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
        duration: dto.duration,
        isBillable: dto.isBillable,
        hourlyRate: dto.hourlyRate,
      },
    });
  }

  async delete(id: string, companyId: string, userId: string) {
    const entry = await this.prisma.timeEntry.findFirst({
      where: { id, companyId, userId },
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    await this.prisma.timeEntry.delete({ where: { id } });
    return { success: true };
  }

  async approveEntries(companyId: string, adminUserId: string, dto: ApproveTimeEntriesDto) {
    // Verify all entries belong to the company
    const entries = await this.prisma.timeEntry.findMany({
      where: {
        id: { in: dto.ids },
        companyId,
      },
    });

    if (entries.length !== dto.ids.length) {
      throw new NotFoundException('Some time entries not found');
    }

    // Update approval status
    await this.prisma.timeEntry.updateMany({
      where: {
        id: { in: dto.ids },
        companyId,
      },
      data: {
        approvalStatus: dto.status,
        approvedBy: dto.status === ApprovalStatus.APPROVED ? adminUserId : undefined,
        approvedAt: dto.status === ApprovalStatus.APPROVED ? new Date() : undefined,
        rejectionReason: dto.status === ApprovalStatus.REJECTED ? dto.reason : undefined,
      } as any,
    });

    return {
      success: true,
      updatedCount: entries.length,
      status: dto.status,
    };
  }

  async getApprovalStats(companyId: string) {
    // Note: approvalStatus field may not exist in current schema
    // Return totals as fallback
    const total = await this.prisma.timeEntry.count({
      where: { companyId },
    });

    return { pending: total, approved: 0, rejected: 0 };
  }

  // Statistics
  async getStats(companyId: string, userId: string) {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    // Today's total
    const todayEntries = await this.prisma.timeEntry.aggregate({
      where: {
        companyId,
        userId,
        date: { gte: todayStart, lte: todayEnd },
      },
      _sum: { duration: true },
    });

    // Week total
    const weekEntries = await this.prisma.timeEntry.aggregate({
      where: {
        companyId,
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
      _sum: { duration: true },
    });

    // Month total
    const monthEntries = await this.prisma.timeEntry.aggregate({
      where: {
        companyId,
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { duration: true },
    });

    // Week breakdown by day
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = addDays(weekStart, i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTotal = await this.prisma.timeEntry.aggregate({
        where: {
          companyId,
          userId,
          date: { gte: dayStart, lte: dayEnd },
        },
        _sum: { duration: true },
      });

      weekDays.push({
        date: format(dayStart, 'yyyy-MM-dd'),
        dayName: format(dayStart, 'EEE'),
        minutes: dayTotal._sum.duration || 0,
        hours: Math.round(((dayTotal._sum.duration || 0) / 60) * 10) / 10,
      });
    }

    // Billable hours (month)
    const billableEntries = await this.prisma.timeEntry.aggregate({
      where: {
        companyId,
        userId,
        date: { gte: monthStart, lte: monthEnd },
        isBillable: true,
      },
      _sum: { duration: true },
    });

    // Project breakdown (month)
    const projectEntries = await this.prisma.timeEntry.groupBy({
      by: ['projectId'],
      where: {
        companyId,
        userId,
        date: { gte: monthStart, lte: monthEnd },
        projectId: { not: null },
      },
      _sum: { duration: true },
    });

    const projectIds = projectEntries.map(p => p.projectId).filter(Boolean) as string[];
    const projects = projectIds.length > 0
      ? await this.prisma.project.findMany({ where: { id: { in: projectIds } }, select: { id: true, name: true } })
      : [];
    const projectMap = new Map(projects.map(p => [p.id, p.name]));

    const projectBreakdown = projectEntries.map(p => ({
      projectId: p.projectId || '',
      projectName: p.projectId ? (projectMap.get(p.projectId) || 'Unbekannt') : 'Kein Projekt',
      hours: Math.round(((p._sum.duration || 0) / 60) * 10) / 10,
    }));

    return {
      todayHours: Math.round(((todayEntries._sum.duration || 0) / 60) * 10) / 10,
      weekHours: Math.round(((weekEntries._sum.duration || 0) / 60) * 10) / 10,
      monthHours: Math.round(((monthEntries._sum.duration || 0) / 60) * 10) / 10,
      billableHours: Math.round(((billableEntries._sum?.duration || 0) / 60) * 10) / 10,
      projectBreakdown,
    };
  }
}
