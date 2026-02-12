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

    // Transform to match frontend format (CalendarEvent interface)
    return events.map((e) => this.mapEventResponse(e));
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

    return this.mapEventResponse(event);
  }

  async create(companyId: string, dto: CreateEventDto) {
    // Support both formats: startDate/endDate (ISO) or date+startTime/endTime
    let startTimeDate: Date;
    let endTimeDate: Date | null = null;

    if ((dto as any).startDate) {
      startTimeDate = new Date((dto as any).startDate);
      endTimeDate = (dto as any).endDate ? new Date((dto as any).endDate) : null;
    } else {
      startTimeDate = new Date(`${dto.date}T${dto.startTime || '09:00'}`);
      endTimeDate = dto.endTime ? new Date(`${dto.date}T${dto.endTime}`) : null;
    }

    const event = await this.prisma.calendarEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type || 'MEETING',
        startTime: startTimeDate,
        endTime: endTimeDate,
        isAllDay: dto.isAllDay || (dto as any).allDay || false,
        location: dto.location,
        companyId,
      },
    });

    return this.mapEventResponse(event);
  }

  async update(id: string, companyId: string, dto: UpdateEventDto) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, companyId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Support both formats
    const data: any = {
      title: dto.title,
      description: dto.description,
      type: dto.type,
      isAllDay: dto.isAllDay ?? (dto as any).allDay,
      location: dto.location,
    };

    if ((dto as any).startDate) {
      data.startTime = new Date((dto as any).startDate);
      if ((dto as any).endDate) data.endTime = new Date((dto as any).endDate);
    } else if (dto.date && dto.startTime) {
      data.startTime = new Date(`${dto.date}T${dto.startTime}`);
      if (dto.endTime) data.endTime = new Date(`${dto.date}T${dto.endTime}`);
    }

    const updated = await this.prisma.calendarEvent.update({ where: { id }, data });
    return this.mapEventResponse(updated);
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

  // Map DB event to frontend CalendarEvent interface
  private mapEventResponse(e: any) {
    return {
      id: e.id,
      title: e.title,
      description: e.description || undefined,
      type: e.type?.toLowerCase() || 'meeting',
      startDate: e.startTime?.toISOString() || new Date().toISOString(),
      endDate: e.endTime?.toISOString() || e.startTime?.toISOString() || new Date().toISOString(),
      allDay: e.isAllDay || false,
      location: e.location || undefined,
      projectId: e.projectId || undefined,
      customerId: e.customerId || undefined,
      employeeId: e.userId || undefined,
      color: e.color || undefined,
      isRecurring: e.isRecurring || false,
      recurringPattern: e.recurringPattern || undefined,
      // Keep legacy fields for backward compatibility
      date: e.startTime?.toISOString().split('T')[0],
      startTime: e.isAllDay ? 'Ganztägig' : e.startTime?.toTimeString().slice(0, 5),
      endTime: e.endTime ? e.endTime.toTimeString().slice(0, 5) : undefined,
      attendees: e.attendees?.map((a: any) =>
        a.user ? `${a.user.firstName.charAt(0)}${a.user.lastName.charAt(0)}` : ''
      ) || [],
    };
  }
}
