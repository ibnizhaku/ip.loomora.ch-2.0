import { Module } from '@nestjs/common';
import { SwissdecController } from './swissdec.controller';
import { SwissdecService } from './swissdec.service';

@Module({
  controllers: [SwissdecController],
  providers: [SwissdecService],
  exports: [SwissdecService],
})
export class SwissdecModule {}
