import { Module } from '@nestjs/common';
import { BankImportController } from './bank-import.controller';
import { BankTransactionsController } from './bank-transactions.controller';
import { BankImportService } from './bank-import.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PrismaModule, PaymentsModule],
  controllers: [BankImportController, BankTransactionsController],
  providers: [BankImportService],
  exports: [BankImportService],
})
export class BankImportModule {}
