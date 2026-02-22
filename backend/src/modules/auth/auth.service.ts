import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from './services/token.service';
import { MembershipService } from './services/membership.service';
import { AccountingSeedService } from '../finance/accounting-seed.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
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
    private accountingSeedService: AccountingSeedService,
    private configService: ConfigService,
    private subscriptionsService: SubscriptionsService,
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

    // 4. Prüfen ob 2FA aktiv ist
    if (user.twoFactorEnabled) {
      const tempToken = await this.tokenService.generateTempToken({
        sub: user.id,
        email: user.email,
        type: 'two_factor_pending',
        activeCompanyId: null,
      });

      return {
        requires2FA: true,
        tempToken,
        message: 'Bitte 2FA-Code eingeben',
      } as any;
    }

    // 5. Aktive Companies laden
    const activeCompanies = await this.membershipService.getActiveCompaniesForUser(user.id);

    // 6. Last login aktualisieren
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

      return { user, company, defaultPlan };
    });

    // Buchhaltungs-Setup asynchron starten (nicht blockierend)
    this.accountingSeedService.seedCompany(result.company.id).catch(err => {
      console.error('AccountingSeed failed for new company', result.company.id, err);
    });

    const skipPayment = this.configService.get('LOOMORA_SKIP_PAYMENT') === 'true';

    if (skipPayment) {
      // Dev/Demo: Company sofort aktivieren, Tokens zurückgeben
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await this.prisma.subscription.updateMany({
        where: { companyId: result.company.id },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        },
      });
      await this.prisma.company.update({
        where: { id: result.company.id },
        data: { status: 'ACTIVE' },
      });
      const loginResponse = await this.generateFullLoginResponse(
        result.user.id,
        result.company.id,
        {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          avatarUrl: undefined,
          status: result.user.status,
        },
      );
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
          status: 'ACTIVE',
        },
        requiresPayment: false,
        accessToken: (loginResponse as any).accessToken,
        refreshToken: (loginResponse as any).refreshToken,
        activeCompany: (loginResponse as any).activeCompany,
      };
    }

    // Checkout-URL erstellen für Zahlung
    const frontendUrl = this.configService.get('LOOMORA_FRONTEND_URL') || this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const checkoutResult = await this.subscriptionsService.createCheckout(
      result.company.id,
      result.user.id,
      {
        planId: result.defaultPlan.id,
        billingCycle: 'MONTHLY',
        successUrl: `${frontendUrl}/payment-pending?success=1`,
        cancelUrl: `${frontendUrl}/payment-pending`,
      },
    );

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
      checkoutUrl: checkoutResult.checkoutUrl,
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

    // Aktive Company aus dem Token-Record bevorzugen.
    // Fallback auf primäre Company für ältere Token ohne gespeicherte Company.
    let companyId = tokenData.activeCompanyId;
    if (!companyId) {
      companyId = await this.membershipService.getPrimaryCompany(user.id);
    }

    if (!companyId) {
      throw new ForbiddenException('Keine aktive Company gefunden');
    }

    // Sicherstellen dass die gespeicherte Company noch aktiv und zugänglich ist.
    // Falls nicht (z.B. Company deaktiviert), auf primäre Company zurückfallen.
    try {
      await this.membershipService.validateMembership(user.id, companyId);
    } catch {
      const fallbackCompanyId = await this.membershipService.getPrimaryCompany(user.id);
      if (!fallbackCompanyId) {
        throw new ForbiddenException('Keine aktive Company gefunden');
      }
      companyId = fallbackCompanyId;
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
      companyId,
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

  /**
   * Gibt alle aktiven Companies des eingeloggten Users zurück
   * Wird von GET /auth/companies verwendet
   */
  async getMyCompanies(userId: string) {
    return this.membershipService.getActiveCompaniesForUser(userId);
  }

  /**
   * Lädt Permissions frisch aus DB (Rolle + Overrides) — nicht aus JWT-Cache.
   * Wird von /auth/me verwendet, damit Widget-Änderungen sofort sichtbar sind.
   */
  async getFreshPermissions(userId: string, companyId: string): Promise<{ permissions: string[] }> {
    const { permissions } = await this.membershipService.validateMembership(userId, companyId);
    return { permissions };
  }


  /**
   * Verifiziert einen temporären 2FA-Token und gibt den Payload zurück
   */
  verifyTempToken(token: string) {
    const payload = this.tokenService.verifyTempToken(token);
    if (!payload || payload.type !== 'two_factor_pending') {
      throw new UnauthorizedException('Ungültiger oder abgelaufener Token');
    }
    return payload;
  }

  /**
   * Generiert vollständige Tokens nach erfolgreicher 2FA-Authentifizierung
   */
  async generateFullTokens(userId: string, deviceInfo?: string, ipAddress?: string, userAgent?: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User nicht gefunden');
    }

    // Last login aktualisieren
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

    // Aktive Companies laden
    const activeCompanies = await this.membershipService.getActiveCompaniesForUser(user.id);

    if (activeCompanies.length === 0) {
      throw new ForbiddenException('Du bist keiner aktiven Firma zugeordnet');
    }

    // Genau eine oder primäre Company verwenden
    if (activeCompanies.length === 1) {
      return this.generateFullLoginResponse(user.id, activeCompanies[0].id, userInfo, deviceInfo, ipAddress, userAgent);
    }

    const primaryCompanyId = await this.membershipService.getPrimaryCompany(user.id);

    if (primaryCompanyId) {
      return this.generateFullLoginResponse(user.id, primaryCompanyId, userInfo, deviceInfo, ipAddress, userAgent);
    }

    // Mehrere Companies → Temp-Token für Company-Auswahl
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

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

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
      companyId,   // aktive Company wird im Token-Record gespeichert
      deviceInfo,
      ipAddress,
      userAgent,
    );

    // AuditLog: Login-Ereignis persistieren
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          companyId,
          action: 'LOGIN',
          module: 'AUTH',
          metadata: {
            ip: ipAddress ?? null,
            device: deviceInfo ?? null,
            userAgent: userAgent ?? null,
          },
          retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        },
      });
    } catch {
      // AuditLog-Fehler dürfen Login nicht blockieren
    }

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
    // Broad-key Module — PARENT_MAP in membership.service.ts expandiert diese
    // zur Laufzeit auf alle granularen Sub-Module.
    const ownerPermissions = [
      'customers', 'suppliers', 'products', 'quotes', 'orders',
      'invoices', 'payments', 'employees', 'projects', 'finance',
      'documents', 'contracts', 'settings', 'marketing', 'ecommerce',
      'calendar', 'messages', 'notifications', 'service-tickets',
      'reports', 'dashboard',
    ];

    const adminPermissions = ownerPermissions.filter((m) => m !== 'settings');

    const memberPermissions = ownerPermissions.filter(
      (m) => !['settings', 'finance', 'reports'].includes(m),
    );

    const allPerms = ['read', 'write', 'delete', 'admin'];
    const writePerms = ['read', 'write'];

    // Owner Role — Vollzugriff
    const ownerRole = await tx.role.create({
      data: {
        companyId,
        name: 'Owner',
        description: 'Firmeneigentümer mit Vollzugriff',
        isSystemRole: true,
        permissions: {
          create: ownerPermissions.flatMap((module) =>
            allPerms.map((permission) => ({ module, permission })),
          ),
        },
      },
    });

    // Admin Role — Vollzugriff ohne Settings
    const adminRole = await tx.role.create({
      data: {
        companyId,
        name: 'Admin',
        description: 'Administrator mit Vollzugriff (ohne Abonnement-Verwaltung)',
        isSystemRole: true,
        permissions: {
          create: adminPermissions.flatMap((module) =>
            allPerms.map((permission) => ({ module, permission })),
          ),
        },
      },
    });

    // Member Role — operative Module read/write
    const memberRole = await tx.role.create({
      data: {
        companyId,
        name: 'Member',
        description: 'Standard-Mitarbeiter mit Lese- und Schreibzugriff auf operative Module',
        isSystemRole: true,
        permissions: {
          create: [
            ...memberPermissions.flatMap((module) =>
              writePerms.map((permission) => ({ module, permission })),
            ),
            { module: 'reports', permission: 'read' },
            { module: 'dashboard', permission: 'read' },
          ],
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
