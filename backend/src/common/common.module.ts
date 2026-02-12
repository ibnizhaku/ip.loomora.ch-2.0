import { Module, Global } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { EmailService } from './services/email.service';
import { CronService } from './services/cron.service';

@Global()
@Module({
  providers: [PdfService, EmailService, CronService],
  exports: [PdfService, EmailService],
})
export class CommonModule {}
