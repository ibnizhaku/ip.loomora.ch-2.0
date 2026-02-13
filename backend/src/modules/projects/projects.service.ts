import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/project.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/notification.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async findAll(companyId: string, query: ProjectQueryDto) {
    const { page = 1, pageSize = 10, search, sortBy = 'createdAt', sortOrder = 'desc', status, priority } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: { id: true, name: true, companyName: true },
          },
          manager: {
            select: { id: true, firstName: true, lastName: true },
          },
          members: {
            include: {
              employee: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
          _count: {
            select: { tasks: true, timeEntries: true },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    // Transform data to match frontend format
    const transformedData = data.map((p) => ({
      id: p.id,
      number: p.number,
      name: p.name,
      client: p.customer?.companyName || p.customer?.name || 'Kein Kunde',
      status: p.status.toLowerCase().replace('_', '-'),
      priority: p.priority.toLowerCase(),
      progress: p.progress,
      budget: Number(p.budget) || 0,
      spent: Number(p.spent) || 0,
      startDate: p.startDate?.toISOString().split('T')[0],
      endDate: p.endDate?.toISOString().split('T')[0],
      team: p.members.map((m) => 
        `${m.employee.firstName.charAt(0)}${m.employee.lastName.charAt(0)}`
      ),
      taskCount: p._count.tasks,
      timeEntryCount: p._count.timeEntries,
    }));

    return this.prisma.createPaginatedResponse(transformedData, total, page, pageSize);
  }

  async findById(id: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        members: {
          include: {
            employee: {
              select: {
                id: true, firstName: true, lastName: true, position: true,
                user: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return {
      ...project,
      budget: Number(project.budget),
      spent: Number(project.spent),
    };
  }

  async create(companyId: string, userId: string, dto: CreateProjectDto) {
    // Generate project number
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { projectCounter: { increment: 1 } },
    });

    const number = `PRJ-${new Date().getFullYear()}-${String(company.projectCounter).padStart(4, '0')}`;

    // Map Employee-ID to User-ID if managerId is provided (Frontend sends Employee-ID)
    let managerUserId = dto.managerId || null;
    if (dto.managerId) {
      // Try Employee-ID first (Frontend sends this)
      const managerUser = await this.prisma.user.findFirst({
        where: { 
          employeeId: dto.managerId,
          OR: [
            { memberships: { some: { companyId } } },
            { companyId }
          ]
        },
        select: { id: true },
      });
      if (managerUser) {
        managerUserId = managerUser.id;
      } else {
        // Fallback: Check if it's already a User-ID
        const directUser = await this.prisma.user.findFirst({
          where: { 
            id: dto.managerId,
            OR: [
              { memberships: { some: { companyId } } },
              { companyId }
            ]
          },
          select: { id: true },
        });
        if (directUser) {
          managerUserId = directUser.id;
        } else {
          throw new NotFoundException('Projektleiter nicht gefunden oder nicht Mitglied dieser Company');
        }
      }
    }

    const project = await this.prisma.project.create({
      data: {
        number,
        name: dto.name,
        description: dto.description,
        customerId: dto.customerId,
        status: dto.status || 'PLANNING',
        priority: dto.priority || 'MEDIUM',
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        budget: dto.budget,
        hourlyRate: dto.hourlyRate,
        createdById: userId,
        managerId: managerUserId,
        companyId,
        members: dto.members
          ? {
              create: dto.members.map((employeeId) => ({
                employeeId,
                role: 'MEMBER',
              })),
            }
          : undefined,
      },
      include: {
        customer: true,
        manager: {
          select: { id: true, firstName: true, lastName: true },
        },
        members: {
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true, position: true },
            },
          },
        },
      },
    });

    // Notification an neuen Projektleiter
    if (managerUserId && managerUserId !== userId) {
      await this.notificationsService.create(companyId, {
        title: 'Projektleitung zugewiesen',
        message: `Sie wurden als Projektleiter für "${project.name}" (${number}) eingesetzt`,
        type: NotificationType.INFO,
        category: 'project',
        actionUrl: `/projects/${project.id}`,
        userId: managerUserId,
        sourceType: 'project',
        sourceId: project.id,
      });
    }

    return project;
  }

  async update(id: string, companyId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findFirst({
      where: { id, companyId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Validate manager if being changed
    if (dto.managerId && dto.managerId !== project.managerId) {
      const manager = await this.prisma.user.findFirst({
        where: { id: dto.managerId, memberships: { some: { companyId } } },
      });
      if (!manager) {
        throw new NotFoundException('Manager nicht gefunden oder nicht Mitglied dieser Company');
      }
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        customerId: dto.customerId,
        status: dto.status,
        priority: dto.priority,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        budget: dto.budget,
        progress: dto.progress,
        managerId: dto.managerId,
      },
    });

    // Notification an neuen Projektleiter (nur wenn geändert)
    if (dto.managerId && dto.managerId !== project.managerId) {
      await this.notificationsService.create(companyId, {
        title: 'Projektleitung zugewiesen',
        message: `Sie wurden als Projektleiter für "${project.name}" eingesetzt`,
        type: NotificationType.INFO,
        category: 'project',
        actionUrl: `/projects/${id}`,
        userId: dto.managerId,
        sourceType: 'project',
        sourceId: id,
      });
    }

    return updated;
  }

  async delete(id: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, companyId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.delete({ where: { id } });
    return { success: true };
  }

  async duplicate(id: string, companyId: string, userId: string) {
    const source = await this.prisma.project.findFirst({
      where: { id, companyId },
      include: { members: true },
    });
    if (!source) throw new NotFoundException('Project not found');

    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { projectCounter: { increment: 1 } },
    });
    const number = `PRJ-${new Date().getFullYear()}-${String(company.projectCounter).padStart(4, '0')}`;

    const project = await this.prisma.project.create({
      data: {
        number,
        name: `${source.name} (Kopie)`,
        description: source.description,
        customerId: source.customerId,
        status: 'PLANNING',
        priority: source.priority,
        budget: source.budget,
        createdById: userId,
        managerId: source.managerId,
        companyId,
      },
    });

    return project;
  }

  // Project Members
  async addMember(projectId: string, companyId: string, dto: { employeeId: string; role?: string }) {
    // Verify project belongs to company
    const project = await this.findById(projectId, companyId);

    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        employeeId: dto.employeeId,
        role: dto.role || 'MEMBER',
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
      },
    });

    // Send notification if employee has a user account
    const employeeUser = await this.prisma.user.findFirst({
      where: { employeeId: dto.employeeId, companyId },
      select: { id: true },
    });

    if (employeeUser) {
      await this.notificationsService.create(companyId, {
        title: 'Projektteam',
        message: `Sie wurden dem Projekt "${project.name}" hinzugefügt`,
        type: NotificationType.INFO,
        category: 'project',
        actionUrl: `/projects/${projectId}`,
        userId: employeeUser.id,
        sourceType: 'project',
        sourceId: projectId,
      });
    }

    return member;
  }

  async removeMember(projectId: string, companyId: string, memberId: string) {
    // Verify project belongs to company
    await this.findById(projectId, companyId);

    return this.prisma.projectMember.delete({ where: { id: memberId } });
  }

  // Statistics for dashboard
  async getStats(companyId: string) {
    const [total, active, completed, paused] = await Promise.all([
      this.prisma.project.count({ where: { companyId } }),
      this.prisma.project.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { companyId, status: 'COMPLETED' } }),
      this.prisma.project.count({ where: { companyId, status: 'PAUSED' } }),
    ]);

    return { total, active, completed, paused };
  }
}
