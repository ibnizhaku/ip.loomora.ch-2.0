import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QRCode = require('qrcode') as typeof import('qrcode');

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

      // Document details – Datum-Formatierung sicher (ISO-String oder Date-Objekt)
      const parseDate = (d: any): string | null => {
        if (!d) return null;
        try {
          const dt = new Date(d);
          if (isNaN(dt.getTime())) return null;
          return dt.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return null; }
      };

      const docDate = invoice.issueDate || invoice.orderDate || invoice.date || invoice.deliveryDate;
      doc.fontSize(10);
      doc.text(`Nummer: ${invoice.number}`, { align: 'right' });
      const formattedDate = parseDate(docDate);
      if (formattedDate) {
        doc.text(`Datum: ${formattedDate}`, { align: 'right' });
      }
      const formattedValidUntil = parseDate(invoice.validUntil);
      if (formattedValidUntil) {
        doc.text(`Gültig bis: ${formattedValidUntil}`, { align: 'right' });
      }
      const formattedDueDate = parseDate(invoice.dueDate);
      if (formattedDueDate) {
        doc.text(`Fälligkeitsdatum: ${formattedDueDate}`, { align: 'right' });
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

  async generateOrderPdf(order: any): Promise<Buffer> {
    return this.generateInvoicePdf({ ...order, title: 'AUFTRAGSBESTÄTIGUNG' });
  }

  async generateDeliveryNotePdf(deliveryNote: any): Promise<Buffer> {
    // Similar but without prices, title "LIEFERSCHEIN"
    return this.generateInvoicePdf({ ...deliveryNote, title: 'LIEFERSCHEIN', hidePrices: true });
  }

  async generateReminderPdf(reminder: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const parseDate = (d: any): string => {
        if (!d) return '–';
        try {
          const dt = new Date(d);
          if (isNaN(dt.getTime())) return '–';
          return dt.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return '–'; }
      };

      const invoice = reminder.invoice || {};
      const customer = invoice.customer || {};
      const level = reminder.level || 1;
      const fee = Number(reminder.fee ?? 0);
      const totalWithFee = Number(reminder.totalWithFee ?? invoice.totalAmount ?? 0);
      const originalAmount = Number(invoice.totalAmount ?? 0);

      // Titel
      doc.fontSize(20).font('Helvetica-Bold').text(`${level}. MAHNUNG`, { align: 'right' });
      doc.moveDown(0.5);

      // Referenznummern
      doc.fontSize(10).font('Helvetica');
      doc.text(`Mahnung Nr.: ${reminder.number}`, { align: 'right' });
      doc.text(`Rechnungs-Nr.: ${invoice.number || '–'}`, { align: 'right' });
      doc.text(`Datum: ${parseDate(reminder.createdAt)}`, { align: 'right' });
      doc.text(`Fällig bis: ${parseDate(reminder.dueDate)}`, { align: 'right' });
      doc.moveDown(2);

      // Kundenadresse
      doc.font('Helvetica');
      doc.text(customer.companyName || customer.name || 'Kunde');
      if (customer.street) doc.text(customer.street);
      if (customer.zip && customer.city) doc.text(`${customer.zip} ${customer.city}`);
      doc.moveDown(2);

      // Anrede / Betreff
      doc.font('Helvetica-Bold').text(`Betreff: ${level}. Mahnung – Rechnung ${invoice.number || ''}`);
      doc.moveDown();
      doc.font('Helvetica').fontSize(10);
      doc.text(
        level === 1
          ? 'Trotz unserer Rechnung vom ' + parseDate(invoice.issueDate) + ' haben wir bis heute keinen Zahlungseingang festgestellt. ' +
            'Wir bitten Sie, den ausstehenden Betrag innerhalb der Nachfrist zu begleichen.'
          : `Wir haben Ihnen bereits ${level - 1} Mahnung(en) zugestellt. Da wir bisher keine Zahlung erhalten haben, ` +
            'ersuchen wir Sie dringend, den Gesamtbetrag innerhalb der gesetzten Frist zu begleichen.',
      );
      doc.moveDown(2);

      // Übersichtstabelle
      const tableLeft = 50;
      const tableRight = 480;
      const colValue = 420;

      const drawRow = (label: string, value: string, bold = false) => {
        const y = doc.y;
        if (bold) doc.font('Helvetica-Bold'); else doc.font('Helvetica');
        doc.text(label, tableLeft, y);
        doc.text(value, colValue, y, { width: tableRight - colValue, align: 'right' });
        doc.moveDown(0.5);
      };

      doc.moveTo(tableLeft, doc.y).lineTo(tableRight, doc.y).stroke();
      doc.moveDown(0.5);

      drawRow('Rechnungsbetrag (Original):', `CHF ${originalAmount.toFixed(2)}`);
      drawRow(`Rechnungsdatum:`, parseDate(invoice.issueDate));
      drawRow('Ursprüngliches Fälligkeitsdatum:', parseDate(invoice.dueDate));

      if (fee > 0) {
        doc.moveDown(0.3);
        drawRow(`Mahngebühr (${level}. Mahnung):`, `CHF ${fee.toFixed(2)}`);
      }

      doc.moveDown(0.5);
      doc.moveTo(tableLeft, doc.y).lineTo(tableRight, doc.y).stroke();
      doc.moveDown(0.5);

      drawRow('GESAMTFORDERUNG:', `CHF ${totalWithFee.toFixed(2)}`, true);

      doc.moveDown(0.5);
      doc.moveTo(tableLeft, doc.y).lineTo(tableRight, doc.y).lineWidth(2).stroke();
      doc.lineWidth(1);
      doc.moveDown(2);

      // Hinweis
      doc.font('Helvetica').fontSize(9);
      doc.text(
        'Sollte sich Ihre Zahlung mit diesem Schreiben gekreuzt haben, betrachten Sie dieses bitte als gegenstandslos. ' +
        'Bei Fragen stehen wir Ihnen gerne zur Verfügung.',
      );

      if (reminder.notes) {
        doc.moveDown();
        doc.font('Helvetica-Bold').text('Bemerkungen:');
        doc.font('Helvetica').text(reminder.notes);
      }

      doc.end();
    });
  }

  async generateCreditNotePdf(creditNote: any): Promise<Buffer> {
    return this.generateInvoicePdf({ ...creditNote, title: 'GUTSCHRIFT' });
  }
}
