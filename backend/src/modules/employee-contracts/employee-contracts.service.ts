import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeContractDto, UpdateEmployeeContractDto } from './dto/employee-contract.dto';

@Injectable()
export class EmployeeContractsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    employeeId?: string;
    contractType?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, employeeId, contractType, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {
      employee: { companyId },
    };
    if (employeeId) where.employeeId = employeeId;
    if (contractType) where.contractType = contractType;
    if (search) {
      where.employee = {
        ...where.employee,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { number: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.employeeContract.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { startDate: 'desc' },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, number: true, position: true, department: { select: { id: true, name: true } } },
          },
        },
      }),
      this.prisma.employeeContract.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const contract = await this.prisma.employeeContract.findFirst({
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

    if (!contract) {
      throw new NotFoundException('Vertrag nicht gefunden');
    }

    return contract;
  }

  async create(companyId: string, dto: CreateEmployeeContractDto) {
    // Verify employee belongs to company
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
    if (!employee) throw new NotFoundException('Mitarbeiter nicht gefunden');

    return this.prisma.employeeContract.create({
      data: {
        employeeId: dto.employeeId,
        contractType: dto.contractType,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        salaryType: dto.salaryType || 'Monatslohn',
        baseSalary: dto.baseSalary,
        hourlyRate: dto.hourlyRate,
        wageClass: dto.gavClass || dto.wageClass,
        workHoursPerWeek: dto.weeklyHours || dto.workHoursPerWeek || 42.5,
        vacationDays: dto.vacationDays || 25,
        probationEnd: dto.probationEnd ? new Date(dto.probationEnd) : null,
        noticePeriod: dto.noticePeriod,
        thirteenthMonth: dto.thirteenthMonth || false,
        workload: dto.workload,
        workLocation: dto.workLocation,
        status: dto.status || 'ACTIVE',
        publicHolidays: dto.publicHolidays,
        ahvNumber: dto.ahvNumber,
        notes: dto.notes,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, number: true },
        },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateEmployeeContractDto) {
    const contract = await this.prisma.employeeContract.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!contract) throw new NotFoundException('Vertrag nicht gefunden');

    const data: any = {};
    if (dto.contractType !== undefined) data.contractType = dto.contractType;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.salaryType !== undefined) data.salaryType = dto.salaryType;
    if (dto.baseSalary !== undefined) data.baseSalary = dto.baseSalary;
    if (dto.hourlyRate !== undefined) data.hourlyRate = dto.hourlyRate;
    if (dto.gavClass !== undefined || dto.wageClass !== undefined) data.wageClass = dto.gavClass || dto.wageClass;
    if (dto.weeklyHours !== undefined || dto.workHoursPerWeek !== undefined) data.workHoursPerWeek = dto.weeklyHours || dto.workHoursPerWeek;
    if (dto.vacationDays !== undefined) data.vacationDays = dto.vacationDays;
    if (dto.probationEnd !== undefined) data.probationEnd = dto.probationEnd ? new Date(dto.probationEnd) : null;
    if (dto.noticePeriod !== undefined) data.noticePeriod = dto.noticePeriod;
    if (dto.thirteenthMonth !== undefined) data.thirteenthMonth = dto.thirteenthMonth;
    if (dto.workload !== undefined) data.workload = dto.workload;
    if (dto.workLocation !== undefined) data.workLocation = dto.workLocation;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.publicHolidays !== undefined) data.publicHolidays = dto.publicHolidays;
    if (dto.ahvNumber !== undefined) data.ahvNumber = dto.ahvNumber;
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.employeeContract.update({
      where: { id },
      data,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, number: true },
        },
      },
    });
  }

  async delete(id: string, companyId: string) {
    const contract = await this.prisma.employeeContract.findFirst({
      where: { id, employee: { companyId } },
    });
    if (!contract) throw new NotFoundException('Vertrag nicht gefunden');

    await this.prisma.employeeContract.delete({ where: { id } });
    return { success: true };
  }
}
