import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCreditNoteDto, UpdateCreditNoteDto, CreateCreditNoteFromInvoiceDto } from './dto/credit-note.dto';
import { CreditNoteStatus } from '@prisma/client';
import { mapCreditNoteResponse } from '../../common/mappers/response.mapper';

@Injectable()
export class CreditNotesService {
  constructor(private prisma: PrismaService) {}

  private readonly VAT_RATE = 8.1; // Swiss standard VAT

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    customerId?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, customerId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.creditNote.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, companyName: true, email: true, phone: true, street: true, zipCode: true, city: true, country: true },
          },
          invoice: { select: { id: true, number: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        } as any,
      }),
      this.prisma.creditNote.count({ where }),
    ]);

    return {
      data: data.map(mapCreditNoteResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const creditNote = await this.prisma.creditNote.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        invoice: { select: { id: true, number: true } },
        project: { select: { id: true, number: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: {
          include: { product: true },
        },
      } as any,
    });

    if (!creditNote) {
      throw new NotFoundException('Gutschrift nicht gefunden');
    }

    return mapCreditNoteResponse(creditNote);
  }

  async create(companyId: string, dto: CreateCreditNoteDto, userId?: string) {
    // Calculate totals
    let subtotal = 0;
    const itemsWithTotals = dto.items.map((item, index) => {
      const vatRate = item.vatRate ?? this.VAT_RATE;
      const lineTotal = item.quantity * item.unitPrice;
      const vatAmount = lineTotal * (vatRate / 100);
      subtotal += lineTotal;
      
      return {
        productId: item.productId ?? undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit || 'Stk',
        description: item.description,
        vatRate,
        vatAmount,
        total: lineTotal + vatAmount,
        position: index + 1,
      };
    });

    const vatAmount = subtotal * (this.VAT_RATE / 100);
    const totalAmount = subtotal + vatAmount;

    // Atomare Nummerierung via Company-Counter
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { creditNoteCounter: { increment: 1 } },
      select: { creditNoteCounter: true },
    });
    const year = new Date().getFullYear();
    const number = `GS-${year}-${String(company.creditNoteCounter).padStart(4, '0')}`;

    const created = await this.prisma.creditNote.create({
      data: {
        companyId,
        customerId: dto.customerId,
        invoiceId: dto.invoiceId,
        number,
        status: dto.status || CreditNoteStatus.DRAFT,
        reason: dto.reason,
        reasonText: dto.reasonText,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
        subtotal,
        vatRate: this.VAT_RATE,
        vatAmount,
        totalAmount,
        notes: dto.notes,
        createdById: userId ?? undefined,
        items: {
          create: itemsWithTotals,
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
    return mapCreditNoteResponse(created);
  }

  async update(id: string, companyId: string, dto: UpdateCreditNoteDto) {
    const creditNote = await this.findOne(id, companyId);

    if (creditNote.status === CreditNoteStatus.APPLIED) {
      throw new BadRequestException('Verbuchte Gutschrift kann nicht bearbeitet werden');
    }

    let updateData: any = {
      status: dto.status,
      reason: dto.reason,
      reasonText: dto.reasonText,
      notes: dto.notes,
    };

    // Recalculate if items changed
    if (dto.items) {
      await this.prisma.creditNoteItem.deleteMany({
        where: { creditNoteId: id },
      });

      let subtotal = 0;
      const itemsWithTotals = dto.items.map((item, index) => {
        const vatRate = item.vatRate ?? this.VAT_RATE;
        const lineTotal = item.quantity * item.unitPrice;
        const vatAmount = lineTotal * (vatRate / 100);
        subtotal += lineTotal;
        
        return {
          productId: item.productId ?? undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit || 'Stk',
          description: item.description,
          vatRate,
          vatAmount,
          total: lineTotal + vatAmount,
          position: index + 1,
        };
      });

      const vatAmount = subtotal * (this.VAT_RATE / 100);
      const totalAmount = subtotal + vatAmount;

      updateData = {
        ...updateData,
        subtotal,
        vatAmount,
        totalAmount,
        items: { create: itemsWithTotals },
      };
    }

    // Set issued date when status changes to ISSUED
    if (dto.status === CreditNoteStatus.ISSUED && creditNote.status === CreditNoteStatus.DRAFT) {
      updateData.issueDate = new Date();
    }

    const updated = await this.prisma.creditNote.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
    return mapCreditNoteResponse(updated);
  }

  async send(id: string, companyId: string) {
    const creditNote = await this.prisma.creditNote.findFirst({
      where: { id, companyId },
    });

    if (!creditNote) throw new NotFoundException('Gutschrift nicht gefunden');

    if (creditNote.status !== CreditNoteStatus.DRAFT) {
      throw new BadRequestException('Nur Entwürfe können versendet werden');
    }

    const updated = await this.prisma.creditNote.update({
      where: { id },
      data: {
        status: CreditNoteStatus.ISSUED,
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    return mapCreditNoteResponse(updated);
  }

  async delete(id: string, companyId: string) {
    const creditNote = await this.findOne(id, companyId);

    if (creditNote.status === CreditNoteStatus.APPLIED) {
      throw new BadRequestException('Verbuchte Gutschrift kann nicht gelöscht werden');
    }

    await this.prisma.creditNoteItem.deleteMany({
      where: { creditNoteId: id },
    });

    return this.prisma.creditNote.delete({ where: { id } });
  }

  // Gutschrift aus Rechnung erstellen (gesamt oder partielle Positionen)
  async createFromInvoice(invoiceId: string, companyId: string, dto: CreateCreditNoteFromInvoiceDto, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, companyId },
        include: { items: true, customer: true },
      });

      if (!invoice) {
        throw new NotFoundException('Rechnung nicht gefunden');
      }

      // Positionen auswählen: Falls keine Items angegeben → alle übernehmen
      let selectedItems: Array<{
        productId: string | null;
        quantity: number;
        unitPrice: number;
        unit: string;
        description: string | null;
        vatRate: number;
      }>;

      if (!dto.items || dto.items.length === 0) {
        // Gesamte Gutschrift
        selectedItems = invoice.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          unit: item.unit || 'Stk',
          description: item.description,
          vatRate: Number(item.vatRate),
        }));
      } else {
        // Partielle Gutschrift – nur gewählte Positionen mit ggf. angepasster Menge
        const itemMap = new Map(invoice.items.map((i) => [i.id, i]));
        selectedItems = dto.items.map(({ invoiceItemId, quantity }) => {
          const item = itemMap.get(invoiceItemId);
          if (!item) throw new BadRequestException(`Rechnungsposition ${invoiceItemId} nicht gefunden`);
          if (quantity > Number(item.quantity)) {
            throw new BadRequestException(
              `Menge (${quantity}) darf Rechnungsmenge (${item.quantity}) nicht überschreiten`,
            );
          }
          return {
            productId: item.productId,
            quantity,
            unitPrice: Number(item.unitPrice),
            unit: item.unit || 'Stk',
            description: item.description,
            vatRate: Number(item.vatRate),
          };
        });
      }

      // Totals berechnen
      let subtotal = 0;
      const itemsWithTotals = selectedItems.map((item, index) => {
        const lineTotal = item.quantity * item.unitPrice;
        const vatAmount = lineTotal * (item.vatRate / 100);
        subtotal += lineTotal;
        return {
          productId: item.productId ?? undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit,
          description: item.description,
          vatRate: item.vatRate,
          vatAmount,
          total: lineTotal + vatAmount,
          position: index + 1,
        };
      });
      const vatAmount = subtotal * (this.VAT_RATE / 100);
      const totalAmount = subtotal + vatAmount;

      // Atomare Nummerierung via Company-Counter
      const company = await tx.company.update({
        where: { id: companyId },
        data: { creditNoteCounter: { increment: 1 } },
        select: { creditNoteCounter: true },
      });
      const year = new Date().getFullYear();
      const number = `GS-${year}-${String(company.creditNoteCounter).padStart(4, '0')}`;

      const creditNote = await tx.creditNote.create({
        data: {
          companyId,
          customerId: invoice.customerId,
          invoiceId: invoice.id,
          projectId: invoice.projectId ?? undefined,
          billingAddress: invoice.billingAddress ?? undefined,
          notes: invoice.notes ?? undefined,
          number,
          status: CreditNoteStatus.DRAFT,
          reason: dto.reason,
          reasonText: dto.reasonText || String(dto.reason),
          issueDate: new Date(),
          subtotal,
          vatRate: this.VAT_RATE,
          vatAmount,
          totalAmount,
          createdById: userId ?? undefined,
          items: { create: itemsWithTotals },
        },
        include: {
          customer: true,
          invoice: { select: { id: true, number: true } },
          project: { select: { id: true, name: true, number: true } },
          items: { include: { product: true } },
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            module: 'INVOICES',
            entityType: 'CREDIT_NOTE',
            entityId: creditNote.id,
            action: 'CREATE',
            description: `Gutschrift ${creditNote.number} aus Rechnung ${invoice.number} erstellt. Grund: ${dto.reason}`,
            oldValues: { invoiceId: invoice.id, invoiceNumber: invoice.number },
            newValues: { creditNoteId: creditNote.id, number, reason: dto.reason, itemCount: itemsWithTotals.length },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      }

      return mapCreditNoteResponse(creditNote);
    });
  }
}
