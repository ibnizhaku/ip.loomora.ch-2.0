import { Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { PdfService } from '../../common/services/pdf.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RemindersController],
  providers: [RemindersService, PdfService],
  exports: [RemindersService],
})
export class RemindersModule {}
