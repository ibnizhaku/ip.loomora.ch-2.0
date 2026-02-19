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

      // QR-Bill – ISO 20022 / SIX Swiss Payment Standard (SPC 0200)
      if (invoice.qrReference) {
        doc.addPage();
        doc.fontSize(10).font('Helvetica');
        doc.text('Zahlteil', 50, 50);

        // SIX-konformer QR-Payload (echte Zeilenumbrüche, Adresstyp S, strukturiert)
        const effectiveIban = (invoice.qrIban || invoice.iban || '').replace(/\s/g, '');
        const creditorName   = (invoice.company?.name || invoice.creditorName || '').substring(0, 70);
        const creditorStreet = (invoice.company?.street || invoice.creditorStreet || '').substring(0, 70);
        const creditorHouse  = (invoice.company?.buildingNumber || '');
        const creditorZip    = (invoice.company?.zip || invoice.creditorZip || '').substring(0, 16);
        const creditorCity   = (invoice.company?.city || invoice.creditorCity || '').substring(0, 35);
        const creditorCountry = (invoice.company?.country || 'CH');
        const debtorName     = (invoice.customer?.companyName || invoice.customer?.name || '').substring(0, 70);
        const debtorStreet   = (invoice.customer?.street || '').substring(0, 70);
        const debtorZip      = (invoice.customer?.zip || '').substring(0, 16);
        const debtorCity     = (invoice.customer?.city || '').substring(0, 35);
        const debtorCountry  = (invoice.customer?.country || 'CH');
        const amount         = Number(invoice.totalAmount || invoice.total || 0);
        const additionalInfo = (invoice.additionalInfo || invoice.notes || '').substring(0, 140);

        const qrLines = [
          'SPC',                          // QR-Typ
          '0200',                         // Version
          '1',                            // Zeichensatz (UTF-8)
          effectiveIban,                  // IBAN / QR-IBAN
          'S',                            // Adresstyp Kreditor (S = strukturiert)
          creditorName,
          creditorStreet,
          creditorHouse,
          creditorZip,
          creditorCity,
          creditorCountry,
          '', '', '', '', '', '', '',      // Ultimate Creditor (7 leer – nicht genutzt)
          amount > 0 ? amount.toFixed(2) : '', // Betrag (leer = offen)
          'CHF',                          // Währung
          'S',                            // Adresstyp Debitor (S = strukturiert)
          debtorName,
          debtorStreet,
          '',                             // Hausnummer (leer wenn in Strasse enthalten)
          debtorZip,
          debtorCity,
          debtorCountry,
          'QRR',                          // Referenztyp
          (invoice.qrReference || '').replace(/\s/g, ''), // 27-stellige QR-Referenz
          additionalInfo,                 // Zusatzinformationen
          'EPD',                          // End Payment Data
          '',                             // AV1 (leer)
          '',                             // AV2 (leer)
        ];
        const qrData = qrLines.join('\n');

        QRCode.toDataURL(qrData, { errorCorrectionLevel: 'M', width: 150 }, (err, url) => {
          if (!err && url) {
            doc.image(url, 50, 80, { width: 150 });
          }
          doc.text(`Konto / Zahlbar an: ${effectiveIban}`, 220, 90);
          doc.text(`${creditorName}`, 220, 105);
          doc.text(`${creditorStreet}, ${creditorZip} ${creditorCity}`, 220, 120);
          doc.moveDown();
          doc.text(`Währung: CHF`, 220, 145);
          doc.text(`Betrag: CHF ${amount.toFixed(2)}`, 220, 160);
          doc.moveDown();
          doc.text(`Referenz: ${(invoice.qrReference || '').replace(/(\d{2})(\d{5})(\d{5})(\d{5})(\d{5})(\d{5})/, '$1 $2 $3 $4 $5 $6')}`, 50, 245);
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
      const company = reminder.company || {};
      const level = reminder.level || 1;
      const fee = Number(reminder.fee ?? 0);
      const originalAmount = Number(invoice.totalAmount ?? 0);

      // Verzugszins: 5% p.a. ab originalem Fälligkeitsdatum
      let interestAmount = 0;
      if (invoice.dueDate) {
        const daysOverdue = Math.max(
          0,
          Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
        );
        interestAmount = originalAmount * 0.05 * (daysOverdue / 365);
      }

      // Gesamtforderung = Original + Mahngebühr + Verzugszins
      const totalWithFee = Number(
        reminder.totalWithFee ?? (originalAmount + fee + interestAmount),
      );

      const tableLeft = 50;
      const tableRight = 480;
      const colValue = 380;

      const drawRow = (label: string, value: string, bold = false) => {
        const y = doc.y;
        if (bold) doc.font('Helvetica-Bold'); else doc.font('Helvetica');
        doc.fontSize(10).text(label, tableLeft, y, { width: colValue - tableLeft });
        doc.text(value, colValue, y, { width: tableRight - colValue, align: 'right' });
        doc.moveDown(0.5);
      };

      // ── Firmen-Header (Absender oben links) ──────────────────────────────
      doc.fontSize(10).font('Helvetica');
      if (company.name) doc.text(company.name, 50, 50);
      if (company.street) doc.text(company.street);
      if (company.zip && company.city) doc.text(`${company.zip} ${company.city}`);

      // ── Titel + Meta (oben rechts) ────────────────────────────────────────
      doc.fontSize(20).font('Helvetica-Bold').text(`${level}. MAHNUNG`, 50, 50, { align: 'right' });
      doc.fontSize(10).font('Helvetica');
      doc.text(`Mahnung Nr.: ${reminder.number || '–'}`, { align: 'right' });
      doc.text(`Rechnungs-Nr.: ${invoice.number || '–'}`, { align: 'right' });
      doc.text(`Datum: ${parseDate(reminder.createdAt)}`, { align: 'right' });
      doc.text(`Fällig bis: ${parseDate(reminder.dueDate)}`, { align: 'right' });

      doc.moveDown(4);

      // ── Schuldner-Adressblock ─────────────────────────────────────────────
      doc.font('Helvetica');
      doc.text(customer.companyName || customer.name || 'Kunde');
      if (customer.street) doc.text(customer.street);
      if (customer.zip && customer.city) doc.text(`${customer.zip} ${customer.city}`);
      doc.moveDown(2);

      // ── Betreff ───────────────────────────────────────────────────────────
      doc.font('Helvetica-Bold').fontSize(11)
        .text(`Betreff: ${level}. Mahnstufe – Rechnung ${invoice.number || ''}`);
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10);
      doc.text(
        level === 1
          ? `Trotz unserer Rechnung vom ${parseDate(invoice.issueDate)} haben wir bis heute keinen Zahlungseingang festgestellt. ` +
            'Wir bitten Sie, den ausstehenden Betrag innerhalb der Nachfrist zu begleichen.'
          : `Wir haben Ihnen bereits ${level - 1} Mahnung(en) zugestellt. Da wir bisher keine Zahlung erhalten haben, ` +
            'ersuchen wir Sie dringend, den Gesamtbetrag innerhalb der gesetzten Frist zu begleichen.',
      );
      doc.moveDown(1.5);

      // ── Forderungs-Tabelle ────────────────────────────────────────────────
      doc.moveTo(tableLeft, doc.y).lineTo(tableRight, doc.y).stroke();
      doc.moveDown(0.5);

      drawRow('Rechnungsbetrag (Original):', `CHF ${originalAmount.toFixed(2)}`);
      drawRow('Rechnungsdatum:', parseDate(invoice.issueDate));
      drawRow('Ursprüngliches Fälligkeitsdatum:', parseDate(invoice.dueDate));

      doc.moveDown(0.3);
      drawRow(`Mahngebühr (${level}. Mahnstufe):`, `CHF ${fee.toFixed(2)}`);

      if (interestAmount > 0) {
        drawRow('Verzugszins (5% p.a.):', `CHF ${interestAmount.toFixed(2)}`);
      }

      doc.moveDown(0.5);
      doc.moveTo(tableLeft, doc.y).lineTo(tableRight, doc.y).stroke();
      doc.moveDown(0.5);
      drawRow('GESAMTFORDERUNG:', `CHF ${totalWithFee.toFixed(2)}`, true);
      doc.moveDown(0.3);
      doc.moveTo(tableLeft, doc.y).lineTo(tableRight, doc.y).lineWidth(2).stroke();
      doc.lineWidth(1);
      doc.moveDown(2);

      // ── Zahlungsanweisungen ───────────────────────────────────────────────
      const iban = (company.qrIban || company.iban || invoice.qrIban || invoice.iban || '').replace(/\s/g, '');
      const qrRef = invoice.qrReference || '';
      if (iban) {
        doc.font('Helvetica-Bold').fontSize(10).text('Zahlungsanweisungen:');
        doc.font('Helvetica');
        doc.text(`Bitte überweisen Sie den Gesamtbetrag von CHF ${totalWithFee.toFixed(2)} bis zum ${parseDate(reminder.dueDate)} auf:`);
        doc.moveDown(0.3);
        doc.text(`IBAN: ${iban.replace(/(.{4})/g, '$1 ').trim()}`);
        if (qrRef) doc.text(`QR-Referenz: ${qrRef.replace(/(\d{2})(\d{5})(\d{5})(\d{5})(\d{5})(\d{5})/, '$1 $2 $3 $4 $5 $6')}`);
        if (company.name) doc.text(`Zahlungsempfänger: ${company.name}`);
        doc.moveDown(1);
      } else {
        doc.font('Helvetica').fontSize(10);
        doc.text(`Bitte begleichen Sie den offenen Betrag von CHF ${totalWithFee.toFixed(2)} bis zum ${parseDate(reminder.dueDate)}.`);
        doc.moveDown(1);
      }

      // ── Schlusshinweis ────────────────────────────────────────────────────
      doc.fontSize(9);
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
