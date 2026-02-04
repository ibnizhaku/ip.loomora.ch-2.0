import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FixedAssetsService } from './fixed-assets.service';
import { CreateFixedAssetDto, UpdateFixedAssetDto, DisposeAssetDto, DepreciationRunDto } from './dto/fixed-asset.dto';

@ApiTags('Fixed Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fixed-assets')
export class FixedAssetsController {
  constructor(private readonly fixedAssetsService: FixedAssetsService) {}

  @Get()
  @ApiOperation({ summary: 'List all fixed assets' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.fixedAssetsService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      category,
      search,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get fixed assets statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.fixedAssetsService.getStatistics(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fixed asset by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.fixedAssetsService.findOne(id, user.companyId);
  }

  @Get(':id/depreciation-schedule')
  @ApiOperation({ summary: 'Get depreciation schedule for asset' })
  getDepreciationSchedule(@Param('id') id: string, @CurrentUser() user: any) {
    return this.fixedAssetsService.getDepreciationSchedule(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new fixed asset' })
  create(@Body() dto: CreateFixedAssetDto, @CurrentUser() user: any) {
    return this.fixedAssetsService.create(user.companyId, dto);
  }

  @Post('run-depreciation')
  @ApiOperation({ summary: 'Run depreciation calculation for all assets' })
  runDepreciation(@Body() dto: DepreciationRunDto, @CurrentUser() user: any) {
    return this.fixedAssetsService.runDepreciation(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update fixed asset' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFixedAssetDto,
    @CurrentUser() user: any,
  ) {
    return this.fixedAssetsService.update(id, user.companyId, dto);
  }

  @Post(':id/dispose')
  @ApiOperation({ summary: 'Dispose or sell fixed asset' })
  dispose(
    @Param('id') id: string,
    @Body() dto: DisposeAssetDto,
    @CurrentUser() user: any,
  ) {
    return this.fixedAssetsService.dispose(id, user.companyId, dto);
  }
}
