import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
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

      // Header – title wird dynamisch gesetzt (RECHNUNG, OFFERTE, LIEFERSCHEIN, etc.)
      const docTitle = invoice.title || 'RECHNUNG';
      doc.fontSize(20).text(docTitle, { align: 'right' });
      doc.moveDown();

      // Document details
      const docDate = invoice.issueDate || invoice.date || invoice.orderDate || invoice.deliveryDate;
      doc.fontSize(10);
      doc.text(`Nummer: ${invoice.number}`, { align: 'right' });
      if (docDate) {
        doc.text(`Datum: ${new Date(docDate).toLocaleDateString('de-CH')}`, { align: 'right' });
      }
      if (invoice.validUntil) {
        doc.text(`Gültig bis: ${new Date(invoice.validUntil).toLocaleDateString('de-CH')}`, { align: 'right' });
      }
      if (invoice.dueDate) {
        doc.text(`Fälligkeitsdatum: ${new Date(invoice.dueDate).toLocaleDateString('de-CH')}`, { align: 'right' });
      }
      doc.moveDown(2);

      // Customer address
      doc.text(invoice.customer?.companyName || invoice.customer?.name || 'Kunde');
      if (invoice.customer?.street) doc.text(invoice.customer.street);
      if (invoice.customer?.zip && invoice.customer?.city) {
        doc.text(`${invoice.customer.zip} ${invoice.customer.city}`);
      }
      doc.moveDown();

      // Delivery address (if different from billing)
      const da = invoice.deliveryAddress;
      if (da && (da.street || da.city)) {
        doc.fontSize(9).font('Helvetica-Bold').text('Lieferadresse:');
        doc.font('Helvetica');
        if (da.company) doc.text(da.company);
        if (da.street) doc.text(da.street);
        if (da.zipCode || da.city) doc.text(`${da.zipCode || ''} ${da.city || ''}`.trim());
        if (da.country && da.country !== 'CH') doc.text(da.country);
        doc.moveDown();
      } else {
        doc.moveDown();
      }

      // Items table – hidePrices: nur Pos, Beschreibung, Menge, Einheit (für Lieferscheine)
      const hidePrices = invoice.hidePrices === true;
      const tableTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Pos', 50, tableTop);
      doc.text('Beschreibung', 80, tableTop, { width: hidePrices ? 360 : 210 });
      doc.text('Menge', hidePrices ? 460 : 300, tableTop);
      doc.text('Einheit', hidePrices ? 510 : 350, tableTop);
      if (!hidePrices) {
        doc.text('Preis', 400, tableTop, { width: 80, align: 'right' });
        doc.text('Total', 480, tableTop, { width: 80, align: 'right' });
      }

      doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).stroke();

      let y = tableTop + 20;
      doc.font('Helvetica');

      (invoice.items || []).forEach((item: any, index: number) => {
        doc.text(String(index + 1), 50, y);
        doc.text(item.description || '', 80, y, { width: hidePrices ? 360 : 210 });
        doc.text(String(item.quantity || 0), hidePrices ? 460 : 300, y);
        doc.text(item.unit || 'Stk', hidePrices ? 510 : 350, y);
        if (!hidePrices) {
          doc.text(`${Number(item.unitPrice || 0).toFixed(2)}`, 400, y, { width: 80, align: 'right' });
          doc.text(`${Number(item.total || 0).toFixed(2)}`, 480, y, { width: 80, align: 'right' });
        }
        y += 20;
      });

      doc.moveDown(2);

      // Totals – nur anzeigen wenn Preise sichtbar
      if (!hidePrices) {
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
      }

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
    return this.generateInvoicePdf({ ...deliveryNote, title: 'LIEFERSCHEIN', hidePrices: true });
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
