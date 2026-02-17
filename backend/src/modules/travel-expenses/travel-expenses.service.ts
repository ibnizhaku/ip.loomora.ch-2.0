import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTravelExpenseDto, UpdateTravelExpenseDto } from './dto/travel-expense.dto';

@Injectable()
export class TravelExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    employeeId?: string;
    status?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, employeeId, status, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {
      employee: { companyId },
    };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { employee: { firstName: { contains: search, mode: 'insensitive' } } },
        { employee: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.travelExpense.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: 'desc' },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, number: true },
          },
        },
      }),
      this.prisma.travelExpense.count({ where }),
    ]);

    return {
      data: data.map(e => this.mapEmployeeName(e)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const expense = await this.prisma.travelExpense.findFirst({
      where: { id, employee: { companyId } },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            number: true,
            email: true,
            position: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Reisekostenabrechnung nicht gefunden');
    }

    return this.mapEmployeeName(expense);
  }

  async create(companyId: string, dto: CreateTravelExpenseDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
    if (!employee) throw new NotFoundException('Mitarbeiter nicht gefunden');

    const created = await this.prisma.travelExpense.create({
      data: {
        employeeId: dto.employeeId,
        date: new Date(dto.date),
        description: dto.description,
        purpose: dto.purpose,
        destination: dto.destination,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        notes: dto.notes,
        status: dto.status || 'pending',
        kilometers: dto.kilometers,
        kmRate: dto.kmRate || 0.70,
        mealAllowance: dto.mealAllowance,
        accommodation: dto.accommodation,
        otherExpenses: dto.otherExpenses,
        totalAmount: dto.totalAmount,
        receiptUrl: dto.receiptUrl,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, number: true },
        },
      },
    });

    return this.mapEmployeeName(created);
  }

  async update(id: string, companyId: string, dto: UpdateTravelExpenseDto) {
    const expense = await this.prisma.travelExpense.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!expense) throw new NotFoundException('Reisekostenabrechnung nicht gefunden');

    const data: any = {};
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.purpose !== undefined) data.purpose = dto.purpose;
    if (dto.destination !== undefined) data.destination = dto.destination;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.kilometers !== undefined) data.kilometers = dto.kilometers;
    if (dto.kmRate !== undefined) data.kmRate = dto.kmRate;
    if (dto.mealAllowance !== undefined) data.mealAllowance = dto.mealAllowance;
    if (dto.accommodation !== undefined) data.accommodation = dto.accommodation;
    if (dto.otherExpenses !== undefined) data.otherExpenses = dto.otherExpenses;
    if (dto.totalAmount !== undefined) data.totalAmount = dto.totalAmount;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.receiptUrl !== undefined) data.receiptUrl = dto.receiptUrl;

    const updated = await this.prisma.travelExpense.update({
      where: { id },
      data,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, number: true },
        },
      },
    });

    return this.mapEmployeeName(updated);
  }

  async approve(id: string, companyId: string, approvedById: string) {
    const expense = await this.prisma.travelExpense.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!expense) throw new NotFoundException('Reisekostenabrechnung nicht gefunden');
    if (expense.status !== 'pending') {
      throw new BadRequestException('Nur ausstehende Abrechnungen können genehmigt werden');
    }

    const approved = await this.prisma.travelExpense.update({
      where: { id },
      data: {
        status: 'approved',
        approvedById,
        approvedAt: new Date(),
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, number: true },
        },
      },
    });

    return this.mapEmployeeName(approved);
  }

  async reject(id: string, companyId: string, reason?: string) {
    const expense = await this.prisma.travelExpense.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!expense) throw new NotFoundException('Reisekostenabrechnung nicht gefunden');
    if (expense.status !== 'pending') {
      throw new BadRequestException('Nur ausstehende Abrechnungen können abgelehnt werden');
    }

    const rejected = await this.prisma.travelExpense.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, number: true },
        },
      },
    });

    return this.mapEmployeeName(rejected);
  }

  private mapEmployeeName(expense: any) {
    if (!expense?.employee) return expense;
    return {
      ...expense,
      employee: {
        ...expense.employee,
        name: `${expense.employee.firstName} ${expense.employee.lastName}`,
      },
    };
  }

  async delete(id: string, companyId: string) {
    const expense = await this.prisma.travelExpense.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!expense) throw new NotFoundException('Reisekostenabrechnung nicht gefunden');

    await this.prisma.travelExpense.delete({ where: { id } });
    return { success: true };
  }
}
