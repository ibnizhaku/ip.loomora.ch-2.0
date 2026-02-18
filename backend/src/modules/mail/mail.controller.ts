import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { UpsertMailAccountDto, SendMailDto } from './dto/mail.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Mail')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('account')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Mail-Account des aktuellen Users laden' })
  getAccount(@CurrentUser() user: CurrentUserPayload) {
    return this.mailService.getAccount(user.userId, user.companyId);
  }

  @Post('account')
  @RequirePermissions('settings:write')
  @ApiOperation({ summary: 'Mail-Account erstellen oder aktualisieren' })
  upsertAccount(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpsertMailAccountDto,
  ) {
    return this.mailService.upsertAccount(user.userId, user.companyId, dto);
  }

  @Post('test')
  @RequirePermissions('settings:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SMTP-Verbindung testen' })
  testConnection(@CurrentUser() user: CurrentUserPayload) {
    return this.mailService.testConnection(user.userId, user.companyId);
  }

  @Post('send')
  @RequirePermissions('invoices:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'E-Mail versenden' })
  sendMail(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SendMailDto,
  ) {
    return this.mailService.sendMail(user.userId, user.companyId, dto);
  }
}
