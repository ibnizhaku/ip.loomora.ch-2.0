import { Module } from '@nestjs/common';
import { CreditNotesController } from './credit-notes.controller';
import { CreditNotesService } from './credit-notes.service';
import { PdfService } from '../../common/services/pdf.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CreditNotesController],
  providers: [CreditNotesService, PdfService],
  exports: [CreditNotesService],
})
export class CreditNotesModule {}
