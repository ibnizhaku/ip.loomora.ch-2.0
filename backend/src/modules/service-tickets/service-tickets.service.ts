import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateServiceTicketDto, 
  UpdateServiceTicketDto, 
  ServiceReportDto,
  ScheduleTechnicianDto,
} from './dto/service-ticket.dto';
import { ServiceTicketStatus, ServiceTicketPriority } from '@prisma/client';

@Injectable()
export class ServiceTicketsService {
  constructor(private prisma: PrismaService) {}

  // Swiss Metallbau hourly rates
  private readonly HOURLY_RATES = {
    standard: 95,
    travel: 65,
    emergency: 145,
  };

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
    serviceType?: string;
    customerId?: string;
    technicianId?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, priority, serviceType, customerId, technicianId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (serviceType) where.serviceType = serviceType;
    if (customerId) where.customerId = customerId;
    if (technicianId) where.assignedTechnicianId = technicianId;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.serviceTicket.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { priority: 'asc' },
          { scheduledDate: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          assignedTechnician: { select: { id: true, firstName: true, lastName: true } },
          project: { select: { id: true, name: true, number: true } },
        },
      }),
      this.prisma.serviceTicket.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const ticket = await this.prisma.serviceTicket.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        contact: true,
        assignedTechnician: { select: { id: true, firstName: true, lastName: true, phone: true } },
        project: { select: { id: true, name: true, number: true } },
        reports: { orderBy: { serviceDate: 'desc' } },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Service-Ticket nicht gefunden');
    }

    // Calculate totals
    const totalHours = ticket.reports.reduce((sum, r) => sum + Number(r.hoursWorked || 0), 0);
    const totalTravelTime = ticket.reports.reduce((sum, r) => sum + Number(r.travelTime || 0), 0);
    const totalMaterialCost = ticket.reports.reduce((sum, r) => sum + Number(r.materialCost || 0), 0);

    const laborCost = totalHours * this.HOURLY_RATES.standard;
    const travelCost = totalTravelTime * this.HOURLY_RATES.travel;
    const totalCost = laborCost + travelCost + totalMaterialCost;

    return {
      ...ticket,
      totalHours,
      totalTravelTime,
      totalMaterialCost,
      laborCost,
      travelCost,
      totalCost,
    };
  }

  async create(companyId: string, dto: CreateServiceTicketDto) {
    // Validate customer
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });
    if (!customer) throw new NotFoundException('Kunde nicht gefunden');

    // Generate number
    const count = await this.prisma.serviceTicket.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `ST-${year}-${String(count + 1).padStart(4, '0')}`;

    const ticket = await this.prisma.serviceTicket.create({
      data: {
        companyId,
        number,
        title: dto.title,
        description: dto.description,
        customerId: dto.customerId,
        contactId: dto.contactId,
        projectId: dto.projectId,
        serviceType: dto.serviceType,
        priority: dto.priority || ServiceTicketPriority.MEDIUM,
        status: dto.assignedTechnicianId ? ServiceTicketStatus.ASSIGNED : ServiceTicketStatus.OPEN,
        assignedTechnicianId: dto.assignedTechnicianId,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
        estimatedHours: dto.estimatedHours,
        location: dto.location,
        equipmentInfo: dto.equipmentInfo,
        tags: dto.tags || [],
      },
      include: {
        customer: { select: { id: true, name: true } },
        assignedTechnician: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return ticket;
  }

  async update(id: string, companyId: string, dto: UpdateServiceTicketDto) {
    const ticket = await this.findOne(id, companyId);

    if (ticket.status === ServiceTicketStatus.CLOSED) {
      throw new BadRequestException('Geschlossenes Ticket kann nicht bearbeitet werden');
    }

    // Auto-set status based on technician assignment
    let newStatus = dto.status;
    if (dto.assignedTechnicianId && !ticket.assignedTechnicianId && !dto.status) {
      // Keep current status or use IN_PROGRESS since ASSIGNED doesn't exist in schema
      newStatus = undefined;
    }

    return this.prisma.serviceTicket.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: newStatus,
        priority: dto.priority,
        assignedTechnicianId: dto.assignedTechnicianId,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        estimatedHours: dto.estimatedHours,
        resolution: dto.resolution,
        tags: dto.tags,
        resolvedAt: dto.status === ServiceTicketStatus.RESOLVED ? new Date() : undefined,
        closedAt: dto.status === ServiceTicketStatus.CLOSED ? new Date() : undefined,
      },
      include: {
        customer: { select: { id: true, name: true } },
        assignedTechnician: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async delete(id: string, companyId: string) {
    const ticket = await this.findOne(id, companyId);

    if (ticket.status !== ServiceTicketStatus.OPEN) {
      throw new BadRequestException('Nur offene Tickets können gelöscht werden');
    }

    return this.prisma.serviceTicket.delete({ where: { id } });
  }

  // Add service report
  async addReport(id: string, companyId: string, dto: ServiceReportDto) {
    const ticket = await this.findOne(id, companyId);

    if (ticket.status === ServiceTicketStatus.CLOSED) {
      throw new BadRequestException('Geschlossenes Ticket kann keine Rapporte erhalten');
    }

    // Calculate labor cost
    const laborCost = (dto.hoursWorked || 0) * this.HOURLY_RATES.standard;
    const travelCost = (dto.travelTime || 0) * this.HOURLY_RATES.travel;
    const totalCost = laborCost + travelCost + (dto.materialCost || 0);

    const report = await this.prisma.serviceReport.create({
      data: {
        serviceTicketId: id,
        serviceDate: new Date(dto.serviceDate),
        hoursWorked: dto.hoursWorked,
        travelTime: dto.travelTime || 0,
        workPerformed: dto.workPerformed,
        partsUsed: dto.partsUsed,
        materialCost: dto.materialCost || 0,
        laborCost,
        totalCost,
        customerSignature: dto.customerSignature,
        photoUrls: dto.photoUrls || [],
        followUpNeeded: dto.followUpNeeded,
      },
    });

    // Update ticket status if work started
    if (ticket.status === ServiceTicketStatus.ASSIGNED) {
      await this.prisma.serviceTicket.update({
        where: { id },
        data: { status: ServiceTicketStatus.IN_PROGRESS },
      });
    }

    // Mark as resolved if completed
    if (dto.completed) {
      await this.prisma.serviceTicket.update({
        where: { id },
        data: {
          status: ServiceTicketStatus.RESOLVED,
          resolvedAt: new Date(),
        },
      });
    }

    return report;
  }

  // Schedule technician
  async scheduleTechnician(id: string, companyId: string, dto: ScheduleTechnicianDto) {
    const ticket = await this.findOne(id, companyId);

    // Validate technician (employee)
    const technician = await this.prisma.employee.findFirst({
      where: { id: dto.technicianId },
    });
    if (!technician) throw new NotFoundException('Techniker nicht gefunden');

    return this.prisma.serviceTicket.update({
      where: { id },
      data: {
        assignedTechnicianId: dto.technicianId,
        scheduledDate: new Date(dto.scheduledDate),
        estimatedHours: dto.estimatedHours,
        status: 'ASSIGNED' as any,
      },
      include: {
        customer: { select: { id: true, name: true } },
        assignedTechnician: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  // Get technician availability
  async getTechnicianAvailability(companyId: string, technicianId: string, startDate: string, endDate: string) {
    const tickets = await this.prisma.serviceTicket.findMany({
      where: {
        companyId,
        assignedTechnicianId: technicianId,
        scheduledDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: { notIn: ['CLOSED', 'RESOLVED'] },
      },
      select: {
        id: true,
        number: true,
        title: true,
        scheduledDate: true,
        estimatedHours: true,
        customer: { select: { name: true } },
      },
    });

    return tickets;
  }

  // Get statistics
  async getStatistics(companyId: string) {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, byStatus, byPriority, byType, openUrgent, scheduledToday] = await Promise.all([
      this.prisma.serviceTicket.count({ where: { companyId } }),
      this.prisma.serviceTicket.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true,
      }),
      this.prisma.serviceTicket.groupBy({
        by: ['priority'],
        where: { companyId, status: { notIn: ['CLOSED', 'RESOLVED'] } },
        _count: true,
      }),
      this.prisma.serviceTicket.groupBy({
        by: ['serviceType'],
        where: { companyId },
        _count: true,
      }),
      this.prisma.serviceTicket.count({
        where: {
          companyId,
          priority: 'URGENT',
          status: { notIn: ['CLOSED', 'RESOLVED'] },
        },
      }),
      this.prisma.serviceTicket.count({
        where: {
          companyId,
          scheduledDate: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lt: new Date(today.setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    const openTickets = byStatus
      .filter(s => !['CLOSED', 'RESOLVED'].includes(s.status))
      .reduce((sum, s) => sum + s._count, 0);

    return {
      total,
      openTickets,
      openUrgent,
      scheduledToday,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
      byPriority: byPriority.map(p => ({ priority: p.priority, count: p._count })),
      byType: byType.map(t => ({ type: t.serviceType, count: t._count })),
    };
  }

  // Get upcoming maintenance schedule
  async getUpcomingMaintenance(companyId: string, days: number = 30) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.prisma.serviceTicket.findMany({
      where: {
        companyId,
        serviceType: 'MAINTENANCE',
        status: { notIn: ['CLOSED', 'RESOLVED'] },
        scheduledDate: {
          lte: endDate,
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        assignedTechnician: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }
}
