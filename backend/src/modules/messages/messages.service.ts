import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateMessageDto) {
    if (!dto.projectId && !dto.taskId) {
      throw new BadRequestException('Entweder projectId oder taskId muss angegeben werden');
    }

    return this.prisma.chatMessage.create({
      data: {
        content: dto.content,
        authorId: userId,
        projectId: dto.projectId || null,
        taskId: dto.taskId || null,
        companyId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async findByProject(companyId: string, projectId: string, page?: number | string, pageSize?: number | string) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 50);
    const skip = (p - 1) * ps;

    const [data, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { companyId, projectId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: ps,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.chatMessage.count({
        where: { companyId, projectId },
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
        where: { companyId, taskId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: ps,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.chatMessage.count({
        where: { companyId, taskId },
      }),
    ]);

    return { data, total, page: p, pageSize: ps };
  }
}
