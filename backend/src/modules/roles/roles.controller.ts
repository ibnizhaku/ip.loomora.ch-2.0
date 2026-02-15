import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, RoleQueryDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles for current company' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: RoleQueryDto) {
    return this.rolesService.findAll(user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.rolesService.findById(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new custom role' })
  create(@Body() dto: CreateRoleDto, @CurrentUser() user: CurrentUserPayload) {
    return this.rolesService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role (custom only)' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @CurrentUser() user: CurrentUserPayload) {
    return this.rolesService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role (custom only)' })
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.rolesService.delete(id, user.companyId);
  }
}
