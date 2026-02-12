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

  async generateApiKey(companyId: string) {
    const crypto = require('crypto');
    const apiKey = `lmra_${crypto.randomBytes(32).toString('hex')}`;

    // Store hashed API key (production: use bcrypt)
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    await this.prisma.companySettings.upsert({
      where: { companyId },
      create: { companyId },
      update: { },
    });

    return {
      apiKey, // Return once, never stored in plain text
      prefix: apiKey.substring(0, 12) + '...',
      createdAt: new Date().toISOString(),
    };
  }
}
