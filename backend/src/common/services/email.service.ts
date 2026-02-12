import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.config.get('SMTP_HOST');
    const port = this.config.get('SMTP_PORT');
    const user = this.config.get('SMTP_USER');
    const pass = this.config.get('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured - emails will be logged only');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(port || '587'),
      secure: port === '465',
      auth: { user, pass },
    });
  }

  async sendInvoice(invoice: any, pdfBuffer: Buffer): Promise<boolean> {
    const from = this.config.get('SMTP_FROM', 'noreply@loomora.ch');
    const to = invoice.customer?.email;

    if (!to) {
      this.logger.warn(`No email for customer ${invoice.customer?.name}`);
      return false;
    }

    const html = `
      <h2>Rechnung ${invoice.number}</h2>
      <p>Sehr geehrte Damen und Herren</p>
      <p>Anbei erhalten Sie die Rechnung ${invoice.number} vom ${new Date(invoice.date).toLocaleDateString('de-CH')}.</p>
      <p><strong>Betrag: CHF ${Number(invoice.totalAmount || invoice.total).toFixed(2)}</strong></p>
      <p>Fälligkeitsdatum: ${new Date(invoice.dueDate).toLocaleDateString('de-CH')}</p>
      <p>Mit freundlichen Grüssen<br>Ihr Loomora Team</p>
    `;

    if (!this.transporter) {
      this.logger.log(`[DEV MODE] Would send invoice to ${to}`);
      this.logger.log(html);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: `Rechnung ${invoice.number}`,
        html,
        attachments: [{
          filename: `Rechnung_${invoice.number}.pdf`,
          content: pdfBuffer,
        }],
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send invoice: ${error.message}`);
      return false;
    }
  }

  async sendQuote(quote: any, pdfBuffer: Buffer): Promise<boolean> {
    const from = this.config.get('SMTP_FROM', 'noreply@loomora.ch');
    const to = quote.customer?.email;

    if (!to || !this.transporter) {
      this.logger.log(`[DEV MODE] Would send quote to ${to || 'customer'}`);
      return !this.transporter;
    }

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: `Offerte ${quote.number}`,
        html: `<h2>Offerte ${quote.number}</h2><p>Anbei unser Angebot. Mit freundlichen Grüssen</p>`,
        attachments: [{ filename: `Offerte_${quote.number}.pdf`, content: pdfBuffer }],
      });
      return true;
    } catch {
      return false;
    }
  }

  async sendReminder(reminder: any, pdfBuffer: Buffer): Promise<boolean> {
    const from = this.config.get('SMTP_FROM', 'noreply@loomora.ch');
    const to = reminder.invoice?.customer?.email;

    const levelText = ['', 'Zahlungserinnerung', '1. Mahnung', '2. Mahnung', '3. Mahnung', 'Letzte Mahnung'][reminder.level] || 'Mahnung';

    if (!to || !this.transporter) {
      this.logger.log(`[DEV MODE] Would send reminder to ${to || 'customer'}`);
      return !this.transporter;
    }

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: `${levelText} - Rechnung ${reminder.invoice?.number}`,
        html: `<h2>${levelText}</h2><p>Rechnung ${reminder.invoice?.number} ist überfällig. Bitte begleichen Sie den offenen Betrag.</p>`,
        attachments: [{ filename: `Mahnung_${reminder.number}.pdf`, content: pdfBuffer }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
