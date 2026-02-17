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
      data: data.map(e => this.mapResponse(e)),
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

    return this.mapResponse(expense);
  }

  async create(companyId: string, dto: CreateTravelExpenseDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
    if (!employee) throw new NotFoundException('Mitarbeiter nicht gefunden');

    // Generate number
    const count = await this.prisma.travelExpense.count({ where: { employee: { companyId } } });
    const year = new Date().getFullYear();
    const number = `RK-${year}-${String(count + 1).padStart(4, '0')}`;

    const created = await this.prisma.travelExpense.create({
      data: {
        number,
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

    return this.mapResponse(created);
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

    return this.mapResponse(updated);
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

    return this.mapResponse(approved);
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

    return this.mapResponse(rejected);
  }

  private mapResponse(expense: any) {
    if (!expense) return expense;

    // Build items array from flat fields for frontend compatibility
    const items: any[] = [];
    const kmAmount = expense.kilometers && expense.kmRate
      ? Number(expense.kilometers) * Number(expense.kmRate)
      : 0;
    if (kmAmount > 0) {
      items.push({ category: 'transport', amount: kmAmount, description: `${expense.kilometers} km x CHF ${Number(expense.kmRate).toFixed(2)}` });
    }
    if (expense.otherExpenses && Number(expense.otherExpenses) > 0) {
      items.push({ category: 'other', amount: Number(expense.otherExpenses), description: 'Sonstige Auslagen' });
    }
    if (expense.accommodation && Number(expense.accommodation) > 0) {
      items.push({ category: 'accommodation', amount: Number(expense.accommodation), description: 'Unterkunft' });
    }
    if (expense.mealAllowance && Number(expense.mealAllowance) > 0) {
      items.push({ category: 'meals', amount: Number(expense.mealAllowance), description: 'Verpflegung' });
    }

    // Map employee with name and initials
    let employee = expense.employee;
    if (employee) {
      const firstName = employee.firstName || '';
      const lastName = employee.lastName || '';
      employee = {
        ...employee,
        name: `${firstName} ${lastName}`.trim(),
        initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
      };
    }

    return {
      ...expense,
      items,
      employee,
      totalAmount: Number(expense.totalAmount || 0),
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
