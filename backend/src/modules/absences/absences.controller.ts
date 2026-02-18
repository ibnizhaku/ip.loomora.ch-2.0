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
import { AbsencesService } from './absences.service';
import { CreateAbsenceDto, UpdateAbsenceDto, AbsenceQueryDto } from './dto/absence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Absences')
@Controller('absences')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@ApiBearerAuth()
export class AbsencesController {
  constructor(private absencesService: AbsencesService) {}

  @Get()
  @RequirePermissions('absences:read')
  @ApiOperation({ summary: 'Get all absences' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: AbsenceQueryDto) {
    return this.absencesService.findAll(user.companyId, query);
  }

  @Get('stats')
  @RequirePermissions('absences:read')
  @ApiOperation({ summary: 'Get absence statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.absencesService.getStats(user.companyId);
  }

  @Get(':id')
  @RequirePermissions('absences:read')
  @ApiOperation({ summary: 'Get absence by ID' })
  findOne(@Param('id') id: string) {
    return this.absencesService.findById(id);
  }

  @Post()
  @RequirePermissions('absences:write')
  @ApiOperation({ summary: 'Create new absence' })
  create(@Body() dto: CreateAbsenceDto, @CurrentUser() user: CurrentUserPayload) {
    return this.absencesService.create(dto, user);
  }

  @Post(':id/approve')
  @RequirePermissions('absences:write')
  @ApiOperation({ summary: 'Approve absence' })
  approve(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.absencesService.approve(id, user);
  }

  @Post(':id/reject')
  @RequirePermissions('absences:write')
  @ApiOperation({ summary: 'Reject absence' })
  reject(@Param('id') id: string, @Body() body: { reason?: string }, @CurrentUser() user: CurrentUserPayload) {
    return this.absencesService.reject(id, body.reason, user);
  }

  @Post(':id/cancel')
  @RequirePermissions('absences:write')
  @ApiOperation({ summary: 'Cancel absence' })
  cancel(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.absencesService.cancel(id, user);
  }

  @Put(':id')
  @RequirePermissions('absences:write')
  @ApiOperation({ summary: 'Update absence' })
  update(@Param('id') id: string, @Body() dto: UpdateAbsenceDto) {
    return this.absencesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('absences:delete')
  @ApiOperation({ summary: 'Delete absence' })
  delete(@Param('id') id: string) {
    return this.absencesService.delete(id);
  }
}
