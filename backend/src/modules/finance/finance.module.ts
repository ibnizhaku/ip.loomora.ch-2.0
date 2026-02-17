import { Module } from '@nestjs/common';
import { BankAccountsController } from './bank-accounts.controller';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';

@Module({
  controllers: [FinanceController, BankAccountsController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
