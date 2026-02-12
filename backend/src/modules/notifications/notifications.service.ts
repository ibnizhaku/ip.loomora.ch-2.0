import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, companyId: string, query: NotificationQueryDto) {
    const { page = 1, pageSize = 50, category, read } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { userId, companyId };
    if (category) where.category = category;
    if (read !== undefined) where.read = read;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    const transformedData = data.map((n) => ({
      id: n.id,
      type: n.type.toLowerCase(),
      title: n.title,
      message: n.message,
      time: n.createdAt.toISOString(),
      read: n.read,
      category: n.category,
      actionUrl: n.actionUrl,
    }));

    return this.prisma.createPaginatedResponse(transformedData, total, page, pageSize);
  }

  async getUnreadCount(userId: string, companyId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, companyId, read: false },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string, companyId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId, companyId },
    });
    if (!notification) throw new NotFoundException('Benachrichtigung nicht gefunden');

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string, companyId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, companyId, read: false },
      data: { read: true },
    });
    return { updated: result.count };
  }

  async delete(id: string, userId: string, companyId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId, companyId },
    });
    if (!notification) throw new NotFoundException('Benachrichtigung nicht gefunden');

    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  // ── Interner Trigger: Von anderen Modulen aufrufen ──
  async create(companyId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        type: dto.type || 'INFO',
        category: dto.category || 'system',
        actionUrl: dto.actionUrl,
        userId: dto.userId,
        companyId,
        sourceType: dto.sourceType,
        sourceId: dto.sourceId,
      },
    });
  }

  // Benachrichtigung an mehrere User senden
  async createForMany(companyId: string, userIds: string[], dto: Omit<CreateNotificationDto, 'userId'>) {
    return this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        title: dto.title,
        message: dto.message,
        type: dto.type || 'INFO',
        category: dto.category || 'system',
        actionUrl: dto.actionUrl,
        userId,
        companyId,
        sourceType: dto.sourceType,
        sourceId: dto.sourceId,
      })),
    });
  }
}
