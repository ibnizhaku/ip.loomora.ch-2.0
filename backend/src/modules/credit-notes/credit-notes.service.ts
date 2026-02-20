import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCreditNoteDto, UpdateCreditNoteDto } from './dto/credit-note.dto';
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
        },
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
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: {
          include: { product: true },
        },
      },
    });

    if (!creditNote) {
      throw new NotFoundException('Gutschrift nicht gefunden');
    }

    return mapCreditNoteResponse(creditNote);
  }

  async create(companyId: string, dto: CreateCreditNoteDto) {
    // Calculate totals
    let subtotal = 0;
    const itemsWithTotals = dto.items.map((item, index) => {
      const vatRate = item.vatRate ?? this.VAT_RATE;
      const lineTotal = item.quantity * item.unitPrice;
      const vatAmount = lineTotal * (vatRate / 100);
      subtotal += lineTotal;
      
      return {
        productId: item.productId,
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

    // Generate credit note number
    const count = await this.prisma.creditNote.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `GS-${year}-${String(count + 1).padStart(4, '0')}`;

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
          productId: item.productId,
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

  // Create credit note from invoice (for returns/corrections)
  async createFromInvoice(invoiceId: string, companyId: string, reason: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, companyId },
        include: { items: true, customer: true },
      });

      if (!invoice) {
        throw new NotFoundException('Rechnung nicht gefunden');
      }

      // Check if credit note already exists for this invoice
      const existingCreditNote = await tx.creditNote.findFirst({
        where: { invoiceId, companyId },
      });

      if (existingCreditNote) {
        throw new BadRequestException(`Credit note ${existingCreditNote.number} already exists for invoice ${invoice.number}`);
      }

      // Generate credit note number
      const count = await tx.creditNote.count({ where: { companyId } });
      const year = new Date().getFullYear();
      const number = `GS-${year}-${String(count + 1).padStart(4, '0')}`;

      const creditNote = await tx.creditNote.create({
        data: {
          companyId,
          customerId: invoice.customerId,
          invoiceId: invoice.id,
          number,
          status: CreditNoteStatus.DRAFT,
          reason: reason as any,
          reasonText: reason,
          issueDate: new Date(),
          subtotal: invoice.subtotal,
          vatRate: this.VAT_RATE,
          vatAmount: invoice.vatAmount,
          totalAmount: invoice.totalAmount,
          items: {
            create: invoice.items.map((item, index) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              unit: item.unit || 'Stk',
              description: item.description,
              vatRate: Number(item.vatRate),
              vatAmount: Number(item.vatAmount),
              total: Number(item.total),
              position: index + 1,
            })),
          },
        },
        include: {
          customer: true,
          invoice: { select: { id: true, number: true } },
          items: { include: { product: true } },
        },
      });

      // Audit log
      if (userId) {
        await tx.auditLog.create({
          data: {
            module: 'INVOICES',
            entityType: 'CREDIT_NOTE',
            entityId: creditNote.id,
            action: 'CREATE',
            description: `Credit Note ${creditNote.number} created from Invoice ${invoice.number}. Reason: ${reason}`,
            oldValues: { sourceType: 'INVOICE', invoiceId: invoice.id, invoiceNumber: invoice.number },
            newValues: { creditNoteId: creditNote.id, creditNoteNumber: creditNote.number, reason },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      }

      return creditNote;
    });
  }
}
