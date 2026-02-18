import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, RoleQueryDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'List all roles for current company' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: RoleQueryDto) {
    return this.rolesService.findAll(user.companyId, query);
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get role by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.rolesService.findById(id, user.companyId);
  }

  @Post()
  @RequirePermissions('roles:admin')
  @ApiOperation({ summary: 'Create new custom role' })
  create(@Body() dto: CreateRoleDto, @CurrentUser() user: CurrentUserPayload) {
    return this.rolesService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @RequirePermissions('roles:admin')
  @ApiOperation({ summary: 'Update role (custom only)' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @CurrentUser() user: CurrentUserPayload) {
    return this.rolesService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('roles:admin')
  @ApiOperation({ summary: 'Delete role (custom only)' })
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.rolesService.delete(id, user.companyId);
  }
}
