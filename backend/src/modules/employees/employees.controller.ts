import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from './dto/employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: EmployeeQueryDto) {
    return this.employeesService.findAll(user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get employee statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.employeesService.getStats(user.companyId);
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  getDepartments(@CurrentUser() user: CurrentUserPayload) {
    return this.employeesService.getDepartments(user.companyId);
  }

  @Get('orgchart')
  @ApiOperation({ summary: 'Get organization chart data' })
  getOrgchart(@CurrentUser() user: CurrentUserPayload) {
    return this.employeesService.getOrgchart(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.employeesService.findById(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new employee' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.employeesService.delete(id, user.companyId);
  }
}
