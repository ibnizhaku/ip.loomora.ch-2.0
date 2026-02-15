import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAbsenceDto, UpdateAbsenceDto, AbsenceQueryDto } from './dto/absence.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/notification.dto';

@Injectable()
export class AbsencesService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async findAll(companyId: string, query: AbsenceQueryDto) {
    const { page = 1, pageSize = 10, search, sortBy = 'startDate', sortOrder = 'desc', status, type, employeeId } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = {
      employee: { companyId },
    };

    if (search) {
      where.employee = {
        ...where.employee,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (employeeId) where.employeeId = employeeId;

    const [data, total] = await Promise.all([
      this.prisma.absence.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.absence.count({ where }),
    ]);

    return this.prisma.createPaginatedResponse(data, total, page, pageSize);
  }

  async getStats(companyId: string) {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [total, pending, approved, rejected, byType, todayAbsent] = await Promise.all([
      this.prisma.absence.count({ where: { employee: { companyId } } }),
      this.prisma.absence.count({ where: { employee: { companyId }, status: 'PENDING' } }),
      this.prisma.absence.count({ where: { employee: { companyId }, status: 'APPROVED' } }),
      this.prisma.absence.count({ where: { employee: { companyId }, status: 'REJECTED' } }),
      this.prisma.absence.groupBy({
        by: ['type'],
        where: { employee: { companyId }, startDate: { gte: yearStart } },
        _count: true,
        _sum: { days: true },
      }),
      this.prisma.absence.count({
        where: {
          employee: { companyId },
          status: 'APPROVED',
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
    ]);

    const sickDays = byType.find(t => t.type === 'SICK')?._sum?.days || 0;
    const vacationDays = byType.find(t => t.type === 'VACATION')?._sum?.days || 0;

    return {
      total,
      pending,
      approved,
      rejected,
      todayAbsent,
      sickDaysThisYear: Number(sickDays),
      vacationDaysThisYear: Number(vacationDays),
      byType: byType.map(t => ({ type: t.type, count: t._count, totalDays: Number(t._sum?.days || 0) })),
    };
  }

  async findById(id: string) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            contracts: {
              orderBy: { startDate: 'desc' },
              take: 1,
              select: { vacationDays: true },
            },
          },
        },
      },
    });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }

    // Get vacation quota from latest contract
    const vacationDays = (absence.employee as any).contracts?.[0]?.vacationDays || 25;

    // Get all absences this year for this employee (Verlauf / history)
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const history = await this.prisma.absence.findMany({
      where: {
        employeeId: absence.employeeId,
        startDate: { gte: yearStart },
      },
      orderBy: { startDate: 'desc' },
      select: { id: true, type: true, status: true, startDate: true, endDate: true, days: true, reason: true },
    });

    // Calculate used vacation days
    const usedVacation = history
      .filter(a => a.type === 'VACATION' && a.status === 'APPROVED')
      .reduce((sum, a) => sum + Number(a.days), 0);

    return {
      ...absence,
      kontingent: {
        vacationDays,
        usedVacation,
        remainingVacation: vacationDays - usedVacation,
      },
      verlauf: history,
    };
  }

  async create(dto: CreateAbsenceDto) {
    return this.prisma.absence.create({
      data: {
        employeeId: dto.employeeId,
        type: dto.type,
        status: dto.status || 'PENDING',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        days: dto.days,
        reason: dto.reason,
        notes: dto.notes,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, dto: UpdateAbsenceDto) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, companyId: true, user: { select: { id: true } } },
        },
      },
    });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }

    const updated = await this.prisma.absence.update({
      where: { id },
      data: {
        type: dto.type,
        status: dto.status,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        days: dto.days,
        reason: dto.reason,
        notes: dto.notes,
        approvedAt: dto.status === 'APPROVED' ? new Date() : undefined,
      },
    });

    // Send notification if status changed to APPROVED or REJECTED
    if (dto.status && absence.status !== dto.status && absence.employee?.user?.id) {
      if (dto.status === 'APPROVED') {
        await this.notificationsService.create(absence.employee.companyId, {
          title: 'Abwesenheit genehmigt',
          message: `Ihr Urlaubsantrag vom ${absence.startDate.toLocaleDateString('de-CH')} wurde genehmigt`,
          type: NotificationType.SUCCESS,
          category: 'hr',
          actionUrl: `/absences/${id}`,
          userId: absence.employee.user.id,
          sourceType: 'absence',
          sourceId: id,
        });
      } else if (dto.status === 'REJECTED') {
        await this.notificationsService.create(absence.employee.companyId, {
          title: 'Abwesenheit abgelehnt',
          message: `Ihr Urlaubsantrag vom ${absence.startDate.toLocaleDateString('de-CH')} wurde abgelehnt`,
          type: NotificationType.WARNING,
          category: 'hr',
          actionUrl: `/absences/${id}`,
          userId: absence.employee.user.id,
          sourceType: 'absence',
          sourceId: id,
        });
      }
    }

    return updated;
  }

  async delete(id: string) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
    });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }

    await this.prisma.absence.delete({ where: { id } });
    return { success: true };
  }
}
