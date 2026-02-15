import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
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

  @Delete(':id')
  @ApiOperation({ summary: 'Remove user from company' })
  remove(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.usersService.delete(id, user.companyId);
  }
}
