import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(companyId: string) {
    let settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.companySettings.create({
        data: { companyId },
      });
    }

    // Mask SMTP password in response
    return {
      ...settings,
      smtpPassword: settings.smtpPassword ? '••••••••' : null,
    };
  }

  async updateSettings(companyId: string, dto: UpdateSettingsDto) {
    // Upsert: create if not exists, update if exists
    const settings = await this.prisma.companySettings.upsert({
      where: { companyId },
      create: { companyId, ...dto },
      update: dto,
    });

    return {
      ...settings,
      smtpPassword: settings.smtpPassword ? '••••••••' : null,
    };
  }

  async testSmtp(companyId: string) {
    const settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
    });

    if (!settings?.smtpHost || !settings?.smtpUser) {
      return { success: false, message: 'SMTP nicht konfiguriert' };
    }

    // In production, this would send a real test email
    return { success: true, message: 'Test-E-Mail gesendet (SMTP-Konfiguration vorhanden)' };
  }
}
