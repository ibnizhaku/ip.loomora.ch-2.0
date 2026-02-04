import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAbsenceDto, UpdateAbsenceDto, AbsenceQueryDto } from './dto/absence.dto';

@Injectable()
export class AbsencesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: AbsenceQueryDto) {
    const { page = 1, pageSize = 10, search, sortBy = 'startDate', sortOrder = 'desc', status, type, employeeId } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = {
      employee: { companyId },
    };

    if (search) {
      where.employee = {
        ...where.employee,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (employeeId) where.employeeId = employeeId;

    const [data, total] = await Promise.all([
      this.prisma.absence.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.absence.count({ where }),
    ]);

    return this.prisma.createPaginatedResponse(data, total, page, pageSize);
  }

  async findById(id: string) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }

    return absence;
  }

  async create(dto: CreateAbsenceDto) {
    return this.prisma.absence.create({
      data: {
        employeeId: dto.employeeId,
        type: dto.type,
        status: dto.status || 'PENDING',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        days: dto.days,
        reason: dto.reason,
        notes: dto.notes,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, dto: UpdateAbsenceDto) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
    });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }

    return this.prisma.absence.update({
      where: { id },
      data: {
        type: dto.type,
        status: dto.status,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        days: dto.days,
        reason: dto.reason,
        notes: dto.notes,
        approvedAt: dto.status === 'APPROVED' ? new Date() : undefined,
      },
    });
  }

  async delete(id: string) {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
    });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }

    await this.prisma.absence.delete({ where: { id } });
    return { success: true };
  }
}
