import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/notification.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

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
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        timeEntries: {
          orderBy: { date: 'desc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        _count: { select: { timeEntries: true } },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // loggedMinutes: Summe aller (genehmigten) Zeiteinträge
    const loggedMinutes = (task.timeEntries || []).reduce(
      (sum: number, te: any) => sum + (te.duration || 0), 0
    );

    return { ...task, loggedMinutes };
  }

  async create(companyId: string, userId: string, dto: CreateTaskDto) {
    // Generate task number (T-0001, T-0002, ...)
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { taskCounter: { increment: 1 } },
    });

    const number = `T-${String(company.taskCounter).padStart(4, '0')}`;

    const task = await this.prisma.task.create({
      data: {
        number,
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

    // Send notification if task is assigned
    if (dto.assigneeId && dto.assigneeId !== userId) {
      await this.notificationsService.create(companyId, {
        title: 'Neue Aufgabe zugewiesen',
        message: `Ihnen wurde die Aufgabe "${task.title}" zugewiesen`,
        type: NotificationType.INFO,
        category: 'task',
        actionUrl: `/tasks/${task.id}`,
        userId: dto.assigneeId,
        sourceType: 'task',
        sourceId: task.id,
      });
    }

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

  // ========================
  // SUBTASKS
  // ========================

  async getSubtasks(taskId: string, companyId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.subtask.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createSubtask(taskId: string, companyId: string, dto: { title: string }) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.subtask.create({
      data: { taskId, title: dto.title },
    });
  }

  async updateSubtask(taskId: string, subtaskId: string, companyId: string, dto: { title?: string; isCompleted?: boolean }) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');
    const subtask = await this.prisma.subtask.findFirst({ where: { id: subtaskId, taskId } });
    if (!subtask) throw new NotFoundException('Subtask not found');
    return this.prisma.subtask.update({
      where: { id: subtaskId },
      data: dto,
    });
  }

  async deleteSubtask(taskId: string, subtaskId: string, companyId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');
    const subtask = await this.prisma.subtask.findFirst({ where: { id: subtaskId, taskId } });
    if (!subtask) throw new NotFoundException('Subtask not found');
    await this.prisma.subtask.delete({ where: { id: subtaskId } });
    return { success: true };
  }

  // ========================
  // COMMENTS
  // ========================

  async getComments(taskId: string, companyId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async createComment(taskId: string, companyId: string, userId: string, dto: { content: string }) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.taskComment.create({
      data: { taskId, authorId: userId, content: dto.content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async deleteComment(taskId: string, commentId: string, companyId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');
    const comment = await this.prisma.taskComment.findFirst({ where: { id: commentId, taskId } });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.prisma.taskComment.delete({ where: { id: commentId } });
    return { success: true };
  }

  // ========================
  // ATTACHMENTS
  // ========================

  async getAttachments(taskId: string, companyId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.taskAttachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async createAttachment(taskId: string, companyId: string, userId: string, file: Express.Multer.File) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');

    const fileUrl = `/api/uploads/task-attachments/${file.filename}`;

    return this.prisma.taskAttachment.create({
      data: {
        taskId,
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedById: userId,
      },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async deleteAttachment(taskId: string, attachmentId: string, companyId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');
    const attachment = await this.prisma.taskAttachment.findFirst({ where: { id: attachmentId, taskId } });
    if (!attachment) throw new NotFoundException('Attachment not found');
    await this.prisma.taskAttachment.delete({ where: { id: attachmentId } });
    return { success: true };
  }

  // Time Entries
  async createTimeEntry(taskId: string, companyId: string, userId: string, dto: { duration: number; description?: string }) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.timeEntry.create({
      data: {
        duration: dto.duration,
        description: dto.description,
        date: new Date(),
        taskId,
        userId,
        companyId,
        projectId: task.projectId,
        isBillable: false,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  // Statistics
  async getStats(companyId: string) {
    const [todo, inProgress, review, done, overdue] = await Promise.all([
      this.prisma.task.count({ where: { companyId, status: 'TODO' } }),
      this.prisma.task.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { companyId, status: 'REVIEW' } }),
      this.prisma.task.count({ where: { companyId, status: 'DONE' } }),
      this.prisma.task.count({ where: { companyId, status: { not: 'DONE' }, dueDate: { lt: new Date() } } }),
    ]);

    return { total: todo + inProgress + review + done, todo, inProgress, done, overdue };
  }
}
