import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCostCenterDto, UpdateCostCenterDto } from './dto/cost-center.dto';

@Injectable()
export class CostCentersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page = 1, pageSize = 50, search, isActive } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.costCenter.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { number: 'asc' },
        include: {
          parent: { select: { id: true, number: true, name: true } },
          manager: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { journalLines: true } },
        },
      }),
      this.prisma.costCenter.count({ where }),
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
    const costCenter = await this.prisma.costCenter.findFirst({
      where: { id, companyId },
      include: {
        parent: { select: { id: true, number: true, name: true } },
        children: { select: { id: true, number: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        budgetLines: {
          include: {
            budget: { select: { id: true, name: true, number: true, year: true, period: true, status: true } },
            account: { select: { id: true, number: true, name: true } },
          },
          orderBy: { budget: { year: 'desc' } },
        },
        journalLines: {
          include: {
            account: { select: { id: true, number: true, name: true, type: true } },
            journalEntry: { select: { id: true, number: true, date: true, description: true, status: true } },
          },
          orderBy: { journalEntry: { date: 'desc' } },
          take: 50,
        },
      },
    });

    if (!costCenter) {
      throw new NotFoundException('Kostenstelle nicht gefunden');
    }

    // Map journalLines as transactions for frontend
    const transactions = costCenter.journalLines.map(line => ({
      id: line.id,
      date: line.journalEntry.date,
      number: line.journalEntry.number,
      description: line.journalEntry.description || line.description,
      account: line.account,
      debit: line.debit,
      credit: line.credit,
      status: line.journalEntry.status,
      journalEntryId: line.journalEntry.id,
    }));

    return {
      ...costCenter,
      transactions,
    };
  }

  async create(companyId: string, dto: CreateCostCenterDto) {
    // Check unique number
    const existing = await this.prisma.costCenter.findFirst({
      where: { companyId, number: dto.number },
    });
    if (existing) {
      throw new BadRequestException(`Kostenstelle ${dto.number} existiert bereits`);
    }

    return this.prisma.costCenter.create({
      data: {
        companyId,
        number: dto.number,
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId,
        managerId: dto.managerId,
        budgetAmount: dto.budgetAmount,
        isActive: dto.isActive ?? true,
      },
      include: {
        parent: { select: { id: true, number: true, name: true } },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateCostCenterDto) {
    await this.findOne(id, companyId);

    // Check unique number if changed
    if (dto.number) {
      const existing = await this.prisma.costCenter.findFirst({
        where: { companyId, number: dto.number, NOT: { id } },
      });
      if (existing) {
        throw new BadRequestException(`Kostenstelle ${dto.number} existiert bereits`);
      }
    }

    return this.prisma.costCenter.update({
      where: { id },
      data: {
        number: dto.number,
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId,
        managerId: dto.managerId,
        budgetAmount: dto.budgetAmount,
        isActive: dto.isActive,
      },
      include: {
        parent: { select: { id: true, number: true, name: true } },
      },
    });
  }

  async delete(id: string, companyId: string) {
    const costCenter = await this.findOne(id, companyId);

    // Check if has children
    const children = await this.prisma.costCenter.count({ where: { parentId: id } });
    if (children > 0) {
      throw new BadRequestException('Kostenstelle hat Unterkostenstellen');
    }

    // Check if has journal entries
    const entries = await this.prisma.journalLine.count({ where: { costCenterId: id } });
    if (entries > 0) {
      throw new BadRequestException('Kostenstelle hat zugeordnete Buchungen');
    }

    return this.prisma.costCenter.delete({ where: { id } });
  }

  // Get cost center report
  async getReport(companyId: string, params: {
    startDate: string;
    endDate: string;
    costCenterIds?: string[];
  }) {
    const where: any = {
      journalEntry: {
        companyId,
        status: 'POSTED',
        date: {
          gte: new Date(params.startDate),
          lte: new Date(params.endDate),
        },
      },
    };
    if (params.costCenterIds?.length) {
      where.costCenterId = { in: params.costCenterIds };
    }

    const lines = await this.prisma.journalLine.findMany({
      where,
      include: {
        costCenter: { select: { id: true, number: true, name: true, budgetAmount: true } },
        account: { select: { id: true, number: true, name: true, type: true } },
      },
    });

    // Group by cost center
    const grouped = lines.reduce((acc, line) => {
      if (!line.costCenterId) return acc;
      
      if (!acc[line.costCenterId]) {
        acc[line.costCenterId] = {
          costCenter: line.costCenter,
          totalDebit: 0,
          totalCredit: 0,
          byAccount: {},
        };
      }
      
      acc[line.costCenterId].totalDebit += Number(line.debit);
      acc[line.costCenterId].totalCredit += Number(line.credit);

      // Group by account within cost center
      const accountKey = line.accountId;
      if (!acc[line.costCenterId].byAccount[accountKey]) {
        acc[line.costCenterId].byAccount[accountKey] = {
          account: line.account,
          debit: 0,
          credit: 0,
        };
      }
      acc[line.costCenterId].byAccount[accountKey].debit += Number(line.debit);
      acc[line.costCenterId].byAccount[accountKey].credit += Number(line.credit);

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      balance: item.totalDebit - item.totalCredit,
      budgetUsed: item.costCenter?.budgetAmount 
        ? ((item.totalDebit - item.totalCredit) / item.costCenter.budgetAmount * 100).toFixed(1)
        : null,
      byAccount: Object.values(item.byAccount),
    }));
  }

  // Get hierarchy (tree structure)
  async getHierarchy(companyId: string) {
    const costCenters = await this.prisma.costCenter.findMany({
      where: { companyId, isActive: true },
      orderBy: { number: 'asc' },
    });

    // Build tree
    const buildTree = (parentId: string | null): any[] => {
      return costCenters
        .filter(cc => cc.parentId === parentId)
        .map(cc => ({
          ...cc,
          children: buildTree(cc.id),
        }));
    };

    return buildTree(null);
  }
}
