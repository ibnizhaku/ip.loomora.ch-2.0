import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { PdfService } from '../../common/services/pdf.service';
import { UpsertMailAccountDto, SendMailDto } from './dto/mail.dto';
import { AuditAction, AuditModule } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly pdfService: PdfService,
  ) {}

  async getAccount(userId: string, companyId: string) {
    const account = await this.prisma.userMailAccount.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    if (!account) throw new NotFoundException('Kein Mail-Account konfiguriert');
    return {
      id: account.id,
      smtpHost: account.smtpHost,
      smtpPort: account.smtpPort,
      smtpUser: account.smtpUser,
      fromName: account.fromName,
      fromEmail: account.fromEmail,
      smtpSsl: account.smtpSsl,
      isActive: account.isActive,
    };
  }

  async upsertAccount(userId: string, companyId: string, dto: UpsertMailAccountDto) {
    const existing = await this.prisma.userMailAccount.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    let smtpPasswordEnc: string;
    if (dto.smtpPassword) {
      smtpPasswordEnc = this.crypto.encrypt(dto.smtpPassword);
    } else if (existing) {
      smtpPasswordEnc = existing.smtpPasswordEnc;
    } else {
      throw new BadRequestException('Passwort erforderlich für neuen Account');
    }

    const data = {
      smtpHost: dto.smtpHost,
      smtpPort: dto.smtpPort,
      smtpUser: dto.smtpUser,
      smtpPasswordEnc,
      fromName: dto.fromName,
      fromEmail: dto.fromEmail,
      smtpSsl: dto.smtpSsl,
      isActive: true,
    };

    const result = await this.prisma.userMailAccount.upsert({
      where: { userId_companyId: { userId, companyId } },
      create: { userId, companyId, ...data },
      update: data,
    });

    return {
      id: result.id,
      smtpHost: result.smtpHost,
      smtpPort: result.smtpPort,
      smtpUser: result.smtpUser,
      fromName: result.fromName,
      fromEmail: result.fromEmail,
      smtpSsl: result.smtpSsl,
      isActive: result.isActive,
    };
  }

  async testConnection(userId: string, companyId: string) {
    const account = await this.prisma.userMailAccount.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    if (!account) {
      return { success: false, message: 'Kein Mail-Account konfiguriert' };
    }

    try {
      const password = this.crypto.decrypt(account.smtpPasswordEnc);
      const transporter = nodemailer.createTransport({
        host: account.smtpHost,
        port: account.smtpPort,
        secure: account.smtpSsl,
        auth: { user: account.smtpUser, pass: password },
      });
      await transporter.verify();
      return { success: true, message: 'SMTP-Verbindung erfolgreich' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Verbindung fehlgeschlagen' };
    }
  }

  async sendMail(userId: string, companyId: string, dto: SendMailDto) {
    const account = await this.prisma.userMailAccount.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    if (!account || !account.isActive) {
      throw new NotFoundException('Kein aktiver Mail-Account konfiguriert');
    }

    const password = this.crypto.decrypt(account.smtpPasswordEnc);
    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpSsl,
      auth: { user: account.smtpUser, pass: password },
    });

    // PDF anhängen: Frontend-PDF (Base64) bevorzugen, sonst Backend-Generierung
    const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
    
    if (dto.pdfBase64 && dto.pdfFilename) {
      // Frontend hat bereits das korrekte PDF generiert (gleich wie Vorschau/Download)
      try {
        const pdfBuffer = Buffer.from(dto.pdfBase64, 'base64');
        attachments.push({
          filename: dto.pdfFilename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        });
      } catch (err) {
        console.warn(`[MailService] Base64-PDF Konvertierung fehlgeschlagen: ${err?.message}`);
      }
    } else if (dto.documentId && dto.documentType) {
      // Fallback: Backend generiert PDF
      try {
        const { pdfBuffer, filename } = await this.generateDocumentPdf(
          dto.documentId,
          dto.documentType,
          companyId,
        );
        if (pdfBuffer) {
          attachments.push({
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          });
        }
      } catch (err) {
        console.warn(`[MailService] PDF-Generierung fehlgeschlagen: ${err?.message}`);
      }
    }

    await transporter.sendMail({
      from: `"${account.fromName}" <${account.fromEmail}>`,
      to: dto.to,
      cc: dto.cc || undefined,
      bcc: dto.bcc || undefined,
      subject: dto.subject,
      text: dto.message,
      html: dto.message.replace(/\n/g, '<br>'),
      attachments,
    });

    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: AuditAction.SEND,
        module: this.mapDocumentTypeToModule(dto.documentType ?? 'system'),
        entityId: dto.documentId ?? null,
        entityType: dto.documentType ?? 'system',
        retentionUntil: new Date(Date.now() + 10 * 365.25 * 24 * 60 * 60 * 1000),
      },
    });

    return { success: true, message: 'E-Mail erfolgreich versendet' };
  }

  private async generateDocumentPdf(
    documentId: string,
    documentType: string,
    companyId: string,
  ): Promise<{ pdfBuffer: Buffer; filename: string }> {
    switch (documentType) {
      case 'invoice': {
        const doc = await this.prisma.invoice.findFirst({
          where: { id: documentId, companyId },
          include: { customer: true, items: true },
        });
        if (!doc) throw new NotFoundException('Rechnung nicht gefunden');
        const pdfBuffer = await this.pdfService.generateInvoicePdf(doc);
        return { pdfBuffer, filename: `Rechnung-${doc.number}.pdf` };
      }
      case 'quote': {
        const doc = await this.prisma.quote.findFirst({
          where: { id: documentId, companyId },
          include: { customer: true, items: true },
        });
        if (!doc) throw new NotFoundException('Angebot nicht gefunden');
        const pdfBuffer = await this.pdfService.generateQuotePdf(doc);
        return { pdfBuffer, filename: `Angebot-${doc.number}.pdf` };
      }
      case 'order': {
        const doc = await this.prisma.order.findFirst({
          where: { id: documentId, companyId },
          include: { customer: true, items: true },
        });
        if (!doc) throw new NotFoundException('Auftrag nicht gefunden');
        const pdfBuffer = await this.pdfService.generateOrderPdf(doc);
        return { pdfBuffer, filename: `Auftrag-${doc.number}.pdf` };
      }
      case 'delivery-note': {
        const doc = await this.prisma.deliveryNote.findFirst({
          where: { id: documentId, companyId },
          include: { customer: true, items: true },
        });
        if (!doc) throw new NotFoundException('Lieferschein nicht gefunden');
        const pdfBuffer = await this.pdfService.generateDeliveryNotePdf(doc);
        return { pdfBuffer, filename: `Lieferschein-${doc.number}.pdf` };
      }
      case 'credit-note': {
        const doc = await this.prisma.creditNote.findFirst({
          where: { id: documentId, companyId },
          include: { customer: true, items: true },
        });
        if (!doc) throw new NotFoundException('Gutschrift nicht gefunden');
        const pdfBuffer = await this.pdfService.generateCreditNotePdf(doc);
        return { pdfBuffer, filename: `Gutschrift-${doc.number}.pdf` };
      }
      case 'reminder': {
        const doc = await this.prisma.reminder.findFirst({
          where: { id: documentId, companyId },
          include: { invoice: { include: { customer: true, items: true } } },
        });
        if (!doc) throw new NotFoundException('Mahnung nicht gefunden');
        // Company-Info für Firmen-Header und Zahlungsanweisungen laden
        const company = await this.prisma.company.findFirst({
          where: { id: companyId },
        });
        const pdfBuffer = await this.pdfService.generateReminderPdf({ ...doc, company });
        return { pdfBuffer, filename: `Mahnung-${doc.number}.pdf` };
      }
      default:
        throw new BadRequestException(`Unbekannter Dokumenttyp: ${documentType}`);
    }
  }

  private mapDocumentTypeToModule(documentType: string): AuditModule {
    const map: Record<string, AuditModule> = {
      invoice: AuditModule.INVOICES,
      quote: AuditModule.QUOTES,
      order: AuditModule.ORDERS,
      payment: AuditModule.PAYMENTS,
      'delivery-note': AuditModule.INVOICES,
      'credit-note': AuditModule.INVOICES,
      reminder: AuditModule.INVOICES,
    };
    return map[documentType] ?? AuditModule.SYSTEM;
  }
}
