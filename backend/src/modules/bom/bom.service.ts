import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBomDto, UpdateBomDto, BomItemType, BOM_TEMPLATES } from './dto/bom.dto';

@Injectable()
export class BomService {
  constructor(private prisma: PrismaService) {}

  async getStats(companyId: string) {
    const [total, templates, withProject] = await Promise.all([
      this.prisma.billOfMaterial.count({ where: { companyId } }),
      this.prisma.billOfMaterial.count({ where: { companyId, isTemplate: true } }),
      this.prisma.billOfMaterial.count({ where: { companyId, projectId: { not: null } } }),
    ]);

    // Calculate total value from all BOM items
    const allBoms = await this.prisma.billOfMaterial.findMany({
      where: { companyId },
      include: { items: { select: { quantity: true, unitPrice: true, hours: true, hourlyRate: true } } },
    });

    let totalValue = 0;
    for (const bom of allBoms) {
      for (const item of bom.items) {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        const hours = Number(item.hours) || 0;
        const rate = Number(item.hourlyRate) || 0;
        totalValue += (qty * price) + (hours * rate);
      }
    }

    return {
      total,
      templates,
      active: withProject,
      draft: total - withProject,
      totalValue: Math.round(totalValue * 100) / 100,
    };
  }

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    projectId?: string;
    isTemplate?: boolean;
    category?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, projectId, isTemplate, category, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (projectId) where.projectId = projectId;
    if (isTemplate !== undefined) where.isTemplate = isTemplate;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.billOfMaterial.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          items: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      this.prisma.billOfMaterial.count({ where }),
    ]);

    // Calculate totals for each BOM
    const dataWithTotals = data.map(bom => ({
      ...bom,
      totalMaterial: this.calculateTotal(bom.items, 'MATERIAL'),
      totalLabor: this.calculateTotal(bom.items, 'LABOR'),
      totalExternal: this.calculateTotal(bom.items, 'EXTERNAL'),
      grandTotal: this.calculateGrandTotal(bom.items),
    }));

    return {
      data: dataWithTotals,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const bom = await this.prisma.billOfMaterial.findFirst({
      where: { id, companyId },
      include: {
        project: { select: { id: true, name: true, number: true } },
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            product: { select: { id: true, sku: true, name: true } },
          },
        },
      },
    });

    if (!bom) {
      throw new NotFoundException('Stückliste nicht gefunden');
    }

    return {
      ...bom,
      totalMaterial: this.calculateTotal(bom.items, 'MATERIAL'),
      totalLabor: this.calculateTotal(bom.items, 'LABOR'),
      totalExternal: this.calculateTotal(bom.items, 'EXTERNAL'),
      grandTotal: this.calculateGrandTotal(bom.items),
    };
  }

  async create(companyId: string, dto: CreateBomDto, userId?: string) {
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, companyId },
      });
      if (!project) {
        throw new NotFoundException('Projekt nicht gefunden');
      }
    }

    let items = dto.items || [];
    let name = dto.name;
    let category = dto.category;
    let description = dto.description;

    if (dto.templateId) {
      const template = await this.findOne(dto.templateId, companyId);
      if (!name) name = `${template.name} (Kopie)`;
      if (!category) category = (template as any).category;
      if (!description) description = (template as any).description;
      items = template.items.map((item, index) => ({
        type: item.type as BomItemType,
        productId: item.productId ?? undefined,
        description: item.description,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        hours: item.hours ? Number(item.hours) : undefined,
        hourlyRate: item.hourlyRate ? Number(item.hourlyRate) : undefined,
        sortOrder: index,
      }));
    }

    if (!name) {
      throw new BadRequestException('Name ist erforderlich');
    }

    const created = await this.prisma.billOfMaterial.create({
      data: {
        companyId,
        name,
        description,
        projectId: dto.projectId,
        isTemplate: dto.isTemplate || false,
        category,
        items: {
          create: items.map((item, index) => ({
            type: item.type,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || 'Stk',
            unitPrice: item.unitPrice,
            hours: item.hours,
            hourlyRate: item.hourlyRate,
            total: this.calculateItemTotal(item),
            sortOrder: item.sortOrder ?? index,
          })),
        },
      },
      include: {
        project: { select: { id: true, name: true } },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'BOM' as any,
            entityType: 'BOM',
            entityId: created.id,
            entityName: created.name || '',
            action: 'CREATE' as any,
            description: `Stückliste "${created.name}" erstellt`,
            newValues: { name: created.name },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return created;
  }

  async update(id: string, companyId: string, dto: UpdateBomDto, userId?: string) {
    const bom = await this.findOne(id, companyId);
    const oldValues = { name: bom.name, description: bom.description };

    // Update base data
    const updateData: any = {
      name: dto.name,
      description: dto.description,
      isTemplate: dto.isTemplate,
      category: dto.category,
    };

    // If items are provided, replace all items
    if (dto.items) {
      await this.prisma.bomItem.deleteMany({ where: { bomId: id } });

      await this.prisma.bomItem.createMany({
        data: dto.items.map((item, index) => ({
          bomId: id,
          type: item.type,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'Stk',
          unitPrice: item.unitPrice,
          hours: item.hours,
          hourlyRate: item.hourlyRate,
          total: this.calculateItemTotal(item),
          sortOrder: item.sortOrder ?? index,
        })),
      });
    }

    const updated = await this.prisma.billOfMaterial.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'BOM' as any,
            entityType: 'BOM',
            entityId: updated.id,
            entityName: updated.name || '',
            action: 'UPDATE' as any,
            description: `Stückliste "${updated.name}" aktualisiert`,
            oldValues,
            newValues: { name: updated.name, description: updated.description },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return updated;
  }

  async delete(id: string, companyId: string, userId?: string) {
    const bom = await this.findOne(id, companyId);
    const entityName = bom.name || '';

    const deleted = await this.prisma.billOfMaterial.delete({ where: { id } });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'BOM' as any,
            entityType: 'BOM',
            entityId: deleted.id,
            entityName,
            action: 'DELETE' as any,
            description: `Stückliste "${entityName}" gelöscht`,
            oldValues: { name: bom.name },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return deleted;
  }

  async duplicate(id: string, companyId: string, newName?: string) {
    const bom = await this.findOne(id, companyId);

    return this.prisma.billOfMaterial.create({
      data: {
        companyId,
        name: newName || `${bom.name} (Kopie)`,
        description: bom.description,
        projectId: bom.projectId,
        isTemplate: false,
        category: bom.category,
        items: {
          create: bom.items.map(item => ({
            type: item.type,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            hours: item.hours,
            hourlyRate: item.hourlyRate,
            total: item.total,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  // Get predefined templates
  getTemplates() {
    return BOM_TEMPLATES.map((template, index) => ({
      id: `template-${index}`,
      ...template,
      items: template.items.map((item, itemIndex) => ({
        ...item,
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || (item.hours && item.hourlyRate ? item.hours * item.hourlyRate : 0),
        total: item.unitPrice 
          ? (item.quantity || 1) * item.unitPrice 
          : (item.hours || 0) * (item.hourlyRate || 0),
        sortOrder: itemIndex,
      })),
    }));
  }

  private calculateItemTotal(item: any): number {
    if (item.type === 'LABOR') {
      return (item.hours || 0) * (item.hourlyRate || 0);
    }
    return (item.quantity || 0) * (item.unitPrice || 0);
  }

  private calculateTotal(items: any[], type: string): number {
    return items
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + Number(item.total || 0), 0);
  }

  private calculateGrandTotal(items: any[]): number {
    return items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  }
}
