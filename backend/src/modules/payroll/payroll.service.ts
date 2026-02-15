import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePayslipDto, UpdatePayslipDto } from './dto/payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: { page?: number; pageSize?: number; year?: number; month?: number; employeeId?: string }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {
      employee: { companyId },
    };
    if (query.year) where.year = query.year;
    if (query.month) where.month = query.month;
    if (query.employeeId) where.employeeId = query.employeeId;

    const [data, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, position: true },
          },
          items: true,
        },
      }),
      this.prisma.payslip.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string, companyId: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: {
        id,
        employee: { companyId },
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, position: true, email: true },
        },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    return payslip;
  }

  async create(companyId: string, dto: CreatePayslipDto) {
    // Verify employee belongs to company
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.prisma.payslip.create({
      data: {
        employeeId: dto.employeeId,
        year: dto.year,
        month: dto.month,
        grossSalary: dto.grossSalary,
        netSalary: dto.netSalary,
        totalDeductions: dto.totalDeductions || 0,
        totalExpenses: dto.totalExpenses || 0,
        totalEmployerCost: dto.totalEmployerCost || 0,
        targetHours: dto.targetHours,
        actualHours: dto.actualHours,
        overtimeHours: dto.overtimeHours,
        holidayDays: dto.holidayDays,
        sickDays: dto.sickDays,
        vacationDays: dto.vacationDays,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
        notes: dto.notes,
        items: dto.items
          ? {
              create: dto.items.map((item, index) => ({
                category: item.category as any,
                type: item.type,
                description: item.description,
                amount: item.amount,
                rate: item.rate,
                sortOrder: item.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
        items: true,
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdatePayslipDto) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!payslip) throw new NotFoundException('Payslip not found');

    const { items, employeeId, ...updateData } = dto as any;

    // Convert paymentDate string to Date if present
    if (updateData.paymentDate) {
      updateData.paymentDate = new Date(updateData.paymentDate);
    }

    return this.prisma.payslip.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
        items: true,
      },
    });
  }

  async remove(id: string, companyId: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!payslip) throw new NotFoundException('Payslip not found');

    return this.prisma.payslip.delete({ where: { id } });
  }
}
