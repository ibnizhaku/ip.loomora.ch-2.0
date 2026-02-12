import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateTrainingDto, 
  UpdateTrainingDto, 
  AddParticipantDto,
  UpdateParticipantDto,
  TrainingReportDto,
  TrainingStatus,
  ParticipantStatus,
} from './dto/training.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto & { status?: string; type?: string }) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'startDate', sortOrder = 'desc', status, type } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      this.prisma.training.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          instructor: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { participants: true } },
        },
      }),
      this.prisma.training.count({ where }),
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
    const training = await this.prisma.training.findFirst({
      where: { id, companyId },
      include: {
        instructor: { select: { id: true, firstName: true, lastName: true, email: true } },
        participants: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    return training;
  }

  async create(companyId: string, dto: CreateTrainingDto) {
    return this.prisma.training.create({
      data: {
        ...dto,
        companyId,
      },
      include: {
        instructor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateTrainingDto) {
    const training = await this.prisma.training.findFirst({
      where: { id, companyId },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    return this.prisma.training.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string) {
    const training = await this.prisma.training.findFirst({
      where: { id, companyId },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    return this.prisma.training.delete({ where: { id } });
  }

  async addParticipant(trainingId: string, companyId: string, dto: AddParticipantDto) {
    const training = await this.prisma.training.findFirst({
      where: { id: trainingId, companyId },
      include: { _count: { select: { participants: true } } },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    // Verify employee exists
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if already registered
    const existing = await this.prisma.trainingParticipant.findFirst({
      where: { trainingId, employeeId: dto.employeeId },
    });

    if (existing) {
      throw new BadRequestException('Employee already registered for this training');
    }

    // Check capacity and set status accordingly
    let status = dto.status || ParticipantStatus.REGISTERED;
    if (training.maxParticipants && training._count.participants >= training.maxParticipants) {
      status = ParticipantStatus.WAITLIST;
    }

    return this.prisma.trainingParticipant.create({
      data: {
        trainingId,
        employeeId: dto.employeeId,
        status,
        notes: dto.notes,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async updateParticipant(trainingId: string, participantId: string, companyId: string, dto: UpdateParticipantDto) {
    const training = await this.prisma.training.findFirst({
      where: { id: trainingId, companyId },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    const participant = await this.prisma.trainingParticipant.findFirst({
      where: { id: participantId, trainingId },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    return this.prisma.trainingParticipant.update({
      where: { id: participantId },
      data: dto,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async removeParticipant(trainingId: string, participantId: string, companyId: string) {
    const training = await this.prisma.training.findFirst({
      where: { id: trainingId, companyId },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    const participant = await this.prisma.trainingParticipant.findFirst({
      where: { id: participantId, trainingId },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    await this.prisma.trainingParticipant.delete({ where: { id: participantId } });

    // Promote from waitlist if applicable
    if (training.maxParticipants) {
      const waitlisted = await this.prisma.trainingParticipant.findFirst({
        where: { trainingId, status: ParticipantStatus.WAITLIST },
        orderBy: { createdAt: 'asc' },
      });

      if (waitlisted) {
        await this.prisma.trainingParticipant.update({
          where: { id: waitlisted.id },
          data: { status: ParticipantStatus.REGISTERED },
        });
      }
    }

    return { success: true };
  }

  async completeTraining(id: string, companyId: string) {
    const training = await this.prisma.training.findFirst({
      where: { id, companyId },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    // Update all confirmed/registered participants to attended
    await this.prisma.trainingParticipant.updateMany({
      where: {
        trainingId: id,
        status: { in: [ParticipantStatus.REGISTERED, ParticipantStatus.CONFIRMED] },
      },
      data: {
        status: ParticipantStatus.ATTENDED,
        attended: true,
      },
    });

    return this.prisma.training.update({
      where: { id },
      data: {
        status: TrainingStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  async getStats(companyId: string) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const [totalTrainings, completedTrainings, totalParticipants, totalHours, totalBudget, spentBudget] = await Promise.all([
      this.prisma.training.count({ where: { companyId } }),
      this.prisma.training.count({ where: { companyId, status: TrainingStatus.COMPLETED } }),
      this.prisma.trainingParticipant.count({
        where: { training: { companyId } },
      }),
      this.prisma.training.aggregate({
        where: { companyId, status: TrainingStatus.COMPLETED },
        _sum: { durationHours: true },
      }),
      this.prisma.training.aggregate({
        where: { companyId, startDate: { gte: startOfYear } },
        _sum: { totalBudget: true },
      }),
      this.prisma.training.aggregate({
        where: { companyId, status: TrainingStatus.COMPLETED, startDate: { gte: startOfYear } },
        _sum: { totalBudget: true },
      }),
    ]);

    return {
      totalTrainings,
      completedTrainings,
      totalParticipants,
      totalHours: totalHours._sum.durationHours || 0,
      yearlyBudget: totalBudget._sum.totalBudget || 0,
      yearlySpent: spentBudget._sum.totalBudget || 0,
    };
  }

  async getEmployeeTrainings(employeeId: string, companyId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const participations = await this.prisma.trainingParticipant.findMany({
      where: { employeeId },
      include: {
        training: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            startDate: true,
            endDate: true,
            durationHours: true,
            certificationType: true,
          },
        },
      },
      orderBy: { training: { startDate: 'desc' } },
    });

    const stats = {
      totalTrainings: participations.length,
      completedTrainings: participations.filter(p => p.status === ParticipantStatus.ATTENDED).length,
      totalHours: participations
        .filter(p => p.status === ParticipantStatus.ATTENDED)
        .reduce((sum, p) => sum + Number(p.training.durationHours || 0), 0),
      certificates: participations.filter(p => p.certificateIssued).length,
    };

    return {
      participations,
      stats,
    };
  }

  async getUpcomingTrainings(companyId: string, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.training.findMany({
      where: {
        companyId,
        status: TrainingStatus.SCHEDULED,
        startDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      include: {
        _count: { select: { participants: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async generateReport(companyId: string, dto: TrainingReportDto) {
    const where: any = { companyId };

    if (dto.startDate) {
      where.startDate = { gte: new Date(dto.startDate) };
    }

    if (dto.endDate) {
      where.startDate = { ...where.startDate, lte: new Date(dto.endDate) };
    }

    if (dto.type) {
      where.type = dto.type;
    }

    const trainings = await this.prisma.training.findMany({
      where,
      include: {
        participants: {
          include: {
            employee: { select: { firstName: true, lastName: true, department: true } },
          },
        },
      },
    });

    const summary = {
      totalTrainings: trainings.length,
      totalParticipants: trainings.reduce((sum, t) => sum + t.participants.length, 0),
      totalHours: trainings.reduce((sum: number, t) => sum + Number(t.durationHours || 0), 0),
      totalCost: trainings.reduce((sum: number, t) => sum + Number(t.totalBudget || 0), 0),
      byType: {} as Record<string, number>,
      byDepartment: {} as Record<string, number>,
    };

    trainings.forEach(t => {
      summary.byType[t.type] = (summary.byType[t.type] || 0) + 1;
      t.participants.forEach(p => {
        const deptName = p.employee.department?.name || 'Unknown';
        summary.byDepartment[deptName] = (summary.byDepartment[deptName] || 0) + 1;
      });
    });

    return {
      trainings,
      summary,
    };
  }
}
