import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAbsenceDto, UpdateAbsenceDto, AbsenceQueryDto } from './dto/absence.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/notification.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

// Type/Status normalization helpers
const TYPE_MAP: Record<string, string> = {
  vacation: 'VACATION', ferien: 'VACATION', sick: 'SICK', krankheit: 'SICK',
  unpaid: 'UNPAID', maternity: 'MATERNITY', paternity: 'PATERNITY',
  training: 'OTHER', other: 'OTHER',
};

const STATUS_MAP: Record<string, string> = {
  pending: 'PENDING', approved: 'APPROVED', rejected: 'REJECTED', cancelled: 'CANCELLED',
};

function normalizeType(type?: string): string {
  if (!type) return 'OTHER';
  return TYPE_MAP[type.toLowerCase()] || type.toUpperCase();
}

function normalizeStatus(status?: string, fallback = 'PENDING'): string {
  if (!status) return fallback;
  return STATUS_MAP[status.toLowerCase()] || status.toUpperCase();
}

function isHrUser(user: CurrentUserPayload): boolean {
  if (user.isOwner) return true;
  const role = (user.role || '').toLowerCase();
  if (role === 'admin' || role === 'hr' || role === 'owner') return true;
  const perms = user.permissions || [];
  return perms.includes('employees:admin') || perms.includes('employees:write');
}

