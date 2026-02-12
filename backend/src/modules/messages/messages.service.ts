import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/notification.dto';
import { CreateMessageDto, UpdateMessageDto, ToggleReactionDto } from './dto/message.dto';
import { parseMentions } from './chat.utils';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(companyId: string, userId: string, dto: CreateMessageDto) {
    if (!dto.projectId && !dto.taskId) {
      throw new BadRequestException('Entweder projectId oder taskId muss angegeben werden');
    }

    // Parse mentions from content
    const mentionedUserIds = dto.mentionedUserIds?.length
      ? dto.mentionedUserIds
      : parseMentions(dto.content);

    const message = await this.prisma.chatMessage.create({
      data: {
        content: dto.content,
        authorId: userId,
        projectId: dto.projectId || null,
        taskId: dto.taskId || null,
        parentId: dto.parentId || null,
        companyId,
        mentions: mentionedUserIds.length > 0
          ? {
              create: mentionedUserIds.map((uid) => ({ userId: uid })),
            }
          : undefined,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        reactions: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        mentions: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        _count: { select: { replies: true } },
      },
    });

    // ── Mention-Notifications ──
    if (mentionedUserIds.length > 0) {
      const notifyUserIds = mentionedUserIds.filter((id) => id !== userId);
      if (notifyUserIds.length > 0) {
        const contextName = dto.projectId 
          ? await this.getProjectName(dto.projectId) 
          : await this.getTaskName(dto.taskId!);
        const sender = message.author;

        await this.notificationsService.createForMany(companyId, notifyUserIds, {
          title: 'Erwähnung im Chat',
          message: `${sender.firstName} ${sender.lastName} hat Sie in "${contextName}" erwähnt`,
          type: NotificationType.INFO,
          category: 'chat',
          actionUrl: dto.projectId ? `/projects/${dto.projectId}` : `/tasks/${dto.taskId}`,
          sourceType: 'chat_message',
          sourceId: message.id,
        });
      }
    }

    // ── Thread-Reply Notification ──
    if (dto.parentId) {
      const parentMessage = await this.prisma.chatMessage.findUnique({
        where: { id: dto.parentId },
        select: { authorId: true },
      });
      if (parentMessage && parentMessage.authorId !== userId) {
        await this.notificationsService.create(companyId, {
          title: 'Antwort auf Ihre Nachricht',
          message: `${message.author.firstName} ${message.author.lastName} hat auf Ihre Nachricht geantwortet`,
          type: NotificationType.INFO,
          category: 'chat',
          actionUrl: dto.projectId ? `/projects/${dto.projectId}` : `/tasks/${dto.taskId}`,
          userId: parentMessage.authorId,
          sourceType: 'chat_message',
          sourceId: message.id,
        });
      }
    }

    return message;
  }

  async findByProject(companyId: string, projectId: string, page?: number | string, pageSize?: number | string) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 50);
    const skip = (p - 1) * ps;

    const [data, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { companyId, projectId, parentId: null },
        orderBy: { createdAt: 'asc' },
        skip,
        take: ps,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          reactions: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          mentions: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          _count: { select: { replies: true } },
        },
      }),
      this.prisma.chatMessage.count({
        where: { companyId, projectId, parentId: null },
      }),
    ]);

    return { data, total, page: p, pageSize: ps };
  }

  async findByTask(companyId: string, taskId: string, page?: number | string, pageSize?: number | string) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 50);
    const skip = (p - 1) * ps;

    const [data, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { companyId, taskId, parentId: null },
        orderBy: { createdAt: 'asc' },
        skip,
        take: ps,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          reactions: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          mentions: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          _count: { select: { replies: true } },
        },
      }),
      this.prisma.chatMessage.count({
        where: { companyId, taskId, parentId: null },
      }),
    ]);

    return { data, total, page: p, pageSize: ps };
  }

  async updateMessage(messageId: string, companyId: string, userId: string, dto: UpdateMessageDto) {
    const message = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, companyId },
    });
    if (!message) throw new NotFoundException('Nachricht nicht gefunden');
    if (message.authorId !== userId) throw new ForbiddenException('Nicht berechtigt');

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { content: dto.content },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        reactions: true,
        mentions: true,
      },
    });
  }

  async deleteMessage(messageId: string, companyId: string, userId: string) {
    const message = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, companyId },
    });
    if (!message) throw new NotFoundException('Nachricht nicht gefunden');
    if (message.authorId !== userId) throw new ForbiddenException('Nicht berechtigt');

    await this.prisma.chatMessage.delete({ where: { id: messageId } });
    return { success: true };
  }

  async toggleReaction(messageId: string, companyId: string, userId: string, dto: ToggleReactionDto) {
    const message = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, companyId },
    });
    if (!message) throw new NotFoundException('Nachricht nicht gefunden');

    const existing = await this.prisma.chatReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji: dto.emoji,
        },
      },
    });

    if (existing) {
      await this.prisma.chatReaction.delete({ where: { id: existing.id } });
      return { action: 'removed', emoji: dto.emoji };
    } else {
      await this.prisma.chatReaction.create({
        data: { messageId, userId, emoji: dto.emoji },
      });
      return { action: 'added', emoji: dto.emoji };
    }
  }

  private async getProjectName(projectId: string): Promise<string> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });
    return project?.name || 'Projekt';
  }

  private async getTaskName(taskId: string): Promise<string> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });
    return task?.title || 'Aufgabe';
  }
}
