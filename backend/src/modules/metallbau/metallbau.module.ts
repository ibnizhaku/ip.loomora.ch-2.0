import { Module } from '@nestjs/common';
import { MetallbauController } from './metallbau.controller';
import { MetallbauService } from './metallbau.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MetallbauController],
  providers: [MetallbauService],
  exports: [MetallbauService],
})
export class MetallbauModule {}