@Injectable()
export class AbsencesService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  // ─── LIST ──────────────────────────────────────────────
  async findAll(companyId: string, query: AbsenceQueryDto) {
    const { page = 1, pageSize = 10, search, sortBy = 'startDate', sortOrder = 'desc', status, type, employeeId } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { employee: { companyId } };

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
        where, skip, take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, position: true, department: { select: { name: true } } } },
        },
      }),
      this.prisma.absence.count({ where }),
    ]);

    const mapped = data.map((a: any) => ({
      ...a,
      employee: a.employee ? {
        ...a.employee,
        name: `${a.employee.firstName || ''} ${a.employee.lastName || ''}`.trim(),
        department: a.employee.department?.name || null,
      } : null,
    }));

    return this.prisma.createPaginatedResponse(mapped, total, page, pageSize);
  }

  // ─── STATS ─────────────────────────────────────────────
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
      total, pending, approved, rejected, todayAbsent,
      sickDaysThisYear: Number(sickDays),
      vacationDaysThisYear: Number(vacationDays),
      byType: byType.map(t => ({ type: t.type, count: t._count, totalDays: Number(t._sum?.days || 0) })),
    };
  }

  // ─── DETAIL ────────────────────────────────────────────
  async findById(id: string) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true, firstName: true, lastName: true, email: true,
            position: true,
            department: { select: { name: true } },
            contracts: {
              orderBy: { startDate: 'desc' as const },
              take: 1,
              select: { vacationDays: true },
            },
          },
        },
      },
    });

    if (!absence) throw new NotFoundException('Absence not found');

    const emp = absence.employee as any;
    const vacationDays = emp?.contracts?.[0]?.vacationDays || 25;

    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const history = await this.prisma.absence.findMany({
      where: { employeeId: absence.employeeId, startDate: { gte: yearStart } },
      orderBy: { startDate: 'desc' },
      select: { id: true, type: true, status: true, startDate: true, endDate: true, days: true, reason: true },
    });

    const usedVacation = history
      .filter(a => a.type === 'VACATION' && a.status === 'APPROVED')
      .reduce((sum, a) => sum + Number(a.days), 0);

    return {
      ...absence,
      employee: emp ? {
        ...emp,
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        department: emp.department?.name || null,
      } : null,
      kontingent: {
        vacationDays,
        usedVacation,
        remainingVacation: vacationDays - usedVacation,
      },
      verlauf: history,
    };
  }

  // ─── CREATE ────────────────────────────────────────────
  async create(dto: CreateAbsenceDto, user: CurrentUserPayload) {
    const normalizedType = normalizeType(dto.type);

    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : startDate;

    let days = dto.days;
    if (!days || days <= 0) {
      const diffMs = endDate.getTime() - startDate.getTime();
      days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
    }

    // Admin/HR/Owner → auto-approve
    const autoApprove = isHrUser(user);
    const status = dto.status
      ? normalizeStatus(dto.status)
      : (autoApprove ? 'APPROVED' : 'PENDING');

    const absence = await this.prisma.absence.create({
      data: {
        employeeId: dto.employeeId,
        type: normalizedType as any,
        status: status as any,
        startDate,
        endDate,
        days,
        reason: dto.reason,
        notes: dto.notes,
        approvedById: autoApprove ? user.userId : null,
        approvedAt: autoApprove ? new Date() : null,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // If PENDING → notify HR users
    if (status === 'PENDING') {
      await this.notifyHrUsers(user.companyId, absence);
    }

    return {
      ...absence,
      employee: absence.employee ? {
        ...absence.employee,
        name: `${absence.employee.firstName || ''} ${absence.employee.lastName || ''}`.trim(),
      } : null,
    };
  }

  // ─── APPROVE ───────────────────────────────────────────
  async approve(id: string, user: CurrentUserPayload) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, companyId: true, user: { select: { id: true } } },
        },
      },
    });

    if (!absence) throw new NotFoundException('Abwesenheit nicht gefunden');
    if (absence.status !== 'PENDING') {
      throw new BadRequestException('Nur ausstehende Abwesenheiten können genehmigt werden');
    }

    const updated = await this.prisma.absence.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: user.userId,
        approvedAt: new Date(),
      },
    });

    // Notify the employee
    if (absence.employee?.user?.id) {
      await this.notificationsService.create(absence.employee.companyId, {
        title: 'Abwesenheit genehmigt',
        message: `Ihr Antrag vom ${absence.startDate.toLocaleDateString('de-CH')} wurde genehmigt`,
        type: NotificationType.SUCCESS,
        category: 'hr',
        actionUrl: `/absences/${id}`,
        userId: absence.employee.user.id,
        sourceType: 'absence',
        sourceId: id,
      });
    }

    return updated;
  }

  // ─── REJECT ────────────────────────────────────────────
  async reject(id: string, reason: string | undefined, user: CurrentUserPayload) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, companyId: true, user: { select: { id: true } } },
        },
      },
    });

    if (!absence) throw new NotFoundException('Abwesenheit nicht gefunden');
    if (absence.status !== 'PENDING') {
      throw new BadRequestException('Nur ausstehende Abwesenheiten können abgelehnt werden');
    }

    const updated = await this.prisma.absence.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || null,
      },
    });

    // Notify the employee
    if (absence.employee?.user?.id) {
      await this.notificationsService.create(absence.employee.companyId, {
        title: 'Abwesenheit abgelehnt',
        message: `Ihr Antrag vom ${absence.startDate.toLocaleDateString('de-CH')} wurde abgelehnt${reason ? ': ' + reason : ''}`,
        type: NotificationType.WARNING,
        category: 'hr',
        actionUrl: `/absences/${id}`,
        userId: absence.employee.user.id,
        sourceType: 'absence',
        sourceId: id,
      });
    }

    return updated;
  }

  // ─── CANCEL ────────────────────────────────────────────
  async cancel(id: string, user: CurrentUserPayload) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
      include: {
        employee: { select: { companyId: true } },
      },
    });

    if (!absence) throw new NotFoundException('Abwesenheit nicht gefunden');

    return this.prisma.absence.update({
      where: { id },
      data: { status: 'CANCELLED' as any },
    });
  }

  // ─── UPDATE (generic PUT) ─────────────────────────────
  async update(id: string, dto: UpdateAbsenceDto) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, companyId: true, user: { select: { id: true } } },
        },
      },
    });

    if (!absence) throw new NotFoundException('Absence not found');

    const normalizedType = dto.type ? normalizeType(dto.type) : undefined;
    const normalizedStatus = dto.status ? normalizeStatus(dto.status) : undefined;

    const updated = await this.prisma.absence.update({
      where: { id },
      data: {
        type: normalizedType as any,
        status: normalizedStatus as any,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        days: dto.days,
        reason: dto.reason,
        notes: dto.notes,
        approvedAt: normalizedStatus === 'APPROVED' ? new Date() : undefined,
      },
    });

    // Send notification if status changed
    if (normalizedStatus && absence.status !== normalizedStatus && absence.employee?.user?.id) {
      if (normalizedStatus === 'APPROVED') {
        await this.notificationsService.create(absence.employee.companyId, {
          title: 'Abwesenheit genehmigt',
          message: `Ihr Antrag vom ${absence.startDate.toLocaleDateString('de-CH')} wurde genehmigt`,
          type: NotificationType.SUCCESS,
          category: 'hr',
          actionUrl: `/absences/${id}`,
          userId: absence.employee.user.id,
          sourceType: 'absence',
          sourceId: id,
        });
      } else if (normalizedStatus === 'REJECTED') {
        await this.notificationsService.create(absence.employee.companyId, {
          title: 'Abwesenheit abgelehnt',
          message: `Ihr Antrag vom ${absence.startDate.toLocaleDateString('de-CH')} wurde abgelehnt`,
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

  // ─── DELETE ────────────────────────────────────────────
  async delete(id: string) {
    const absence = await this.prisma.absence.findUnique({ where: { id } });
    if (!absence) throw new NotFoundException('Absence not found');
    await this.prisma.absence.delete({ where: { id } });
    return { success: true };
  }

  // ─── HELPER: Notify HR users about new PENDING request ─
  private async notifyHrUsers(companyId: string, absence: any) {
    try {
      const emp = absence.employee;
      const empName = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Ein Mitarbeiter';

      const TYPE_LABELS: Record<string, string> = {
        VACATION: 'Ferien', SICK: 'Krankheit', UNPAID: 'Unbezahlten Urlaub',
        MATERNITY: 'Mutterschaftsurlaub', PATERNITY: 'Vaterschaftsurlaub', OTHER: 'Abwesenheit',
      };
      const typeLabel = TYPE_LABELS[absence.type] || 'Abwesenheit';

      const from = absence.startDate instanceof Date
        ? absence.startDate.toLocaleDateString('de-CH')
        : new Date(absence.startDate).toLocaleDateString('de-CH');
      const to = absence.endDate instanceof Date
        ? absence.endDate.toLocaleDateString('de-CH')
        : new Date(absence.endDate).toLocaleDateString('de-CH');
      const days = Number(absence.days || 0);

      const message = `${empName} hat ${typeLabel} beantragt (${from} - ${to}, ${days} Tage)`;

      // Find all HR users (owners + users with employees:admin or employees:write)
      const memberships = await this.prisma.userCompanyMembership.findMany({
        where: { companyId },
        include: {
          user: { select: { id: true } },
          role: { select: { permissions: true } },
        },
      });

      const hrUserIds = memberships
        .filter(m => {
          if ((m as any).isOwner) return true;
          const perms: string[] = (m.role as any)?.permissions || [];
          return perms.includes('employees:admin') || perms.includes('employees:write');
        })
        .map(m => m.user.id);

      for (const userId of hrUserIds) {
        await this.notificationsService.create(companyId, {
          title: 'Neuer Abwesenheitsantrag',
          message,
          type: NotificationType.INFO,
          category: 'hr',
          actionUrl: `/absences/${absence.id}`,
          userId,
          sourceType: 'absence',
          sourceId: absence.id,
        });
      }
    } catch (e) {
      // Don't fail the create if notification fails
      console.error('Failed to notify HR users:', e);
    }
  }
}
