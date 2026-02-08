import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Company Guard - Prüft ob User zur aktiven Company gehört
 * Wird nach JwtAuthGuard ausgeführt
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.companyId) {
      throw new ForbiddenException('Keine aktive Company ausgewählt');
    }

    // Company laden und Status prüfen
    const company = await this.prisma.company.findUnique({
      where: { id: user.companyId },
    });

    if (!company) {
      throw new ForbiddenException('Company nicht gefunden');
    }

    if (company.status !== 'ACTIVE') {
      throw new ForbiddenException(`Company ist nicht aktiv (Status: ${company.status})`);
    }

    // Membership prüfen
    const membership = await this.prisma.userCompanyMembership.findUnique({
      where: {
        userId_companyId: {
          userId: user.userId,
          companyId: user.companyId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Du bist kein Mitglied dieser Company');
    }

    // Company-Daten in Request speichern für spätere Guards
    request.company = company;
    request.membership = membership;

    return true;
  }
}
