import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from './dto/employee.dto';
import { mapEmployeeResponse } from '../../common/mappers/response.mapper';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: EmployeeQueryDto) {
    const { page = 1, pageSize = 10, search, sortBy = 'lastName', sortOrder = 'asc', status, departmentId } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          department: { select: { id: true, name: true } },
          contracts: { orderBy: { startDate: 'desc' }, take: 1 },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    // Transform to match frontend format using mapper
    const transformedData = data.map((e) => {
      const mapped = mapEmployeeResponse(e);
      return {
        ...mapped,
        name: `${e.firstName} ${e.lastName}`,
        position: e.position || 'Keine Angabe',
        department: e.department?.name || 'Keine Abteilung',
        email: e.email || '',
        phone: e.phone || e.mobile || '',
        status: e.status.toLowerCase(),
        hireDate: e.hireDate?.toISOString(),
        startDate: e.hireDate?.toLocaleDateString('de-CH') || '',
        avatar: e.avatarUrl,
      };
    });

    return this.prisma.createPaginatedResponse(transformedData, total, page, pageSize);
  }

  async findById(id: string, companyId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
      include: {
        department: true,
        contracts: { orderBy: { startDate: 'desc' } },
        absences: { orderBy: { startDate: 'desc' }, take: 10 },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return mapEmployeeResponse(employee);
  }

  async create(companyId: string, dto: CreateEmployeeDto) {
    // Validate departmentId if provided (skip if empty string or null)
    if (dto.departmentId && dto.departmentId.trim() !== '') {
      const department = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, companyId },
      });
      if (!department) {
        // Department doesn't exist - set to null instead of throwing error
        dto.departmentId = null;
      }
    } else {
      // Empty or null - set to null
      dto.departmentId = null;
    }

    // Generate employee number
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { employeeCounter: { increment: 1 } },
    });

    const number = `MA-${String(company.employeeCounter).padStart(4, '0')}`;

    const employee = await this.prisma.employee.create({
      data: {
        number,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        mobile: dto.mobile,
        position: dto.position,
        departmentId: dto.departmentId,
        status: dto.status || 'ACTIVE',
        hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
        ahvNumber: dto.ahvNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        nationality: dto.nationality,
        maritalStatus: dto.maritalStatus,
        childrenCount: dto.childrenCount || 0,
        employmentType: dto.employmentType,
        workloadPercent: dto.workloadPercent || 100,
        iban: dto.iban,
        companyId,
      },
      include: {
        department: { select: { id: true, name: true } },
      },
    });

    return employee;
  }

  async update(id: string, companyId: string, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate departmentId if being changed (skip if empty)
    if (dto.departmentId && dto.departmentId.trim() !== '' && dto.departmentId !== employee.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, companyId },
      });
      if (!department) {
        // Department doesn't exist - set to null
        dto.departmentId = null;
      }
    } else if (dto.departmentId === '' || dto.departmentId === null) {
      // Explicitly clearing department
      dto.departmentId = null;
    }

    return this.prisma.employee.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        mobile: dto.mobile,
        position: dto.position,
        departmentId: dto.departmentId,
        status: dto.status,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
        ahvNumber: dto.ahvNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        nationality: dto.nationality,
        maritalStatus: dto.maritalStatus,
        childrenCount: dto.childrenCount,
        employmentType: dto.employmentType,
        workloadPercent: dto.workloadPercent,
        iban: dto.iban,
        notes: dto.notes,
      },
    });
  }

  async delete(id: string, companyId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.prisma.employee.delete({ where: { id } });
    return { success: true };
  }

  // Statistics
  async getStats(companyId: string) {
    const [total, active, vacation, sick] = await Promise.all([
      this.prisma.employee.count({ where: { companyId } }),
      this.prisma.employee.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.employee.count({ where: { companyId, status: 'VACATION' } }),
      this.prisma.employee.count({ where: { companyId, status: 'SICK' } }),
    ]);

    return { total, active, vacation, sick };
  }

  // Departments
  async getDepartments(companyId: string) {
    return this.prisma.department.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }
}
