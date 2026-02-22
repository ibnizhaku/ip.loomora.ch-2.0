import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';

@ApiTags('Warehouses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('warehouses')
export class WarehousesController {
  @Get()
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get warehouses (default list)' })
  findAll() {
    return [
      { id: '1', name: 'Hauptlager' },
      { id: '2', name: 'Aussenlager Ost' },
      { id: '3', name: 'Nebenlager' },
    ];
  }
}
