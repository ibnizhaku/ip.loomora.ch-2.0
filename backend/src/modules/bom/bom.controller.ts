import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BomService } from './bom.service';
import { CreateBomDto, UpdateBomDto } from './dto/bom.dto';

@ApiTags('Bill of Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bom')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Get()
  @ApiOperation({ summary: 'List all BOMs' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('projectId') projectId?: string,
    @Query('isTemplate') isTemplate?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.bomService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      projectId,
      isTemplate: isTemplate ? isTemplate === 'true' : undefined,
      category,
      search,
    });
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get predefined BOM templates for Metallbau' })
  getTemplates() {
    return this.bomService.getTemplates();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get BOM by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bomService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new BOM' })
  create(@Body() dto: CreateBomDto, @CurrentUser() user: any) {
    return this.bomService.create(user.companyId, dto);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate an existing BOM' })
  duplicate(
    @Param('id') id: string,
    @Query('name') name: string,
    @CurrentUser() user: any,
  ) {
    return this.bomService.duplicate(id, user.companyId, name);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update BOM' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBomDto,
    @CurrentUser() user: any,
  ) {
    return this.bomService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete BOM' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bomService.delete(id, user.companyId);
  }
}
