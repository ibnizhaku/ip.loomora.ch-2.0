import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Headers, Ip, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { 
  LoginDto, 
  RegisterDto, 
  RefreshTokenDto,
  SelectCompanyDto,
  SwitchCompanyDto,
  LoginResponseDto,
  TokenResponseDto,
  RegistrationResponseDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login mit E-Mail und Passwort' })
  @ApiResponse({ status: 200, description: 'Login erfolgreich' })
  @ApiResponse({ status: 401, description: 'Ungültige Anmeldedaten' })
  @ApiResponse({ status: 403, description: 'Account gesperrt oder keine aktive Company' })
  async login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ip?: string,
  ): Promise<LoginResponseDto> {
    return this.authService.login(dto, undefined, ip, userAgent);
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
  @ApiOperation({ summary: 'Neue Company und Admin-User registrieren' })
  @ApiResponse({ status: 201, description: 'Registrierung erfolgreich, Zahlung erforderlich' })
  @ApiResponse({ status: 409, description: 'E-Mail bereits registriert' })
  async register(@Body() dto: RegisterDto): Promise<RegistrationResponseDto> {
    return this.authService.register(dto);
  }

  @Post('select-company')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Company auswählen (nach Login mit mehreren Companies)' })
  @ApiResponse({ status: 200, description: 'Company ausgewählt, Tokens generiert' })
  @ApiResponse({ status: 401, description: 'Ungültiger Token' })
  @ApiResponse({ status: 403, description: 'Kein Zugang zu dieser Company' })
  async selectCompany(
    @Body() dto: SelectCompanyDto,
    @Headers('authorization') auth: string,
    @Headers('user-agent') userAgent?: string,
    @Ip() ip?: string,
  ): Promise<TokenResponseDto> {
    const token = auth?.replace('Bearer ', '');
    return this.authService.selectCompany(token, dto, undefined, ip, userAgent);
  }

  @Post('switch-company')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Zu anderer Company wechseln' })
  @ApiResponse({ status: 200, description: 'Company gewechselt, neue Tokens' })
  @ApiResponse({ status: 403, description: 'Kein Zugang zu dieser Company' })
  async switchCompany(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SwitchCompanyDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ip?: string,
  ): Promise<TokenResponseDto> {
    return this.authService.switchCompany(user.userId, dto, undefined, ip, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Access Token erneuern' })
  @ApiResponse({ status: 200, description: 'Neue Tokens generiert' })
  @ApiResponse({ status: 401, description: 'Ungültiger Refresh Token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ip?: string,
  ): Promise<TokenResponseDto> {
    return this.authService.refreshTokens(dto.refreshToken, undefined, ip, userAgent);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ausloggen (aktuelles Gerät)' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Von allen Geräten ausloggen' })
  async logoutAll(@CurrentUser() user: CurrentUserPayload): Promise<void> {
    await this.authService.logoutAll(user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktuellen User und Company-Info abrufen' })
  async getMe(@CurrentUser() user: CurrentUserPayload) {
    // Load fresh permissions from DB (role + overrides) instead of stale JWT
    const { permissions } = await this.authService.getFreshPermissions(user.userId, user.companyId);

    return {
      userId: user.userId,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
      permissions,
      isOwner: user.isOwner,
    };
  }

  @Get('companies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alle verfügbaren Companies des Users' })
  async getMyCompanies(@CurrentUser() user: CurrentUserPayload) {
    // TODO: Implement via MembershipService
    return [];
  }
}
