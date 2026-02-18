import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto.service';
import { UpsertMailAccountDto, SendMailDto } from './dto/mail.dto';
import { AuditAction, AuditModule } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
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

    await transporter.sendMail({
      from: `"${account.fromName}" <${account.fromEmail}>`,
      to: dto.to,
      cc: dto.cc || undefined,
      bcc: dto.bcc || undefined,
      subject: dto.subject,
      text: dto.message,
      html: dto.message.replace(/\n/g, '<br>'),
    });

    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: AuditAction.SEND,
        module: this.mapDocumentTypeToModule(dto.documentType),
        entityId: dto.documentId,
        entityType: dto.documentType,
        retentionUntil: new Date(Date.now() + 10 * 365.25 * 24 * 60 * 60 * 1000),
      },
    });

    return { success: true, message: 'E-Mail erfolgreich versendet' };
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
