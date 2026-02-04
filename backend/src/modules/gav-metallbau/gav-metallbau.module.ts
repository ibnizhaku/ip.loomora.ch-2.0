import { Module } from '@nestjs/common';
import { GavMetallbauController } from './gav-metallbau.controller';
import { GavMetallbauService } from './gav-metallbau.service';

@Module({
  controllers: [GavMetallbauController],
  providers: [GavMetallbauService],
  exports: [GavMetallbauService],
})
export class GavMetallbauModule {}
