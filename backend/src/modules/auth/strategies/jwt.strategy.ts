import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUserPayload> {
    // Prüfen ob User existiert und aktiv ist
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 'ACTIVE' || !user.isActive) {
      throw new UnauthorizedException('User nicht gefunden oder nicht aktiv');
    }

    // Prüfen ob Company-ID gesetzt ist
    if (!payload.activeCompanyId) {
      throw new UnauthorizedException('Keine aktive Company ausgewählt');
    }

    // Rolle laden für Namen
    let roleName = 'Unknown';
    if (payload.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: payload.roleId },
      });
      if (role) {
        roleName = role.name;
      }
    }

    return {
      userId: payload.sub,
      email: payload.email,
      companyId: payload.activeCompanyId,
      role: roleName,
      roleId: payload.roleId || '',
      permissions: payload.permissions || [],
      isOwner: payload.isOwner || false,
    };
  }
}
