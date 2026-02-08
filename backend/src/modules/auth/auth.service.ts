import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from './services/token.service';
import { MembershipService } from './services/membership.service';
import { 
  LoginDto, 
  RegisterDto, 
  SelectCompanyDto,
  SwitchCompanyDto,
  LoginResponseDto,
  TokenResponseDto,
  RegistrationResponseDto,
} from './dto/auth.dto';
import { JwtPayload, TempJwtPayload } from './interfaces/jwt-payload.interface';

// Custom Exception für Payment Required
export class PaymentRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentRequiredError';
  }
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private membershipService: MembershipService,
  ) {}

  /**
   * Login mit Multi-Tenant Support
   * Gibt entweder direkte Tokens zurück oder fordert Company-Auswahl
   */
  async login(dto: LoginDto, deviceInfo?: string, ipAddress?: string, userAgent?: string): Promise<LoginResponseDto> {
    // 1. User finden
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    // 2. Passwort prüfen
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    // 3. User-Status prüfen
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Dein Account ist gesperrt');
    }
    if (user.status === 'DELETED') {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }
    if (user.status === 'PENDING') {
      throw new ForbiddenException('Bitte bestätige zuerst deine E-Mail-Adresse');
    }

    // 4. Aktive Companies laden
    const activeCompanies = await this.membershipService.getActiveCompaniesForUser(user.id);

    // 5. Last login aktualisieren
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const userInfo = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl || undefined,
      status: user.status,
    };

    // 6a. Keine aktive Company
    if (activeCompanies.length === 0) {
      // Prüfen ob User überhaupt Memberships hat
      const allCompanies = await this.membershipService.getAllCompaniesForUser(user.id);
      
      if (allCompanies.length === 0) {
        throw new ForbiddenException('Du bist keiner Firma zugeordnet');
      }

      // User hat Companies, aber keine ist aktiv (Payment pending)
      const pendingCompany = allCompanies.find(c => c.status === 'PENDING_PAYMENT');
      if (pendingCompany) {
        // Temp Token für Payment-Flow
        const tempToken = await this.tokenService.generateTempToken({
          sub: user.id,
          email: user.email,
          type: 'payment_pending',
        });

        return {
          user: userInfo,
          requiresCompanySelection: false,
          accessToken: tempToken,
          availableCompanies: allCompanies,
        };
      }

      throw new ForbiddenException('Alle deine Firmen sind gesperrt oder gekündigt');
    }

    // 6b. Genau eine aktive Company
    if (activeCompanies.length === 1) {
      const company = activeCompanies[0];
      return this.generateFullLoginResponse(user.id, company.id, userInfo, deviceInfo, ipAddress, userAgent);
    }

    // 6c. Mehrere aktive Companies - Company-Auswahl erforderlich
    const primaryCompanyId = await this.membershipService.getPrimaryCompany(user.id);
    
    if (primaryCompanyId) {
      // Primäre Company automatisch auswählen
      return this.generateFullLoginResponse(user.id, primaryCompanyId, userInfo, deviceInfo, ipAddress, userAgent);
    }

    // Temp Token für Company-Auswahl
    const tempToken = await this.tokenService.generateTempToken({
      sub: user.id,
      email: user.email,
      type: 'company_selection',
    });

    return {
      user: userInfo,
      requiresCompanySelection: true,
      accessToken: tempToken,
      availableCompanies: activeCompanies,
    };
  }

  /**
   * Company auswählen (nach Login mit mehreren Companies)
   */
  async selectCompany(
    tempToken: string, 
    dto: SelectCompanyDto,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenResponseDto> {
    const payload = this.tokenService.verifyTempToken(tempToken);
    
    if (!payload || payload.type !== 'company_selection') {
      throw new UnauthorizedException('Ungültiger oder abgelaufener Token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User nicht gefunden');
    }

    const userInfo = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl || undefined,
      status: user.status,
    };

    return this.generateFullLoginResponse(
      user.id, 
      dto.companyId, 
      userInfo,
      deviceInfo,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Company wechseln (für eingeloggte User)
   */
  async switchCompany(
    userId: string,
    dto: SwitchCompanyDto,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User nicht gefunden');
    }

    // Validieren dass User Zugang zu Company hat
    const companyInfo = await this.membershipService.getActiveCompanyInfo(userId, dto.companyId);
    
    if (!companyInfo) {
      throw new ForbiddenException('Du hast keinen Zugang zu dieser Firma');
    }

    // Subscription-Status prüfen
    if (companyInfo.subscriptionStatus === 'PENDING') {
      throw new ForbiddenException('Diese Firma hat noch keine aktive Zahlung');
    }
    if (companyInfo.subscriptionStatus === 'EXPIRED') {
      throw new ForbiddenException('Das Abonnement dieser Firma ist abgelaufen');
    }

    const userInfo = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl || undefined,
      status: user.status,
    };

    // Primäre Company setzen
    await this.membershipService.setPrimaryCompany(userId, dto.companyId);

    return this.generateFullLoginResponse(
      userId,
      dto.companyId,
      userInfo,
      deviceInfo,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Registrierung mit neuer Company
   */
  async register(dto: RegisterDto): Promise<RegistrationResponseDto> {
    // 1. Prüfen ob E-Mail bereits existiert
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Diese E-Mail-Adresse ist bereits registriert');
    }

    // 2. Slug generieren
    const baseSlug = dto.companySlug || this.generateSlug(dto.companyName);
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.prisma.company.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Passwort hashen
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // 4. Transaction: User + Company + Membership + Subscription erstellen
    const result = await this.prisma.$transaction(async (tx) => {
      // Company erstellen
      const company = await tx.company.create({
        data: {
          name: dto.companyName,
          slug,
          status: 'PENDING_PAYMENT',
          country: 'CH',
          settings: {
            currency: 'CHF',
            locale: 'de-CH',
            vatRates: {
              standard: 8.1,
              reduced: 2.6,
              special: 3.8,
            },
          },
        },
      });

      // User erstellen
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          status: 'ACTIVE', // Direkt aktiv, E-Mail-Bestätigung optional
          companyId: company.id, // Legacy-Feld
        },
      });

      // Company createdById setzen
      await tx.company.update({
        where: { id: company.id },
        data: { createdById: user.id },
      });

      // System-Rollen erstellen
      const systemRoles = await this.createSystemRolesInTransaction(tx, company.id);

      // Membership mit Owner-Rolle erstellen
      await tx.userCompanyMembership.create({
        data: {
          userId: user.id,
          companyId: company.id,
          roleId: systemRoles.ownerId,
          isOwner: true,
          isPrimary: true,
        },
      });

      // Default-Plan laden oder erstellen
      let defaultPlan = await tx.subscriptionPlan.findFirst({
        where: { isDefault: true, isActive: true },
      });

      if (!defaultPlan) {
        // Fallback: Ersten aktiven Plan nehmen oder erstellen
        defaultPlan = await tx.subscriptionPlan.findFirst({
          where: { isActive: true },
        });

        if (!defaultPlan) {
          defaultPlan = await tx.subscriptionPlan.create({
            data: {
              name: 'Basic',
              description: 'Standard Plan',
              priceMonthly: 49.00,
              priceYearly: 490.00,
              currency: 'CHF',
              features: { api_access: false, exports: true },
              limits: { max_users: 5, max_projects: 10 },
              isDefault: true,
              isActive: true,
            },
          });
        }
      }

      // Subscription erstellen (pending bis Zahlung)
      await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: defaultPlan.id,
          status: 'PENDING',
          billingCycle: 'MONTHLY',
        },
      });

      return { user, company };
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        status: result.user.status,
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        slug: result.company.slug,
        status: result.company.status,
      },
      requiresPayment: true,
      // checkoutUrl wird später von Zahls.ch gesetzt
      checkoutUrl: undefined,
    };
  }

  /**
   * Refresh Token
   */
  async refreshTokens(
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenResponseDto> {
    const tokenData = await this.tokenService.validateRefreshToken(refreshToken);
    
    if (!tokenData) {
      throw new UnauthorizedException('Ungültiger oder abgelaufener Refresh Token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: tokenData.userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User nicht gefunden oder nicht aktiv');
    }

    // Alten Token revoken
    await this.tokenService.revokeRefreshToken(refreshToken);

    // Primäre/letzte Company laden
    const primaryCompanyId = await this.membershipService.getPrimaryCompany(user.id);
    
    if (!primaryCompanyId) {
      throw new ForbiddenException('Keine aktive Company gefunden');
    }

    const userInfo = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl || undefined,
      status: user.status,
    };

    return this.generateFullLoginResponse(
      user.id,
      primaryCompanyId,
      userInfo,
      deviceInfo,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Logout
   */
  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Logout von allen Geräten
   */
  async logoutAll(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private async generateFullLoginResponse(
    userId: string,
    companyId: string,
    userInfo: any,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenResponseDto> {
    // Company-Info validieren und laden
    const { membership, company, subscription, role, permissions } = 
      await this.membershipService.validateMembership(userId, companyId);

    // Subscription-Status prüfen
    if (!subscription || subscription.status === 'PENDING') {
      throw new ForbiddenException('Diese Firma hat noch keine aktive Zahlung');
    }
    if (subscription.status === 'EXPIRED') {
      throw new ForbiddenException('Das Abonnement dieser Firma ist abgelaufen');
    }

    // Company-Status prüfen
    if (company.status !== 'ACTIVE') {
      throw new ForbiddenException('Diese Firma ist nicht aktiv');
    }

    // Tokens generieren
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: userInfo.email,
      activeCompanyId: companyId,
      roleId: role.id,
      permissions,
      isOwner: membership.isOwner,
    };

    const accessToken = await this.tokenService.generateAccessToken(jwtPayload);
    const refreshToken = await this.tokenService.generateRefreshToken(
      userId,
      deviceInfo,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      user: userInfo,
      activeCompany: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        status: company.status,
        subscriptionStatus: subscription.status,
        planName: subscription.plan.name,
        role: role.name,
        permissions,
        isOwner: membership.isOwner,
      },
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[äöü]/g, (char) => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[char] || char))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  private async createSystemRolesInTransaction(
    tx: any,
    companyId: string,
  ): Promise<{ ownerId: string; adminId: string; memberId: string }> {
    const allPermissions = [
      'customers', 'suppliers', 'products', 'quotes', 'orders',
      'invoices', 'payments', 'employees', 'projects', 'finance',
      'documents', 'contracts', 'settings', 'users',
    ];

    const allPerms = ['read', 'write', 'delete', 'admin'];
    const writePerms = ['read', 'write'];

    // Owner Role
    const ownerRole = await tx.role.create({
      data: {
        companyId,
        name: 'Owner',
        description: 'Firmeneigentümer mit Vollzugriff',
        isSystemRole: true,
        permissions: {
          create: allPermissions.flatMap((module) =>
            allPerms.map((permission) => ({ module, permission })),
          ),
        },
      },
    });

    // Admin Role
    const adminRole = await tx.role.create({
      data: {
        companyId,
        name: 'Admin',
        description: 'Administrator mit Vollzugriff',
        isSystemRole: true,
        permissions: {
          create: allPermissions
            .filter((m) => m !== 'settings')
            .flatMap((module) =>
              allPerms.map((permission) => ({ module, permission })),
            ),
        },
      },
    });

    // Member Role
    const memberRole = await tx.role.create({
      data: {
        companyId,
        name: 'Member',
        description: 'Standard-Mitarbeiter',
        isSystemRole: true,
        permissions: {
          create: allPermissions
            .filter((m) => !['settings', 'users', 'finance'].includes(m))
            .flatMap((module) =>
              writePerms.map((permission) => ({ module, permission })),
            ),
        },
      },
    });

    return {
      ownerId: ownerRole.id,
      adminId: adminRole.id,
      memberId: memberRole.id,
    };
  }
}
