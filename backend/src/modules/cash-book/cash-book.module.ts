import { Module } from '@nestjs/common';
import { CashBookController } from './cash-book.controller';
import { CashBookService } from './cash-book.service';

@Module({
  controllers: [CashBookController],
  providers: [CashBookService],
  exports: [CashBookService],
})
export class CashBookModule {}
