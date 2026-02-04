import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: EventQueryDto) {
    const { startDate, endDate, type } = query;

    const where: any = { companyId };

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (type) where.type = type;

    const events = await this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        attendees: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        reminders: true,
      },
    });

    // Transform to match frontend format
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type.toLowerCase(),
      startTime: e.isAllDay ? 'Ganztägig' : e.startTime.toTimeString().slice(0, 5),
      endTime: e.endTime ? e.endTime.toTimeString().slice(0, 5) : undefined,
      date: e.startTime.toISOString().split('T')[0],
      location: e.location,
      description: e.description,
      attendees: e.attendees.map((a) => 
        `${a.user.firstName.charAt(0)}${a.user.lastName.charAt(0)}`
      ),
    }));
  }

  async findById(id: string, companyId: string) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, companyId },
      include: {
        attendees: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        reminders: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async create(companyId: string, dto: CreateEventDto) {
    const event = await this.prisma.calendarEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type || 'MEETING',
        startTime: new Date(`${dto.date}T${dto.startTime}`),
        endTime: dto.endTime ? new Date(`${dto.date}T${dto.endTime}`) : null,
        isAllDay: dto.isAllDay || false,
        location: dto.location,
        companyId,
      },
    });

    return event;
  }

  async update(id: string, companyId: string, dto: UpdateEventDto) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, companyId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.calendarEvent.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        startTime: dto.date && dto.startTime ? new Date(`${dto.date}T${dto.startTime}`) : undefined,
        endTime: dto.date && dto.endTime ? new Date(`${dto.date}T${dto.endTime}`) : undefined,
        isAllDay: dto.isAllDay,
        location: dto.location,
      },
    });
  }

  async delete(id: string, companyId: string) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, companyId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.calendarEvent.delete({ where: { id } });
    return { success: true };
  }
}
