import { Module } from '@nestjs/common';
import { RecruitingController } from './recruiting.controller';
import { RecruitingService } from './recruiting.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecruitingController],
  providers: [RecruitingService],
  exports: [RecruitingService],
})
export class RecruitingModule {}
