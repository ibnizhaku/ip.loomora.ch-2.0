import { Module } from '@nestjs/common';
import { BankAccountsController } from './bank-accounts.controller';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { AccountingSeedService } from './accounting-seed.service';
import { AccountingSeedController } from './accounting-seed.controller';

@Module({
  controllers: [FinanceController, BankAccountsController, AccountingSeedController],
  providers: [FinanceService, AccountingSeedService],
  exports: [FinanceService, AccountingSeedService],
})
export class FinanceModule {}
