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
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, customerId } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
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

    // Map title → name (Frontend sends "title", Prisma expects "name")
    const { title, ...restDto } = dto as any;
    const contractName = dto.name || title || 'Unbenannter Vertrag';

    return this.prisma.contract.create({
      data: {
        name: contractName,
        description: dto.description,
        type: dto.type,
        status: dto.status || 'DRAFT',
        customerId: dto.customerId,
        projectId: dto.projectId,
        startDate: new Date(dto.startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        durationMonths: dto.durationMonths,
        autoRenew: dto.autoRenew || false,
        renewalPeriodMonths: dto.renewalPeriodMonths,
        noticePeriodDays: dto.noticePeriodDays,
        value: dto.value || 0,
        billingCycle: dto.billingCycle,
        paymentTerms: dto.paymentTerms,
        terms: dto.terms,
        notes: dto.notes,
        contractNumber,
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

  async duplicate(id: string, companyId: string) {
    const source = await this.prisma.contract.findFirst({
      where: { id, companyId },
    });
    if (!source) throw new NotFoundException('Contract not found');

    const year = new Date().getFullYear();
    const lastContract = await this.prisma.contract.findFirst({
      where: { companyId },
      orderBy: { contractNumber: 'desc' },
    });
    const lastNum = lastContract?.contractNumber
      ? parseInt(lastContract.contractNumber.split('-')[1] || '0')
      : 0;
    const contractNumber = `V-${String(lastNum + 1).padStart(4, '0')}-${year}`;

    return this.prisma.contract.create({
      data: {
        contractNumber,
        name: source.name ? `${source.name} (Kopie)` : 'Kopie',
        description: source.description,
        type: source.type,
        customerId: source.customerId,
        responsibleId: source.responsibleId,
        status: 'DRAFT' as any,
        value: source.value,
        startDate: source.startDate,
        endDate: source.endDate,
        renewalPeriodMonths: source.renewalPeriodMonths,
        noticePeriodDays: source.noticePeriodDays,
        autoRenew: source.autoRenew,
        companyId,
      },
      include: {
        customer: { select: { id: true, name: true, companyName: true } },
      },
    });
  }

  async getStats(companyId: string) {
    const [total, active, expiringSoon, totalValue, monthlyContracts] = await Promise.all([
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
      // Monthly recurring: contracts with billingCycle = MONTHLY
      this.prisma.contract.aggregate({
        where: { companyId, status: ContractStatus.ACTIVE, billingCycle: 'MONTHLY' },
        _sum: { value: true },
      }),
    ]);

    const totalVal = Number(totalValue._sum.value || 0);
    const monthlyRecurring = Number(monthlyContracts._sum.value || 0);

    return {
      // Frontend field names
      totalContracts: total,
      activeContracts: active,
      expiringThisMonth: expiringSoon,
      totalValue: totalVal,
      monthlyRecurring,
      // Also keep old field names for backward compatibility
      total,
      active,
      expiringSoon,
      totalActiveValue: totalVal,
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

  /**
   * Prüft alle aktiven Verträge aller Firmen auf bevorstehenden Ablauf.
   * Wird täglich via Cron aufgerufen.
   * Erstellt Notifications für 90, 60 und 30 Tage vor Ablauf.
   */
  async checkExpiringContractsAllCompanies(): Promise<{ notified: number }> {
    const thresholds = [90, 60, 30];
    let notified = 0;

    for (const days of thresholds) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const dayStart = new Date(futureDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(futureDate);
      dayEnd.setHours(23, 59, 59, 999);

      const contracts = await this.prisma.contract.findMany({
        where: {
          status: ContractStatus.ACTIVE,
          endDate: { gte: dayStart, lte: dayEnd },
        },
        include: {
          customer: { select: { id: true, name: true, companyName: true } },
        },
      });

      for (const contract of contracts) {
        const customerName = (contract.customer as any)?.companyName || (contract.customer as any)?.name || '–';
        try {
          await this.prisma.notification.create({
            data: {
              companyId: contract.companyId,
              title: `Vertrag läuft in ${days} Tagen ab`,
              message: `Vertrag ${contract.contractNumber} (${contract.name}) mit ${customerName} läuft am ${new Date(contract.endDate!).toLocaleDateString('de-CH')} ab.`,
              type: 'WARNING' as any,
              category: 'contract',
              actionUrl: `/contracts/${contract.id}`,
              isRead: false,
            },
          });
          notified++;
        } catch {
          // Notification konnte nicht erstellt werden (z.B. already exists)
        }
      }
    }

    return { notified };
  }
}
