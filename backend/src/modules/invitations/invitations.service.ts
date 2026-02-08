import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipService } from '../auth/services/membership.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { 
  InviteUserDto, 
  AcceptInvitationDto, 
  CreateUserDirectDto,
  InvitationInfoDto,
} from '../auth/dto/auth.dto';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private membershipService: MembershipService,
  ) {}

  /**
   * Einladung per E-Mail erstellen
   */
  async createInvitation(
    companyId: string,
    invitedById: string,
    dto: InviteUserDto,
  ): Promise<{ invitation: any; inviteUrl: string }> {
    // Prüfen ob Role existiert und zur Company gehört
    const role = await this.prisma.role.findFirst({
      where: { id: dto.roleId, companyId },
    });

    if (!role) {
      throw new NotFoundException('Rolle nicht gefunden');
    }

    // Prüfen ob User bereits Mitglied ist
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      const existingMembership = await this.prisma.userCompanyMembership.findUnique({
        where: {
          userId_companyId: { userId: existingUser.id, companyId },
        },
      });

      if (existingMembership) {
        throw new ConflictException('User ist bereits Mitglied dieser Firma');
      }
    }

    // Prüfen ob bereits eine Einladung existiert
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        companyId,
        email: dto.email.toLowerCase(),
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      throw new ConflictException('Einladung bereits versendet');
    }

    // Token generieren
    const token = crypto.randomBytes(32).toString('hex');

    // Einladung erstellen (7 Tage gültig)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.create({
      data: {
        companyId,
        email: dto.email.toLowerCase(),
        roleId: dto.roleId,
        token,
        invitedById,
        expiresAt,
      },
      include: {
        company: true,
        role: true,
      },
    });

    // TODO: E-Mail versenden
    // await this.emailService.sendInvitation(invitation);

    const inviteUrl = `/auth/invitation/${token}`;

    return { invitation, inviteUrl };
  }

  /**
   * Einladung validieren
   */
  async validateInvitation(token: string): Promise<InvitationInfoDto> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        company: true,
        role: true,
      },
    });

    if (!invitation) {
      return { valid: false, errorMessage: 'Einladung nicht gefunden' };
    }

    if (invitation.status !== 'PENDING') {
      return { valid: false, errorMessage: 'Einladung bereits verwendet oder widerrufen' };
    }

    if (invitation.expiresAt < new Date()) {
      return { valid: false, errorMessage: 'Einladung abgelaufen' };
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    return {
      valid: true,
      email: invitation.email,
      companyName: invitation.company.name,
      roleName: invitation.role.name,
      expiresAt: invitation.expiresAt,
      userExists: !!existingUser,
    };
  }

  /**
   * Einladung annehmen
   */
  async acceptInvitation(dto: AcceptInvitationDto): Promise<{ userId: string; companyId: string }> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token: dto.token },
      include: { company: true, role: true },
    });

    if (!invitation || invitation.status !== 'PENDING') {
      throw new BadRequestException('Ungültige Einladung');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Einladung abgelaufen');
    }

    // Prüfen ob User existiert
    let user = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (!user) {
      // Neuer User - Passwort erforderlich
      if (!dto.password || !dto.firstName || !dto.lastName) {
        throw new BadRequestException('Passwort, Vorname und Nachname erforderlich für neue User');
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);

      user = await this.prisma.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          status: 'ACTIVE',
        },
      });
    }

    // Membership erstellen
    await this.prisma.userCompanyMembership.create({
      data: {
        userId: user.id,
        companyId: invitation.companyId,
        roleId: invitation.roleId,
        invitedById: invitation.invitedById,
      },
    });

    // Einladung als akzeptiert markieren
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    return { userId: user.id, companyId: invitation.companyId };
  }

  /**
   * User direkt hinzufügen (ohne Einladungs-E-Mail)
   */
  async createUserDirect(
    companyId: string,
    createdById: string,
    dto: CreateUserDirectDto,
  ): Promise<{ user: any; membership: any }> {
    // Prüfen ob E-Mail bereits existiert
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      // User existiert - prüfen ob schon Mitglied
      const existingMembership = await this.prisma.userCompanyMembership.findUnique({
        where: {
          userId_companyId: { userId: existingUser.id, companyId },
        },
      });

      if (existingMembership) {
        throw new ConflictException('User ist bereits Mitglied dieser Firma');
      }

      // Membership erstellen
      const membership = await this.prisma.userCompanyMembership.create({
        data: {
          userId: existingUser.id,
          companyId,
          roleId: dto.roleId,
          invitedById: createdById,
        },
      });

      return { user: existingUser, membership };
    }

    // Prüfen ob Role existiert
    const role = await this.prisma.role.findFirst({
      where: { id: dto.roleId, companyId },
    });

    if (!role) {
      throw new NotFoundException('Rolle nicht gefunden');
    }

    // Passwort hashen
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // User und Membership erstellen
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: 'ACTIVE',
      },
    });

    const membership = await this.prisma.userCompanyMembership.create({
      data: {
        userId: user.id,
        companyId,
        roleId: dto.roleId,
        invitedById: createdById,
      },
    });

    // TODO: Optional Welcome-E-Mail versenden
    // if (dto.sendWelcomeEmail) {
    //   await this.emailService.sendWelcome(user, dto.password);
    // }

    return { user, membership };
  }

  /**
   * Einladung widerrufen
   */
  async revokeInvitation(companyId: string, invitationId: string): Promise<void> {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, companyId },
    });

    if (!invitation) {
      throw new NotFoundException('Einladung nicht gefunden');
    }

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'REVOKED' },
    });
  }

  /**
   * Alle Einladungen einer Company laden
   */
  async getCompanyInvitations(companyId: string) {
    return this.prisma.invitation.findMany({
      where: { companyId },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
