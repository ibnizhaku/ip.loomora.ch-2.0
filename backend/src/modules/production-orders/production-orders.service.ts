import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateProductionOrderDto, 
  UpdateProductionOrderDto, 
  TimeBookingDto,
  ProductionOrderStatus,
  ProductionPriority 
} from './dto/production-order.dto';

@Injectable()
export class ProductionOrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
    projectId?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, priority, projectId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.productionOrder.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ priority: 'asc' }, { plannedStartDate: 'asc' }],
        include: {
          project: { select: { id: true, name: true, number: true } },
          order: { select: { id: true, number: true } },
          bom: { select: { id: true, name: true } },
          operations: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      this.prisma.productionOrder.count({ where }),
    ]);

    // Calculate progress for each order
    const dataWithProgress = data.map(order => ({
      ...order,
      progress: this.calculateProgress(order.operations),
      totalPlannedHours: order.operations.reduce((sum, op) => sum + Number(op.plannedHours || 0), 0),
      totalActualHours: order.operations.reduce((sum, op) => sum + Number(op.actualHours || 0), 0),
    }));

    return {
      data: dataWithProgress,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const order = await this.prisma.productionOrder.findFirst({
      where: { id, companyId },
      include: {
        project: { select: { id: true, name: true, number: true } },
        order: { select: { id: true, number: true, customer: { select: { id: true, name: true } } } },
        bom: { 
          select: { 
            id: true, 
            name: true,
            items: { orderBy: { sortOrder: 'asc' } },
          } 
        },
        operations: {
          orderBy: { sortOrder: 'asc' },
          include: {
            assignedEmployee: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Werkstattauftrag nicht gefunden');
    }

    return {
      ...order,
      progress: this.calculateProgress(order.operations),
      totalPlannedHours: order.operations.reduce((sum, op) => sum + Number(op.plannedHours || 0), 0),
      totalActualHours: order.operations.reduce((sum, op) => sum + Number(op.actualHours || 0), 0),
    };
  }

  async create(companyId: string, dto: CreateProductionOrderDto) {
    // Generate number
    const count = await this.prisma.productionOrder.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `WA-${year}-${String(count + 1).padStart(4, '0')}`;

    // Validate project
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, companyId },
      });
      if (!project) throw new NotFoundException('Projekt nicht gefunden');
    }

    // Calculate planned end date if not provided
    let plannedEndDate = dto.plannedEndDate ? new Date(dto.plannedEndDate) : null;
    if (!plannedEndDate && dto.operations?.length) {
      const totalHours = dto.operations.reduce((sum, op) => sum + (op.plannedHours || 0), 0);
      plannedEndDate = new Date(dto.plannedStartDate);
      plannedEndDate.setDate(plannedEndDate.getDate() + Math.ceil(totalHours / 8)); // 8h workday
    }

    return this.prisma.productionOrder.create({
      data: {
        companyId,
        number,
        name: dto.name,
        description: dto.description,
        projectId: dto.projectId,
        orderId: dto.orderId,
        bomId: dto.bomId,
        priority: dto.priority || ProductionPriority.MEDIUM,
        quantity: dto.quantity || 1,
        status: ProductionOrderStatus.PLANNED,
        plannedStartDate: new Date(dto.plannedStartDate),
        plannedEndDate,
        notes: dto.notes,
        operations: dto.operations ? {
          create: dto.operations.map((op, index) => ({
            name: op.name,
            description: op.description,
            workstation: op.workstation,
            plannedHours: op.plannedHours,
            actualHours: 0,
            assignedEmployeeId: op.assignedEmployeeId,
            status: 'pending',
            sortOrder: op.sortOrder ?? index,
          })),
        } : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        operations: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateProductionOrderDto) {
    const order = await this.findOne(id, companyId);

    if (order.status === ProductionOrderStatus.COMPLETED) {
      throw new BadRequestException('Abgeschlossener Auftrag kann nicht bearbeitet werden');
    }

    // Handle status transitions
    let actualStartDate = order.actualStartDate;
    let actualEndDate = order.actualEndDate;

    if (dto.status === ProductionOrderStatus.IN_PROGRESS && !order.actualStartDate) {
      actualStartDate = new Date();
    }
    if (dto.status === ProductionOrderStatus.COMPLETED && !order.actualEndDate) {
      actualEndDate = new Date();
    }

    // Update operations if provided
    if (dto.operations) {
      await this.prisma.productionOperation.deleteMany({ where: { productionOrderId: id } });
      await this.prisma.productionOperation.createMany({
        data: dto.operations.map((op, index) => ({
          productionOrderId: id,
          name: op.name,
          description: op.description,
          workstation: op.workstation,
          plannedHours: op.plannedHours,
          actualHours: op.actualHours || 0,
          assignedEmployeeId: op.assignedEmployeeId,
          status: op.status || 'pending',
          sortOrder: op.sortOrder ?? index,
        })),
      });
    }

    return this.prisma.productionOrder.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        plannedStartDate: dto.plannedStartDate ? new Date(dto.plannedStartDate) : undefined,
        plannedEndDate: dto.plannedEndDate ? new Date(dto.plannedEndDate) : undefined,
        actualStartDate,
        actualEndDate,
        notes: dto.notes,
      },
      include: {
        project: { select: { id: true, name: true } },
        operations: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async delete(id: string, companyId: string) {
    const order = await this.findOne(id, companyId);

    if (order.status === ProductionOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Laufender Auftrag kann nicht gelöscht werden');
    }

    return this.prisma.productionOrder.delete({ where: { id } });
  }

  // Book time to an operation
  async bookTime(id: string, companyId: string, dto: TimeBookingDto) {
    const order = await this.findOne(id, companyId);

    const operation = order.operations.find(op => op.id === dto.operationId);
    if (!operation) {
      throw new NotFoundException('Arbeitsgang nicht gefunden');
    }

    // Update operation hours
    await this.prisma.productionOperation.update({
      where: { id: dto.operationId },
      data: {
        actualHours: { increment: dto.hours },
        status: 'in_progress',
      },
    });

    // If order was planned, set to in_progress
    if (order.status === ProductionOrderStatus.PLANNED) {
      await this.prisma.productionOrder.update({
        where: { id },
        data: {
          status: ProductionOrderStatus.IN_PROGRESS,
          actualStartDate: new Date(),
        },
      });
    }

    return this.findOne(id, companyId);
  }

  // Complete entire production order
  async completeOrder(id: string, companyId: string) {
    const order = await this.prisma.productionOrder.findFirst({
      where: { id, companyId },
    });
    if (!order) throw new NotFoundException('Produktionsauftrag nicht gefunden');

    // Mark all operations as completed
    await this.prisma.productionOperation.updateMany({
      where: { productionOrderId: id },
      data: { status: 'completed' },
    });

    // Update order status
    await this.prisma.productionOrder.update({
      where: { id },
      data: {
        status: ProductionOrderStatus.COMPLETED,
        actualEndDate: new Date(),
      },
    });

    return this.findOne(id, companyId);
  }

  // Complete an operation
  async completeOperation(id: string, companyId: string, operationId: string) {
    const order = await this.findOne(id, companyId);

    const operation = order.operations.find(op => op.id === operationId);
    if (!operation) {
      throw new NotFoundException('Arbeitsgang nicht gefunden');
    }

    await this.prisma.productionOperation.update({
      where: { id: operationId },
      data: { status: 'completed' },
    });

    // Check if all operations are completed
    const updatedOrder = await this.findOne(id, companyId);
    const allCompleted = updatedOrder.operations.every(op => op.status === 'completed');

    if (allCompleted) {
      await this.prisma.productionOrder.update({
        where: { id },
        data: {
          status: ProductionOrderStatus.COMPLETED,
          actualEndDate: new Date(),
        },
      });
    }

    return this.findOne(id, companyId);
  }

  // Get statistics
  async getStatistics(companyId: string) {
    const [total, byStatus, byPriority, overdue] = await Promise.all([
      this.prisma.productionOrder.count({ where: { companyId } }),
      this.prisma.productionOrder.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true,
      }),
      this.prisma.productionOrder.groupBy({
        by: ['priority'],
        where: { companyId, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
        _count: true,
      }),
      this.prisma.productionOrder.count({
        where: {
          companyId,
          status: { in: ['PLANNED', 'IN_PROGRESS'] },
          plannedEndDate: { lt: new Date() },
        },
      }),
    ]);

    const inProgress = byStatus.find(s => s.status === 'IN_PROGRESS')?._count || 0;
    const completed = byStatus.find(s => s.status === 'COMPLETED')?._count || 0;
    const active = byStatus.filter(s => !['COMPLETED', 'CANCELLED'].includes(s.status as string))
      .reduce((sum, s) => sum + s._count, 0);
    const utilizationRate = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      totalOrders: total,
      inProgress,
      completed,
      utilizationRate,
    };
  }

  // Get capacity overview (workstation utilization)
  async getCapacityOverview(companyId: string, startDate: string, endDate: string) {
    const orders = await this.prisma.productionOrder.findMany({
      where: {
        companyId,
        status: { in: ['PLANNED', 'IN_PROGRESS'] },
        plannedStartDate: { lte: new Date(endDate) },
        OR: [
          { plannedEndDate: { gte: new Date(startDate) } },
          { plannedEndDate: null },
        ],
      },
      include: {
        operations: true,
      },
    });

    // Group by workstation
    const workstationCapacity: Record<string, { planned: number; actual: number }> = {};

    orders.forEach(order => {
      order.operations.forEach(op => {
        const ws = op.workstation || 'Allgemein';
        if (!workstationCapacity[ws]) {
          workstationCapacity[ws] = { planned: 0, actual: 0 };
        }
        workstationCapacity[ws].planned += Number(op.plannedHours || 0);
        workstationCapacity[ws].actual += Number(op.actualHours || 0);
      });
    });

    return Object.entries(workstationCapacity).map(([workstation, hours]) => ({
      workstation,
      plannedHours: hours.planned,
      actualHours: hours.actual,
      utilization: hours.planned > 0 ? Math.round((hours.actual / hours.planned) * 100) : 0,
    }));
  }

  private calculateProgress(operations: any[]): number {
    if (!operations.length) return 0;
    const completed = operations.filter(op => op.status === 'completed').length;
    return Math.round((completed / operations.length) * 100);
  }
}
