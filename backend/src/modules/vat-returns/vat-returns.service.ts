import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateVatReturnDto, 
  UpdateVatReturnDto, 
  VatReturnStatus,
  VatReturnPeriod,
  VatMethod,
  SubmitVatReturnDto,
  VatReturnDataDto 
} from './dto/vat-return.dto';

@Injectable()
export class VatReturnsService {
  constructor(private prisma: PrismaService) {}

  // Swiss VAT rates
  private readonly VAT_RATES = {
    STANDARD: 0.081,
    REDUCED: 0.026,
    SPECIAL: 0.038,
  };

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    year?: number;
    period?: string;
  }) {
    const { page = 1, pageSize = 20, status, year, period } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (year) where.year = year;
    if (period) where.period = period;

    const [data, total] = await Promise.all([
      this.prisma.vatReturn.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ year: 'desc' }, { quarter: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.vatReturn.count({ where }),
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
    const vatReturn = await this.prisma.vatReturn.findFirst({
      where: { id, companyId },
    });

    if (!vatReturn) {
      throw new NotFoundException('MwSt-Abrechnung nicht gefunden');
    }

    return vatReturn;
  }

  async create(companyId: string, dto: CreateVatReturnDto) {
    // Check for duplicate period
    const existing = await this.prisma.vatReturn.findFirst({
      where: {
        companyId,
        year: dto.year,
        period: dto.period,
        quarter: dto.quarter,
        month: dto.month,
      },
    });
    if (existing) {
      throw new BadRequestException('MwSt-Abrechnung für diese Periode existiert bereits');
    }

    // Generate number
    const periodStr = dto.period === VatReturnPeriod.MONTHLY 
      ? `M${dto.month}` 
      : dto.period === VatReturnPeriod.QUARTERLY 
        ? `Q${dto.quarter}` 
        : 'Y';
    const number = `MWST-${dto.year}-${periodStr}`;

    return this.prisma.vatReturn.create({
      data: {
        companyId,
        number,
        year: dto.year,
        period: dto.period,
        quarter: dto.quarter,
        month: dto.month,
        method: dto.method || VatMethod.AGREED,
        status: VatReturnStatus.DRAFT,
        data: {},
      },
    });
  }

  async calculate(id: string, companyId: string) {
    const vatReturn = await this.findOne(id, companyId);

    if (vatReturn.status === VatReturnStatus.SUBMITTED || vatReturn.status === VatReturnStatus.ACCEPTED) {
      throw new BadRequestException('Eingereichte Abrechnung kann nicht neu berechnet werden');
    }

    // Determine date range
    const { startDate, endDate } = this.getPeriodDates(
      vatReturn.year,
      vatReturn.period as VatReturnPeriod,
      vatReturn.quarter,
      vatReturn.month
    );

    // Get sales invoices (revenue)
    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
        status: { in: ['SENT', 'PAID', 'PARTIAL'] },
      },
      include: {
        items: true,
      },
    });

    // Get purchase invoices (input tax)
    const purchaseInvoices = await this.prisma.purchaseInvoice.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
        status: { in: ['APPROVED', 'PAID'] },
      },
    });

    // Calculate revenue by VAT rate
    let totalRevenue = 0;
    let taxableRevenue81 = 0;
    let taxableRevenue26 = 0;
    let taxableRevenue38 = 0;
    let exportRevenue = 0;
    let exemptRevenue = 0;

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        const amount = Number(item.quantity) * Number(item.unitPrice);
        totalRevenue += amount;

        if (item.vatRate === 'STANDARD') {
          taxableRevenue81 += amount;
        } else if (item.vatRate === 'REDUCED') {
          taxableRevenue26 += amount;
        } else if (item.vatRate === 'SPECIAL') {
          taxableRevenue38 += amount;
        } else if (item.vatRate === 'EXEMPT') {
          exemptRevenue += amount;
        }
      });
    });

    // Calculate output VAT
    const outputTax81 = taxableRevenue81 * this.VAT_RATES.STANDARD;
    const outputTax26 = taxableRevenue26 * this.VAT_RATES.REDUCED;
    const outputTax38 = taxableRevenue38 * this.VAT_RATES.SPECIAL;
    const totalOutputTax = outputTax81 + outputTax26 + outputTax38;

    // Calculate input tax
    const inputTaxMaterial = purchaseInvoices.reduce((sum, pi) => sum + Number(pi.vatAmount || 0), 0);
    const inputTaxInvestments = 0; // Would need separate tracking
    const inputTaxServices = 0;
    const totalInputTax = inputTaxMaterial + inputTaxInvestments + inputTaxServices;

    // Calculate payable/refund
    const vatPayable = totalOutputTax - totalInputTax;

    const data: VatReturnDataDto = {
      totalRevenue,
      exportRevenue,
      exemptRevenue,
      otherDeductions: 0,
      taxableRevenue81,
      taxableRevenue26,
      taxableRevenue38,
      inputTaxMaterial,
      inputTaxInvestments,
      inputTaxServices,
      inputTaxCorrections: 0,
      subsidies: 0,
      mixedUseCorrection: 0,
    };

    return this.prisma.vatReturn.update({
      where: { id },
      data: {
        data,
        totalOutputTax,
        totalInputTax,
        vatPayable,
        status: VatReturnStatus.CALCULATED,
        calculatedAt: new Date(),
      },
    });
  }

  async submit(id: string, companyId: string, dto: SubmitVatReturnDto) {
    const vatReturn = await this.findOne(id, companyId);

    if (vatReturn.status !== VatReturnStatus.CALCULATED) {
      throw new BadRequestException('Nur berechnete Abrechnungen können eingereicht werden');
    }

    return this.prisma.vatReturn.update({
      where: { id },
      data: {
        status: VatReturnStatus.SUBMITTED,
        submittedAt: new Date(dto.submissionDate),
        submissionMethod: dto.submissionMethod,
        submissionReference: dto.reference,
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateVatReturnDto) {
    const vatReturn = await this.findOne(id, companyId);

    if (vatReturn.status === VatReturnStatus.ACCEPTED) {
      throw new BadRequestException('Akzeptierte Abrechnung kann nicht bearbeitet werden');
    }

    return this.prisma.vatReturn.update({
      where: { id },
      data: {
        status: dto.status,
        data: dto.data ? { ...(vatReturn.data as object), ...dto.data } : undefined,
        notes: dto.notes,
        submissionReference: dto.submissionReference,
      },
    });
  }

  async delete(id: string, companyId: string) {
    const vatReturn = await this.findOne(id, companyId);

    if (vatReturn.status !== VatReturnStatus.DRAFT) {
      throw new BadRequestException('Nur Entwürfe können gelöscht werden');
    }

    return this.prisma.vatReturn.delete({ where: { id } });
  }

  // Generate eCH-0217 XML export
  async exportXml(id: string, companyId: string) {
    const vatReturn = await this.findOne(id, companyId);
    const company = await this.prisma.company.findFirst({ where: { id: companyId } });

    const data = vatReturn.data as VatReturnDataDto;

    // Generate XML according to eCH-0217 standard
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eCH-0217:VATDeclaration xmlns:eCH-0217="http://www.ech.ch/xmlns/eCH-0217/1">
  <eCH-0217:declarationId>${vatReturn.number}</eCH-0217:declarationId>
  <eCH-0217:UID>${company?.vatNumber || ''}</eCH-0217:UID>
  <eCH-0217:taxPeriod>
    <eCH-0217:year>${vatReturn.year}</eCH-0217:year>
    <eCH-0217:period>${vatReturn.period}</eCH-0217:period>
    ${vatReturn.quarter ? `<eCH-0217:quarter>${vatReturn.quarter}</eCH-0217:quarter>` : ''}
  </eCH-0217:taxPeriod>
  <eCH-0217:totalRevenue>${data?.totalRevenue || 0}</eCH-0217:totalRevenue>
  <eCH-0217:taxableRevenue81>${data?.taxableRevenue81 || 0}</eCH-0217:taxableRevenue81>
  <eCH-0217:taxableRevenue26>${data?.taxableRevenue26 || 0}</eCH-0217:taxableRevenue26>
  <eCH-0217:totalOutputTax>${vatReturn.totalOutputTax || 0}</eCH-0217:totalOutputTax>
  <eCH-0217:totalInputTax>${vatReturn.totalInputTax || 0}</eCH-0217:totalInputTax>
  <eCH-0217:vatPayable>${vatReturn.vatPayable || 0}</eCH-0217:vatPayable>
</eCH-0217:VATDeclaration>`;

    return {
      xml,
      filename: `${vatReturn.number}.xml`,
    };
  }

  // Get summary for dashboard
  async getSummary(companyId: string, year: number) {
    const returns = await this.prisma.vatReturn.findMany({
      where: { companyId, year },
      orderBy: [{ quarter: 'asc' }, { month: 'asc' }],
    });

    const totalOutputTax = returns.reduce((sum, r) => sum + Number(r.totalOutputTax || 0), 0);
    const totalInputTax = returns.reduce((sum, r) => sum + Number(r.totalInputTax || 0), 0);
    const totalPayable = returns.reduce((sum, r) => sum + Number(r.vatPayable || 0), 0);

    const submitted = returns.filter(r => 
      r.status === VatReturnStatus.SUBMITTED || r.status === VatReturnStatus.ACCEPTED
    ).length;

    return {
      year,
      totalPeriods: returns.length,
      submittedPeriods: submitted,
      totalOutputTax,
      totalInputTax,
      totalPayable,
      returns: returns.map(r => ({
        id: r.id,
        number: r.number,
        period: r.period,
        quarter: r.quarter,
        month: r.month,
        status: r.status,
        vatPayable: r.vatPayable,
      })),
    };
  }

  private getPeriodDates(year: number, period: VatReturnPeriod, quarter?: number | null, month?: number | null) {
    let startDate: Date;
    let endDate: Date;

    if (period === VatReturnPeriod.MONTHLY && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else if (period === VatReturnPeriod.QUARTERLY && quarter) {
      const startMonth = (quarter - 1) * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 0, 23, 59, 59);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    return { startDate, endDate };
  }
}
