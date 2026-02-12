import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'name', sortOrder = 'asc' } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { employees: true },
          },
        },
      }),
      this.prisma.department.count({ where }),
    ]);

    // Map to include employeeCount
    const mapped = data.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      managerId: dept.managerId,
      employeeCount: dept._count.employees,
      companyId: dept.companyId,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
    }));

    return {
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, companyId: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: { employees: true },
        },
        employees: {
          select: { id: true, firstName: true, lastName: true, position: true },
          take: 10,
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Abteilung nicht gefunden');
    }

    return {
      ...department,
      employeeCount: department._count.employees,
      _count: undefined,
    };
  }

  async create(companyId: string, dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description,
        companyId,
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findFirst({
      where: { id, companyId },
    });

    if (!department) {
      throw new NotFoundException('Abteilung nicht gefunden');
    }

    return this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async delete(id: string, companyId: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Abteilung nicht gefunden');
    }

    if (department._count.employees > 0) {
      throw new ConflictException(
        `Abteilung kann nicht gelöscht werden. ${department._count.employees} Mitarbeiter sind noch zugeordnet. Bitte zuerst die Mitarbeiter einer anderen Abteilung zuweisen.`
      );
    }

    return this.prisma.department.delete({ where: { id } });
  }
}
