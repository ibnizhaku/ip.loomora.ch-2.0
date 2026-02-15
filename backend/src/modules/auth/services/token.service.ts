import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload, TempJwtPayload, RefreshTokenPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Generiert Access Token mit vollständigem Multi-Tenant Context
   */
  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });
  }

  /**
   * Generiert Temporary Token (für Company-Auswahl oder Payment-Flow)
   */
  async generateTempToken(payload: TempJwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '10m', // Kurze Gültigkeit
    });
  }

  /**
   * Generiert Refresh Token und speichert Hash in DB
   */
  async generateRefreshToken(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    // Token ID für Revocation
    const jti = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const refreshPayload: RefreshTokenPayload = {
      sub: userId,
      jti,
      type: 'refresh',
    };

    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: refreshExpiresIn,
    });

    // Parse expiration
    const expiresAt = new Date();
    const days = parseInt(refreshExpiresIn.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + (isNaN(days) ? 7 : days));

    // Hash und speichern
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        deviceInfo,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return refreshToken;
  }

  /**
   * Validiert Refresh Token und gibt User ID zurück
   */
  async validateRefreshToken(token: string): Promise<{ userId: string; jti: string } | null> {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token);
      
      if (payload.type !== 'refresh') {
        return null;
      }

      // Prüfen ob Token in DB existiert und nicht revoked
      const storedTokens = await this.prisma.refreshToken.findMany({
        where: {
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      // Prüfen ob einer der Tokens matcht
      for (const storedToken of storedTokens) {
        const isValid = await bcrypt.compare(token, storedToken.tokenHash);
        if (isValid) {
          return { userId: payload.sub, jti: payload.jti };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Revoke einen spezifischen Refresh Token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token);
      
      const storedTokens = await this.prisma.refreshToken.findMany({
        where: {
          userId: payload.sub,
          revokedAt: null,
        },
      });

      for (const storedToken of storedTokens) {
        const isValid = await bcrypt.compare(token, storedToken.tokenHash);
        if (isValid) {
          await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
          });
          break;
        }
      }
    } catch {
      // Token ungültig, ignorieren
    }
  }

  /**
   * Revoke alle Refresh Tokens eines Users
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Cleanup abgelaufener Tokens (als Cron-Job ausführen)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
    return result.count;
  }

  /**
   * Verifiziert einen Access Token
   */
  verifyAccessToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  /**
   * Verifiziert einen Temporary Token
   */
  verifyTempToken(token: string): TempJwtPayload | null {
    try {
      const payload = this.jwtService.verify<TempJwtPayload>(token);
      if (payload.type === 'company_selection' || payload.type === 'payment_pending' || payload.type === 'two_factor_pending') {
        return payload;
      }
      return null;
    } catch {
      return null;
    }
  }
}
