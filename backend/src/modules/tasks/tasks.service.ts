import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: TaskQueryDto) {
    const { page = 1, pageSize = 10, search, sortBy = 'createdAt', sortOrder = 'desc', status, priority, projectId, assigneeId } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
          tags: true,
          _count: { select: { subtasks: true, timeEntries: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    // Transform to match frontend format
    const transformedData = data.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      project: t.project?.name || '',
      assignee: t.assignee ? `${t.assignee.firstName.charAt(0)}${t.assignee.lastName.charAt(0)}` : '',
      priority: t.priority.toLowerCase(),
      status: t.status.toLowerCase().replace('_', '-'),
      dueDate: t.dueDate?.toLocaleDateString('de-CH') || '',
      tags: t.tags.map((tag) => tag.name),
      subtaskCount: t._count.subtasks,
      timeEntryCount: t._count.timeEntries,
    }));

    return this.prisma.createPaginatedResponse(transformedData, total, page, pageSize);
  }

  async findById(id: string, companyId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, companyId },
      include: {
        project: { select: { id: true, name: true, number: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        tags: true,
        subtasks: { orderBy: { createdAt: 'asc' } },
        timeEntries: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(companyId: string, userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        status: dto.status || 'TODO',
        priority: dto.priority || 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        estimatedHours: dto.estimatedHours,
        assigneeId: dto.assigneeId,
        createdById: userId,
        companyId,
        tags: dto.tags ? {
          create: dto.tags.map((name) => ({ name })),
        } : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
        tags: true,
      },
    });

    return task;
  }

  async update(id: string, companyId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id, companyId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Handle tags update
    if (dto.tags !== undefined) {
      await this.prisma.taskTag.deleteMany({ where: { taskId: id } });
      if (dto.tags.length > 0) {
        await this.prisma.taskTag.createMany({
          data: dto.tags.map((name) => ({ taskId: id, name })),
        });
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        estimatedHours: dto.estimatedHours,
        assigneeId: dto.assigneeId,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
        tags: true,
      },
    });
  }

  async delete(id: string, companyId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, companyId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({ where: { id } });
    return { success: true };
  }

  // Statistics
  async getStats(companyId: string) {
    const [todo, inProgress, review, done] = await Promise.all([
      this.prisma.task.count({ where: { companyId, status: 'TODO' } }),
      this.prisma.task.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { companyId, status: 'REVIEW' } }),
      this.prisma.task.count({ where: { companyId, status: 'DONE' } }),
    ]);

    return { todo, inProgress, review, done, total: todo + inProgress + review + done };
  }
}
