import { Module } from '@nestjs/common';
import { VatReturnsController } from './vat-returns.controller';
import { VatReturnsService } from './vat-returns.service';

@Module({
  controllers: [VatReturnsController],
  providers: [VatReturnsService],
  exports: [VatReturnsService],
})
export class VatReturnsModule {}
