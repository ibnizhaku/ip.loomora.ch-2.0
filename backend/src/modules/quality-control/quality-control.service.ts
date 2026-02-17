import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateQualityChecklistDto,
  CreateQualityCheckDto, 
  UpdateQualityCheckDto, 
  CompleteQualityCheckDto,
  QualityCheckStatus,
  QualityCheckType,
  QUALITY_CHECKLISTS,
} from './dto/quality-control.dto';

@Injectable()
export class QualityControlService {
  constructor(private prisma: PrismaService) {}

  // ============ CHECKLISTS ============

  /** Maps checklist response for frontend (sortOrder -> order, adds isActive default) */
  private mapChecklist(c: any) {
    return {
      ...c,
      isActive: c.isActive ?? true,
      items: (c.items || []).map((item: any) => ({
        ...item,
        order: item.sortOrder ?? 0,
      })),
    };
  }

  async findAllChecklists(companyId: string, params: {
    page?: number;
    pageSize?: number;
    type?: string;
    category?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, type, category, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (type) where.type = type;
    if (category) where.category = category;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.qualityChecklist.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
        include: {
          items: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { checks: true } },
        },
      }),
      this.prisma.qualityChecklist.count({ where }),
    ]);

    return {
      data: data.map((c: any) => this.mapChecklist(c)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneChecklist(id: string, companyId: string) {
    const checklist = await this.prisma.qualityChecklist.findFirst({
      where: { id, companyId },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!checklist) {
      throw new NotFoundException('Checkliste nicht gefunden');
    }

    return this.mapChecklist(checklist);
  }

  async createChecklist(companyId: string, dto: CreateQualityChecklistDto) {
    return this.prisma.qualityChecklist.create({
      data: {
        companyId,
        name: dto.name,
        description: dto.description,
        type: dto.type || QualityCheckType.FINAL,
        category: dto.category,
        items: {
          create: dto.items.map((item, index) => ({
            name: item.name,
            description: item.description,
            required: item.required ?? true,
            sortOrder: item.sortOrder ?? index,
          })),
        },
      },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async updateChecklist(id: string, companyId: string, dto: Partial<CreateQualityChecklistDto>) {
    await this.findOneChecklist(id, companyId);

    if (dto.items) {
      await this.prisma.checklistItem.deleteMany({ where: { checklistId: id } });
      await this.prisma.checklistItem.createMany({
        data: dto.items.map((item, index) => ({
          checklistId: id,
          name: item.name,
          description: item.description,
          required: item.required ?? true,
          sortOrder: item.sortOrder ?? index,
        })),
      });
    }

    return this.prisma.qualityChecklist.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        category: dto.category,
      },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async deleteChecklist(id: string, companyId: string) {
    await this.findOneChecklist(id, companyId);
    return this.prisma.qualityChecklist.delete({ where: { id } });
  }

  // Get predefined templates
  getChecklistTemplates() {
    return QUALITY_CHECKLISTS.map((template, index) => ({
      id: `template-${index}`,
      ...template,
      items: template.items.map((item, itemIndex) => ({
        ...item,
        sortOrder: itemIndex,
      })),
    }));
  }

  // ============ QUALITY CHECKS ============

  async findAllChecks(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    type?: string;
    productionOrderId?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, type, productionOrderId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (productionOrderId) where.productionOrderId = productionOrderId;
    if (search) {
      where.number = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.qualityCheck.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          checklist: { select: { id: true, name: true, category: true } },
          productionOrder: { select: { id: true, number: true, name: true } },
          inspector: { select: { id: true, firstName: true, lastName: true } },
          results: true,
        },
      }),
      this.prisma.qualityCheck.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneCheck(id: string, companyId: string) {
    const check = await this.prisma.qualityCheck.findFirst({
      where: { id, companyId },
      include: {
        checklist: {
          include: {
            items: { orderBy: { sortOrder: 'asc' } },
          },
        },
        productionOrder: { select: { id: true, number: true, name: true } },
        inspector: { select: { id: true, firstName: true, lastName: true } },
        results: true,
      },
    });

    if (!check) {
      throw new NotFoundException('Qualitätsprüfung nicht gefunden');
    }

    // Merge checklist items with results
    const itemsWithResults = check.checklist.items.map((item: any) => {
      const result = check.results.find((r: any) => r.checklistItemId === item.id);
      return {
        ...item,
        result: result || null,
      };
    });

    return {
      ...check,
      checklist: {
        ...check.checklist,
        items: itemsWithResults,
      },
    };
  }

  async createCheck(companyId: string, dto: CreateQualityCheckDto) {
    // Validate checklist
    const checklist = await this.findOneChecklist(dto.checklistId, companyId);

    // Generate number
    const count = await this.prisma.qualityCheck.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `QC-${year}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.qualityCheck.create({
      data: {
        companyId,
        number,
        checklistId: dto.checklistId,
        productionOrderId: dto.productionOrderId,
        goodsReceiptId: dto.goodsReceiptId,
        type: dto.type,
        status: QualityCheckStatus.PENDING,
        inspectorId: dto.inspectorId,
        notes: dto.notes,
      },
      include: {
        checklist: { select: { id: true, name: true } },
        productionOrder: { select: { id: true, number: true } },
      },
    });
  }

  async updateCheck(id: string, companyId: string, dto: UpdateQualityCheckDto) {
    await this.findOneCheck(id, companyId);

    // Save results if provided
    if (dto.results) {
      for (const result of dto.results) {
        await this.prisma.checkResult.upsert({
          where: {
            qualityCheckId_checklistItemId: {
              qualityCheckId: id,
              checklistItemId: result.checklistItemId,
            },
          },
          create: {
            qualityCheckId: id,
            checklistItemId: result.checklistItemId,
            passed: result.passed,
            notes: result.notes,
            measuredValue: result.measuredValue,
            photoUrls: result.photoUrls || [],
          },
          update: {
            passed: result.passed,
            notes: result.notes,
            measuredValue: result.measuredValue,
            photoUrls: result.photoUrls || [],
          },
        });
      }
    }

    return this.prisma.qualityCheck.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        checklist: { select: { id: true, name: true } },
        results: true,
      },
    });
  }

  async completeCheck(id: string, companyId: string, dto: CompleteQualityCheckDto) {
    const check = await this.findOneCheck(id, companyId);

    // Save all results
    for (const result of dto.results) {
      await this.prisma.checkResult.upsert({
        where: {
          qualityCheckId_checklistItemId: {
            qualityCheckId: id,
            checklistItemId: result.checklistItemId,
          },
        },
        create: {
          qualityCheckId: id,
          checklistItemId: result.checklistItemId,
          passed: result.passed,
          notes: result.notes,
          measuredValue: result.measuredValue,
          photoUrls: result.photoUrls || [],
        },
        update: {
          passed: result.passed,
          notes: result.notes,
          measuredValue: result.measuredValue,
          photoUrls: result.photoUrls || [],
        },
      });
    }

    // Update check status
    return this.prisma.qualityCheck.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
        completedAt: new Date(),
      },
      include: {
        checklist: { select: { id: true, name: true } },
        results: true,
      },
    });
  }

  async deleteCheck(id: string, companyId: string) {
    const check = await this.findOneCheck(id, companyId);

    if (check.status !== QualityCheckStatus.PENDING) {
      throw new BadRequestException('Nur ausstehende Prüfungen können gelöscht werden');
    }

    return this.prisma.qualityCheck.delete({ where: { id } });
  }

  // Get statistics
  async getStatistics(companyId: string) {
    const [total, byStatus, byType, recentFailed] = await Promise.all([
      this.prisma.qualityCheck.count({ where: { companyId } }),
      this.prisma.qualityCheck.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true,
      }),
      this.prisma.qualityCheck.groupBy({
        by: ['type'],
        where: { companyId },
        _count: true,
      }),
      this.prisma.qualityCheck.count({
        where: {
          companyId,
          status: QualityCheckStatus.FAILED,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const passed = byStatus.find(s => s.status === 'PASSED')?._count || 0;
    const failed = byStatus.find(s => s.status === 'FAILED')?._count || 0;
    const passRate = (passed + failed) > 0 
      ? Math.round((passed / (passed + failed)) * 100) 
      : 100;

    const pendingChecks = byStatus.find(s => s.status === 'PENDING')?._count || 0;

    return {
      totalChecks: total,
      passedChecks: passed,
      failedChecks: failed,
      passRate,
      pendingChecks,
    };
  }
}
