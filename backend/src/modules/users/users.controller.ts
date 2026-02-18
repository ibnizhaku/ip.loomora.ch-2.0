import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users in company' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto) {
    return this.usersService.findAll(user.companyId, query);
  }

  @Get(':id/login-history')
  @ApiOperation({ summary: 'Get login history for user' })
  getLoginHistory(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getLoginHistory(id, user.companyId);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get user permissions (role + overrides)' })
  getPermissions(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getPermissions(id, user.companyId);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Update user permission overrides' })
  updatePermissions(
    @Param('id') id: string,
    @Body() body: { permissions: any[] },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.usersService.updatePermissions(id, user.companyId, body.permissions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.usersService.findById(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user in company' })
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, user.companyId, dto);
  }

  @Put(':id/password')
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

  @Delete(':id')
  @ApiOperation({ summary: 'Remove user from company' })
  remove(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.usersService.delete(id, user.companyId);
  }
}
