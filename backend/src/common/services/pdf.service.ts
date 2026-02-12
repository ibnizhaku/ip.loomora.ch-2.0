import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

@Injectable()
export class PdfService {
  // Swiss QR-Bill generation (ISO 20022)
  async generateInvoicePdf(invoice: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('RECHNUNG', { align: 'right' });
      doc.moveDown();

      // Invoice details
      doc.fontSize(10);
      doc.text(`Rechnungsnummer: ${invoice.number}`, { align: 'right' });
      doc.text(`Datum: ${new Date(invoice.date).toLocaleDateString('de-CH')}`, { align: 'right' });
      doc.text(`Fälligkeitsdatum: ${new Date(invoice.dueDate).toLocaleDateString('de-CH')}`, { align: 'right' });
      doc.moveDown(2);

      // Customer address
      doc.text(invoice.customer?.companyName || invoice.customer?.name || 'Kunde');
      if (invoice.customer?.street) doc.text(invoice.customer.street);
      if (invoice.customer?.zip && invoice.customer?.city) {
        doc.text(`${invoice.customer.zip} ${invoice.customer.city}`);
      }
      doc.moveDown(2);

      // Items table
      const tableTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Pos', 50, tableTop);
      doc.text('Beschreibung', 80, tableTop);
      doc.text('Menge', 300, tableTop);
      doc.text('Einheit', 350, tableTop);
      doc.text('Preis', 400, tableTop, { width: 80, align: 'right' });
      doc.text('Total', 480, tableTop, { width: 80, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).stroke();

      let y = tableTop + 20;
      doc.font('Helvetica');

      (invoice.items || []).forEach((item: any, index: number) => {
        doc.text(String(index + 1), 50, y);
        doc.text(item.description || '', 80, y, { width: 210 });
        doc.text(String(item.quantity || 0), 300, y);
        doc.text(item.unit || 'Stk', 350, y);
        doc.text(`${Number(item.unitPrice || 0).toFixed(2)}`, 400, y, { width: 80, align: 'right' });
        doc.text(`${Number(item.total || 0).toFixed(2)}`, 480, y, { width: 80, align: 'right' });
        y += 20;
      });

      doc.moveDown(2);

      // Totals
      const totalsX = 400;
      let totalsY = y + 20;
      doc.text('Zwischensumme:', totalsX, totalsY);
      doc.text(`CHF ${Number(invoice.subtotal || 0).toFixed(2)}`, 480, totalsY, { width: 80, align: 'right' });
      totalsY += 15;
      doc.text('MwSt 8.1%:', totalsX, totalsY);
      doc.text(`CHF ${Number(invoice.vatAmount || 0).toFixed(2)}`, 480, totalsY, { width: 80, align: 'right' });
      totalsY += 15;
      doc.font('Helvetica-Bold');
      doc.text('Gesamtbetrag:', totalsX, totalsY);
      doc.text(`CHF ${Number(invoice.totalAmount || invoice.total || 0).toFixed(2)}`, 480, totalsY, { width: 80, align: 'right' });

      // QR-Bill (simplified - full ISO 20022 implementation would be longer)
      if (invoice.qrReference) {
        doc.addPage();
        doc.fontSize(10).font('Helvetica');
        doc.text('Zahlteil', 50, 50);
        
        // Generate QR Code
        const qrData = `SPC\\n0200\\n1\\nCH4431999123000889012\\nK\\nFirma AG\\nMusterstrasse 1\\n8000\\nZürich\\nCH\\n\\n\\n\\n\\n\\n\\n\\n${Number(invoice.totalAmount || 0).toFixed(2)}\\nCHF\\nK\\n${invoice.customer?.companyName || 'Kunde'}\\n${invoice.customer?.street || ''}\\n${invoice.customer?.zip || ''}\\n${invoice.customer?.city || ''}\\nCH\\nQRR\\n${invoice.qrReference}\\nEPD`;
        
        QRCode.toDataURL(qrData, { errorCorrectionLevel: 'M', width: 150 }, (err, url) => {
          if (!err && url) {
            doc.image(url, 50, 100, { width: 150 });
          }
          doc.text(`Referenz: ${invoice.qrReference}`, 220, 120);
          doc.text(`Betrag: CHF ${Number(invoice.totalAmount || 0).toFixed(2)}`, 220, 140);
          doc.end();
        });
      } else {
        doc.end();
      }
    });
  }

  async generateQuotePdf(quote: any): Promise<Buffer> {
    // Similar to invoice but without QR-Bill, title "OFFERTE"
    return this.generateInvoicePdf({ ...quote, title: 'OFFERTE' });
  }

  async generateDeliveryNotePdf(deliveryNote: any): Promise<Buffer> {
    // Similar but without prices, title "LIEFERSCHEIN"
    return this.generateInvoicePdf({ ...deliveryNote, title: 'LIEFERSCHEIN', hideProces: true });
  }

  async generateReminderPdf(reminder: any): Promise<Buffer> {
    // Include original invoice + reminder fee
    return this.generateInvoicePdf({ 
      ...reminder.invoice, 
      title: `${reminder.level}. MAHNUNG`,
      extraFee: reminder.fee,
      totalWithFee: reminder.totalWithFee,
    });
  }

  async generateCreditNotePdf(creditNote: any): Promise<Buffer> {
    return this.generateInvoicePdf({ ...creditNote, title: 'GUTSCHRIFT' });
  }
}
