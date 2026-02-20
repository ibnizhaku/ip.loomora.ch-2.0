import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateCalculationDto, 
  UpdateCalculationDto, 
  CalculationStatus,
  CostItemType,
  CalculationResultDto 
} from './dto/calculation.dto';

@Injectable()
export class CalculationsService {
  constructor(private prisma: PrismaService) {}

  private readonly VAT_RATE = 8.1;

  // Default Swiss Metallbau markup values
  private readonly DEFAULTS = {
    materialMarkup: 15,
    laborMarkup: 10,
    overheadPercent: 8,
    profitMargin: 12,
    riskMargin: 5,
    discount: 0,
  };

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    projectId?: string;
    customerId?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, projectId, customerId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.calculation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true, number: true } },
          customer: { select: { id: true, name: true } },
          bom: { select: { id: true, name: true } },
          items: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      this.prisma.calculation.count({ where }),
    ]);

    const enriched = data.map(calc => {
      const result = this.calculateResult(calc);
      return { ...calc, result };
    });

    return {
      data: enriched,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const calculation = await this.prisma.calculation.findFirst({
      where: { id, companyId },
      include: {
        project: { select: { id: true, name: true, number: true } },
        customer: { select: { id: true, name: true } },
        bom: { select: { id: true, name: true } },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!calculation) {
      throw new NotFoundException('Kalkulation nicht gefunden');
    }

    // Calculate results
    const result = this.calculateResult(calculation);

    return {
      ...calculation,
      result,
    };
  }

  async create(companyId: string, dto: CreateCalculationDto, userId?: string) {
    // Generate number
    const count = await this.prisma.calculation.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `KA-${year}-${String(count + 1).padStart(4, '0')}`;

    // If copying from BOM
    let items = dto.items;
    if (dto.bomId) {
      const bom = await this.prisma.billOfMaterial.findFirst({
        where: { id: dto.bomId, companyId },
        include: { items: true },
      });
      if (!bom) throw new NotFoundException('Stückliste nicht gefunden');

      items = bom.items.map((item, index) => ({
        type: item.type as CostItemType,
        description: item.description,
        productId: item.productId ?? undefined,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitCost: Number(item.unitPrice),
        hours: item.hours ? Number(item.hours) : undefined,
        hourlyRate: item.hourlyRate ? Number(item.hourlyRate) : undefined,
        sortOrder: index,
      }));
    }

    const calculation = await this.prisma.calculation.create({
      data: {
        companyId,
        number,
        name: dto.name,
        description: dto.description,
        projectId: dto.projectId,
        bomId: dto.bomId,
        customerId: dto.customerId,
        status: CalculationStatus.DRAFT,
        materialMarkup: dto.materialMarkup ?? this.DEFAULTS.materialMarkup,
        laborMarkup: dto.laborMarkup ?? this.DEFAULTS.laborMarkup,
        overheadPercent: dto.overheadPercent ?? this.DEFAULTS.overheadPercent,
        profitMargin: dto.profitMargin ?? this.DEFAULTS.profitMargin,
        riskMargin: dto.riskMargin ?? this.DEFAULTS.riskMargin,
        discount: dto.discount ?? this.DEFAULTS.discount,
        items: {
          create: items.map((item, index) => ({
            type: item.type,
            description: item.description,
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit || 'Stk',
            unitCost: item.unitCost,
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

    // Calculate and store totals
    const result = this.calculateResult(calculation);
    await this.prisma.calculation.update({
      where: { id: calculation.id },
      data: {
        totalCost: result.directCosts,
        totalPrice: result.grandTotal,
      },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'CALCULATIONS' as any,
            entityType: 'CALCULATION',
            entityId: calculation.id,
            entityName: calculation.name || calculation.number || '',
            action: 'CREATE' as any,
            description: `Kalkulation "${calculation.name || calculation.number || ''}" erstellt`,
            newValues: { name: calculation.name, number: calculation.number },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return { ...calculation, result };
  }

  async update(id: string, companyId: string, dto: UpdateCalculationDto, userId?: string) {
    const calculation = await this.findOne(id, companyId);
    const oldValues = { name: calculation.name, number: calculation.number };

    if (calculation.status === CalculationStatus.TRANSFERRED) {
      throw new BadRequestException('Übertragene Kalkulation kann nicht bearbeitet werden');
    }

    // Update items if provided
    if (dto.items) {
      await this.prisma.calculationItem.deleteMany({ where: { calculationId: id } });
      await this.prisma.calculationItem.createMany({
        data: dto.items.map((item, index) => ({
          calculationId: id,
          type: item.type,
          description: item.description,
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit || 'Stk',
          unitCost: item.unitCost,
          hours: item.hours,
          hourlyRate: item.hourlyRate,
          total: this.calculateItemTotal(item),
          sortOrder: item.sortOrder ?? index,
        })),
      });
    }

    const updated = await this.prisma.calculation.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        customerId: dto.customerId,
        projectId: dto.projectId,
        bomId: dto.bomId,
        status: dto.status,
        materialMarkup: dto.materialMarkup,
        laborMarkup: dto.laborMarkup,
        overheadPercent: dto.overheadPercent,
        profitMargin: dto.profitMargin,
        riskMargin: dto.riskMargin,
        discount: dto.discount,
      },
      include: {
        project: { select: { id: true, name: true } },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });

    const result = this.calculateResult(updated);
    await this.prisma.calculation.update({
      where: { id },
      data: {
        totalCost: result.directCosts,
        totalPrice: result.grandTotal,
      },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'CALCULATIONS' as any,
            entityType: 'CALCULATION',
            entityId: updated.id,
            entityName: updated.name || updated.number || '',
            action: 'UPDATE' as any,
            description: `Kalkulation "${updated.name || updated.number || ''}" aktualisiert`,
            oldValues,
            newValues: { name: updated.name, number: updated.number },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return { ...updated, result };
  }

  async delete(id: string, companyId: string, userId?: string) {
    const calculation = await this.findOne(id, companyId);
    const entityName = calculation.name || calculation.number || '';

    if (calculation.status === CalculationStatus.TRANSFERRED) {
      throw new BadRequestException('Übertragene Kalkulation kann nicht gelöscht werden');
    }

    const deleted = await this.prisma.calculation.delete({ where: { id } });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'CALCULATIONS' as any,
            entityType: 'CALCULATION',
            entityId: deleted.id,
            entityName,
            action: 'DELETE' as any,
            description: `Kalkulation "${entityName}" gelöscht`,
            oldValues: { name: calculation.name, number: calculation.number },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return deleted;
  }

  // Transfer calculation to quote
  async transferToQuote(id: string, companyId: string, userId: string) {
    const calculation = await this.findOne(id, companyId);
    const result = calculation.result;

    if (!calculation.customerId) {
      throw new BadRequestException('Kein Kunde hinterlegt. Bitte zuerst Kunde zuweisen.');
    }

    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const year = new Date().getFullYear();
    const quoteNumber = `AN-${year}-${String((company?.quoteCounter || 0) + 1).padStart(4, '0')}`;

    try {
      const quoteItems = calculation.items.map((item: any, index: number) => {
        const pid = item.productId && String(item.productId).trim().length > 0 ? String(item.productId).trim() : undefined;
        return {
          position: index + 1,
          ...(pid ? { productId: pid } : {}),
          description: item.description || 'Position',
          quantity: Number(item.quantity) || 1,
          unit: item.unit || 'Stk',
          unitPrice: Number(item.unitCost) * (1 + (
            item.type === 'MATERIAL' ? Number(calculation.materialMarkup) :
            item.type === 'LABOR' ? Number(calculation.laborMarkup) : 0
          ) / 100),
          discount: 0,
          total: Number(item.total) || 0,
        };
      });

      const quote = await this.prisma.quote.create({
        data: {
          company: { connect: { id: companyId } },
          number: quoteNumber,
          customer: { connect: { id: calculation.customerId } },
          createdBy: { connect: { id: userId } },
          status: 'DRAFT',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          subtotal: result.netTotal || 0,
          vatAmount: result.vatAmount || 0,
          total: result.grandTotal || 0,
          notes: `Basierend auf Kalkulation ${calculation.number}`,
          items: {
            create: quoteItems,
          },
        },
      });

      await this.prisma.calculation.update({
        where: { id },
        data: { 
          status: CalculationStatus.TRANSFERRED,
          quoteId: quote.id,
        },
      });

      await this.prisma.company.update({
        where: { id: companyId },
        data: { quoteCounter: { increment: 1 } },
      });

      if (userId) {
        try {
          await this.prisma.auditLog.create({
            data: {
              module: 'CALCULATIONS' as any,
              entityType: 'CALCULATION',
              entityId: calculation.id,
              entityName: calculation.name || calculation.number || '',
              action: 'CREATE' as any,
              description: `Kalkulation "${calculation.name || calculation.number || ''}" zu Angebot übertragen`,
              newValues: { quoteId: quote.id, quoteNumber: quote.number },
              retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
              companyId,
              userId,
            },
          });
        } catch (e) { /* audit log failure should not break main operation */ }
      }

      return {
        calculation: await this.findOne(id, companyId),
        quote,
      };
    } catch (error) {
      console.error('transferToQuote error:', error?.message || error);
      throw new BadRequestException(`Fehler beim Erstellen des Angebots: ${error?.message || 'Unbekannter Fehler'}`);
    }
  }

  // Calculate all costs and prices
  private calculateResult(calculation: any): CalculationResultDto {
    const items = calculation.items || [];

    // Direct costs by type
    const materialCost = this.sumByType(items, 'MATERIAL');
    const laborCost = this.sumByType(items, 'LABOR');
    const externalCost = this.sumByType(items, 'EXTERNAL');
    const overheadCost = this.sumByType(items, 'OVERHEAD');
    
    const directCosts = materialCost + laborCost + externalCost + overheadCost;

    // Markups
    const materialMarkupPercent = Number(calculation.materialMarkup) || this.DEFAULTS.materialMarkup;
    const laborMarkupPercent = Number(calculation.laborMarkup) || this.DEFAULTS.laborMarkup;
    const overheadPercent = Number(calculation.overheadPercent) || this.DEFAULTS.overheadPercent;
    const profitMarginPercent = Number(calculation.profitMargin) || this.DEFAULTS.profitMargin;
    const riskMarginPercent = Number(calculation.riskMargin) || this.DEFAULTS.riskMargin;
    const discountPercent = Number(calculation.discount) || 0;

    const materialMarkupAmount = materialCost * (materialMarkupPercent / 100);
    const laborMarkupAmount = laborCost * (laborMarkupPercent / 100);
    const overheadAmount = directCosts * (overheadPercent / 100);

    const subtotal = directCosts + materialMarkupAmount + laborMarkupAmount + overheadAmount;

    const profitAmount = subtotal * (profitMarginPercent / 100);
    const riskAmount = subtotal * (riskMarginPercent / 100);

    const grossTotal = subtotal + profitAmount + riskAmount;
    const discountAmount = grossTotal * (discountPercent / 100);

    const netTotal = grossTotal - discountAmount;
    const vatAmount = netTotal * (this.VAT_RATE / 100);
    const grandTotal = netTotal + vatAmount;

    // Calculate effective hourly rate
    const totalHours = items
      .filter((i: any) => i.type === 'LABOR')
      .reduce((sum: number, i: any) => sum + Number(i.hours || 0), 0);
    const hourlyRateEffective = totalHours > 0 ? grandTotal / totalHours : 0;

    // Overall margin
    const marginPercent = directCosts > 0 ? ((grandTotal - directCosts) / directCosts) * 100 : 0;

    return {
      materialCost,
      laborCost,
      externalCost,
      directCosts,
      materialMarkupAmount,
      laborMarkupAmount,
      overheadAmount,
      subtotal,
      profitAmount,
      riskAmount,
      grossTotal,
      discountAmount,
      netTotal,
      vatAmount,
      grandTotal,
      hourlyRateEffective: Math.round(hourlyRateEffective * 100) / 100,
      marginPercent: Math.round(marginPercent * 10) / 10,
    };
  }

  private calculateItemTotal(item: any): number {
    if (item.type === 'LABOR' && item.hours && item.hourlyRate) {
      return item.hours * item.hourlyRate;
    }
    return (item.quantity || 0) * (item.unitCost || 0);
  }

  private sumByType(items: any[], type: string): number {
    return items
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + Number(item.total || 0), 0);
  }
}
