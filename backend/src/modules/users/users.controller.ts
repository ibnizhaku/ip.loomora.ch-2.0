import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class UserQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isActive?: string;
}

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get all users in company' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: UserQueryDto) {
    return this.usersService.findAll(user.companyId, query);
  }

  @Get(':id/login-history')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get login history for user' })
  getLoginHistory(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getLoginHistory(id, user.companyId);
  }

  @Get(':id/permissions')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get user permissions (role + overrides)' })
  getPermissions(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getPermissions(id, user.companyId);
  }

  @Put(':id/permissions')
  @RequirePermissions('users:admin')
  @ApiOperation({ summary: 'Update user permission overrides' })
  updatePermissions(
    @Param('id') id: string,
    @Body() body: { permissions: any[] },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.usersService.updatePermissions(id, user.companyId, body.permissions);
  }

  @Get(':id')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.usersService.findById(id, user.companyId);
  }

  @Post()
  @RequirePermissions('users:write')
  @ApiOperation({ summary: 'Create new user in company' })
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('users:write')
  @ApiOperation({ summary: 'Update user' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, user.companyId, dto, user.userId);
  }

  @Put(':id/password')
  @RequirePermissions('users:admin')
  @ApiOperation({ summary: 'Reset user password (admin only)' })
  resetPassword(
    @Param('id') id: string,
    @Body() body: { newPassword?: string; password?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const pw = body.newPassword || body.password;
    if (!pw) throw new BadRequestException('Passwort ist erforderlich');
    return this.usersService.resetPassword(id, user.companyId, pw);
  }

  @Delete(':id/sessions')
  @RequirePermissions('users:admin')
  @ApiOperation({ summary: 'Invalidate all active sessions for a user' })
  endSessions(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.usersService.endSessions(id, user.companyId);
  }

  @Post(':id/revoke-sessions')
  @RequirePermissions('users:admin')
  @ApiOperation({ summary: 'Revoke all active sessions for a user' })
  revokeSessions(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.usersService.revokeSessions(id, user.companyId, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  @ApiOperation({ summary: 'Remove user from company' })
  remove(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.usersService.delete(id, user.companyId, user.userId);
  }
}
