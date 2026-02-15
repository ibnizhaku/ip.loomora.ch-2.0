import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Schritt 1: Secret generieren + QR-Code erstellen
   */
  async setup(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new BadRequestException('User nicht gefunden');
    if (user.twoFactorEnabled) throw new BadRequestException('2FA ist bereits aktiviert');

    const secret = speakeasy.generateSecret({
      name: `Loomora (${user.email})`,
      issuer: 'Loomora',
      length: 32,
    });

    // Secret temporär speichern (noch nicht aktiviert!)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
      manualEntry: secret.base32,
    };
  }

  /**
   * Schritt 2: Erstmalige Verifizierung → 2FA aktivieren
   */
  async verify(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA Setup wurde nicht gestartet');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException('Ungültiger Code. Bitte erneut versuchen.');
    }

    const recoveryCodes = this.generateRecoveryCodes();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorRecovery: recoveryCodes,
      },
    });

    return {
      success: true,
      recoveryCodes,
      message: '2FA wurde erfolgreich aktiviert',
    };
  }

  /**
   * Schritt 3: Login-Validierung – TOTP oder Recovery Code prüfen
   */
  async authenticate(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA ist nicht aktiviert');
    }

    // Erst TOTP prüfen
    const isValidTotp = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (isValidTotp) {
      return { success: true, method: 'totp' };
    }

    // Falls TOTP fehlschlägt → Recovery Code prüfen
    const normalizedCode = code.toUpperCase().replace(/\s/g, '');
    const recoveryIndex = user.twoFactorRecovery.indexOf(normalizedCode);
    if (recoveryIndex >= 0) {
      const updatedCodes = [...user.twoFactorRecovery];
      updatedCodes.splice(recoveryIndex, 1);

      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorRecovery: updatedCodes },
      });

      return {
        success: true,
        method: 'recovery',
        remainingRecoveryCodes: updatedCodes.length,
      };
    }

    throw new UnauthorizedException('Ungültiger 2FA-Code');
  }

  /**
   * 2FA deaktivieren (mit Code-Bestätigung)
   */
  async disable(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA ist nicht aktiviert');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException('Ungültiger Code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecovery: [],
      },
    });

    return { success: true, message: '2FA wurde deaktiviert' };
  }

  /**
   * Admin: 2FA für einen User zurücksetzen
   */
  async adminReset(targetUserId: string, requestingUserId: string, companyId: string) {
    const membership = await this.prisma.userCompanyMembership.findUnique({
      where: { userId_companyId: { userId: requestingUserId, companyId } },
      include: { role: true },
    });

    if (!membership || (!membership.isOwner && !['Admin', 'Owner'].includes(membership.role.name))) {
      throw new UnauthorizedException('Nur Admins können 2FA zurücksetzen');
    }

    // Verify target user is in same company
    const targetMembership = await this.prisma.userCompanyMembership.findUnique({
      where: { userId_companyId: { userId: targetUserId, companyId } },
    });

    if (!targetMembership) {
      throw new BadRequestException('User nicht in dieser Company');
    }

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecovery: [],
      },
    });

    return { success: true, message: '2FA wurde zurückgesetzt' };
  }

  /**
   * 2FA-Status eines Users prüfen
   */
  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true, twoFactorRecovery: true },
    });

    return {
      enabled: user?.twoFactorEnabled || false,
      recoveryCodesRemaining: user?.twoFactorRecovery?.length || 0,
    };
  }

  /**
   * 8 Recovery Codes generieren (Format: XXXX-XXXX)
   */
  private generateRecoveryCodes(): string[] {
    return Array.from({ length: 8 }, () => {
      const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      return `${part1}-${part2}`;
    });
  }
}
