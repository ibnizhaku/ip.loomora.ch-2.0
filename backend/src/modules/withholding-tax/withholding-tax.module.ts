import { Module } from '@nestjs/common';
import { WithholdingTaxController } from './withholding-tax.controller';
import { WithholdingTaxService } from './withholding-tax.service';

@Module({
  controllers: [WithholdingTaxController],
  providers: [WithholdingTaxService],
  exports: [WithholdingTaxService],
})
export class WithholdingTaxModule {}
