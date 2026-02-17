import { Module } from '@nestjs/common';
import { DeliveryNotesController } from './delivery-notes.controller';
import { DeliveryNotesService } from './delivery-notes.service';
import { PdfService } from '../../common/services/pdf.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryNotesController],
  providers: [DeliveryNotesService, PdfService],
  exports: [DeliveryNotesService],
})
export class DeliveryNotesModule {}
