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

    return settings;
  }

  async updateSettings(companyId: string, dto: UpdateSettingsDto) {
    const settings = await this.prisma.companySettings.upsert({
      where: { companyId },
      create: { companyId, ...dto },
      update: dto,
    });

    return settings;
  }

  async generateApiKey(companyId: string) {
    const crypto = require('crypto');
    const apiKey = `lmra_${crypto.randomBytes(32).toString('hex')}`;

    await this.prisma.companySettings.upsert({
      where: { companyId },
      create: { companyId },
      update: {},
    });

    return {
      apiKey,
      prefix: apiKey.substring(0, 12) + '...',
      createdAt: new Date().toISOString(),
    };
  }
}
