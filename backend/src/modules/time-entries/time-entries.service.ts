import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTimeEntryDto, UpdateTimeEntryDto, TimeEntryQueryDto } from './dto/time-entry.dto';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, addDays } from 'date-fns';

@Injectable()
export class TimeEntriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, userId: string, query: TimeEntryQueryDto) {
    const { page = 1, pageSize = 50, startDate, endDate, projectId } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { companyId, userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (projectId) where.projectId = projectId;

    const [data, total] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
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
      },
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

    return {
      today: todayEntries._sum.duration || 0,
      week: weekEntries._sum.duration || 0,
      month: monthEntries._sum.duration || 0,
      weekBreakdown: weekDays,
    };
  }
}
