import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get company settings' })
  getSettings(@CurrentUser() user: CurrentUserPayload) {
    return this.settingsService.getSettings(user.companyId);
  }

  @Put()
  @RequirePermissions('settings:write')
  @ApiOperation({ summary: 'Update company settings' })
  updateSettings(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(user.companyId, dto, user.userId);
  }

  @Post('generate-api-key')
  @RequirePermissions('settings:admin')
  @ApiOperation({ summary: 'Generate new API key' })
  generateApiKey(@CurrentUser() user: CurrentUserPayload) {
    return this.settingsService.generateApiKey(user.companyId);
  }
}
