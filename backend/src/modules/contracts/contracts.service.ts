import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateContractDto, 
  UpdateContractDto, 
  RenewContractDto,
  TerminateContractDto,
  ContractStatus,
} from './dto/contract.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto & { status?: string; customerId?: string }) {
    const { page = 1, pageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, customerId } = query;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contractNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: { select: { id: true, name: true, companyName: true } },
          responsible: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.contract.count({ where }),
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
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        project: { select: { id: true, name: true, number: true } },
        responsible: { select: { id: true, firstName: true, lastName: true, email: true } },
        renewalHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async create(companyId: string, dto: CreateContractDto) {
    // Generate contract number if not provided
    let contractNumber = dto.contractNumber;
    if (!contractNumber) {
      const lastContract = await this.prisma.contract.findFirst({
        where: { companyId },
        orderBy: { contractNumber: 'desc' },
      });
      
      const year = new Date().getFullYear();
      const lastNum = lastContract?.contractNumber 
        ? parseInt(lastContract.contractNumber.split('-')[1]) 
        : 0;
      contractNumber = `V-${String(lastNum + 1).padStart(4, '0')}-${year}`;
    }

    // Calculate end date if duration is provided
    let endDate = dto.endDate;
    if (!endDate && dto.durationMonths) {
      const start = new Date(dto.startDate);
      start.setMonth(start.getMonth() + dto.durationMonths);
      endDate = start.toISOString();
    }

    return this.prisma.contract.create({
      data: {
        ...dto,
        contractNumber,
        endDate,
        companyId,
      },
      include: {
        customer: { select: { id: true, name: true, companyName: true } },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateContractDto) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return this.prisma.contract.update({
      where: { id },
      data: dto,
      include: {
        customer: { select: { id: true, name: true, companyName: true } },
      },
    });
  }

  async remove(id: string, companyId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return this.prisma.contract.delete({ where: { id } });
  }

  async renew(id: string, companyId: string, dto: RenewContractDto) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.status !== ContractStatus.ACTIVE && contract.status !== ContractStatus.EXPIRED) {
      throw new BadRequestException('Only active or expired contracts can be renewed');
    }

    const durationMonths = dto.durationMonths || contract.renewalPeriodMonths || 12;
    const startDate = contract.endDate || new Date();
    const newEndDate = new Date(startDate);
    newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

    // Create renewal history entry
    await this.prisma.contractRenewal.create({
      data: {
        contractId: id,
        previousEndDate: contract.endDate,
        newEndDate,
        previousValue: contract.value,
        newValue: dto.newValue || contract.value,
        notes: dto.notes,
      },
    });

    return this.prisma.contract.update({
      where: { id },
      data: {
        startDate: new Date(startDate),
        endDate: newEndDate,
        value: dto.newValue || contract.value,
        status: ContractStatus.ACTIVE,
        renewalCount: { increment: 1 },
      },
      include: {
        customer: { select: { id: true, name: true, companyName: true } },
      },
    });
  }

  async terminate(id: string, companyId: string, dto: TerminateContractDto) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.status === ContractStatus.TERMINATED) {
      throw new BadRequestException('Contract already terminated');
    }

    return this.prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.TERMINATED,
        terminatedAt: new Date(dto.terminationDate),
        terminationReason: dto.reason,
        notes: dto.notes ? `${contract.notes || ''}\n\nTermination: ${dto.notes}` : contract.notes,
      },
    });
  }

  async getStats(companyId: string) {
    const [total, active, expiringSoon, totalValue] = await Promise.all([
      this.prisma.contract.count({ where: { companyId } }),
      this.prisma.contract.count({ where: { companyId, status: ContractStatus.ACTIVE } }),
      this.prisma.contract.count({
        where: {
          companyId,
          status: ContractStatus.ACTIVE,
          endDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            gte: new Date(),
          },
        },
      }),
      this.prisma.contract.aggregate({
        where: { companyId, status: ContractStatus.ACTIVE },
        _sum: { value: true },
      }),
    ]);

    return {
      total,
      active,
      expiringSoon,
      totalActiveValue: totalValue._sum.value || 0,
    };
  }

  async getExpiringContracts(companyId: string, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.contract.findMany({
      where: {
        companyId,
        status: ContractStatus.ACTIVE,
        endDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: {
        customer: { select: { id: true, name: true, companyName: true } },
      },
      orderBy: { endDate: 'asc' },
    });
  }
}
