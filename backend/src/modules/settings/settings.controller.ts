import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get company settings' })
  getSettings(@CurrentUser() user: CurrentUserPayload) {
    return this.settingsService.getSettings(user.companyId);
  }

  @Put()
  @ApiOperation({ summary: 'Update company settings' })
  updateSettings(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(user.companyId, dto);
  }

  @Post('smtp/test')
  @ApiOperation({ summary: 'Test SMTP configuration' })
  testSmtp(@CurrentUser() user: CurrentUserPayload) {
    return this.settingsService.testSmtp(user.companyId);
  }

  @Post('generate-api-key')
  @ApiOperation({ summary: 'Generate new API key' })
  generateApiKey(@CurrentUser() user: CurrentUserPayload) {
    return this.settingsService.generateApiKey(user.companyId);
  }
}
