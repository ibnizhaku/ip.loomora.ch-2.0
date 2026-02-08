import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Body, 
  Param,
  UseGuards, 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { 
  InviteUserDto, 
  AcceptInvitationDto, 
  CreateUserDirectDto,
} from '../auth/dto/auth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CheckPlanLimit, PlanLimitsGuard } from '../auth/guards/plan-limits.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  @Get('validate/:token')
  @ApiOperation({ summary: 'Einladung validieren (öffentlich)' })
  async validateInvitation(@Param('token') token: string) {
    return this.invitationsService.validateInvitation(token);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Einladung annehmen (öffentlich)' })
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.invitationsService.acceptInvitation(dto);
  }

  // ==========================================
  // AUTHENTICATED ENDPOINTS
  // ==========================================

  @Get()
  @UseGuards(JwtAuthGuard, CompanyGuard, SubscriptionGuard, PermissionGuard)
  @RequirePermissions('users:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alle Einladungen der Company' })
  async getInvitations(@CurrentUser() user: CurrentUserPayload) {
    return this.invitationsService.getCompanyInvitations(user.companyId);
  }

  @Post('invite')
  @UseGuards(JwtAuthGuard, CompanyGuard, SubscriptionGuard, PermissionGuard, PlanLimitsGuard)
  @RequirePermissions('users:write')
  @CheckPlanLimit('max_users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User per E-Mail einladen' })
  async inviteUser(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: InviteUserDto,
  ) {
    return this.invitationsService.createInvitation(user.companyId, user.userId, dto);
  }

  @Post('create-direct')
  @UseGuards(JwtAuthGuard, CompanyGuard, SubscriptionGuard, PermissionGuard, PlanLimitsGuard)
  @RequirePermissions('users:admin')
  @CheckPlanLimit('max_users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User direkt erstellen' })
  async createUserDirect(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateUserDirectDto,
  ) {
    return this.invitationsService.createUserDirect(user.companyId, user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, CompanyGuard, SubscriptionGuard, PermissionGuard)
  @RequirePermissions('users:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Einladung widerrufen' })
  async revokeInvitation(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    await this.invitationsService.revokeInvitation(user.companyId, id);
    return { success: true };
  }
}
