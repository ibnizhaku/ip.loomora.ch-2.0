import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountingSeedService } from './accounting-seed.service';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Accounting Seed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/seed')
export class AccountingSeedController {
  constructor(private readonly seedService: AccountingSeedService) {}

  /**
   * Einmalig aufrufen um:
   * 1. Schweizer KMU-Kontenplan (OR 957a) zu seeden
   * 2. Standard-Kasse zu erstellen
   * Idempotent – kann mehrfach aufgerufen werden ohne Duplikate zu erzeugen.
   */
  @Post()
  @ApiOperation({ summary: 'Seed Swiss KMU chart of accounts + default cash register for company' })
  async seed(@CurrentUser() user: CurrentUserPayload) {
    await this.seedService.seedCompany(user.companyId);
    return { message: 'Seeding erfolgreich abgeschlossen', companyId: user.companyId };
  }
}
