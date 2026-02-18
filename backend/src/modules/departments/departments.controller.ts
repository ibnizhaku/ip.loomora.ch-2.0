import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  @RequirePermissions('departments:read')
  @ApiOperation({ summary: 'Get all departments' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto) {
    return this.departmentsService.findAll(user.companyId, query);
  }

  @Get(':id')
  @RequirePermissions('departments:read')
  @ApiOperation({ summary: 'Get department by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.departmentsService.findById(id, user.companyId);
  }

  @Post()
  @RequirePermissions('departments:write')
  @ApiOperation({ summary: 'Create department' })
  create(@Body() dto: CreateDepartmentDto, @CurrentUser() user: CurrentUserPayload) {
    return this.departmentsService.create(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('departments:write')
  @ApiOperation({ summary: 'Update department' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.departmentsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('departments:delete')
  @ApiOperation({ summary: 'Delete department' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.departmentsService.delete(id, user.companyId);
  }
}
