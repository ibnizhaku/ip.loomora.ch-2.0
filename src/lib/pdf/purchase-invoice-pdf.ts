import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PurchaseInvoicePdfItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface PurchaseInvoicePdfData {
  // Empfänger (eigene Firma)
  companyName?: string;
  companyStreet?: string;
  companyZipCity?: string;
  companyVatNumber?: string;
  // Lieferant
  supplierName: string;
  supplierAddress?: string;
  supplierCity?: string;
  supplierVatNumber?: string;
  // Rechnungsdaten
  invoiceNumber: string;         // Interne Nummer (ER-2026-001)
  externalNumber?: string;       // Lieferanten-Rechnungsnummer
  invoiceDate: string;
  dueDate?: string;
  // Positionen
  items: PurchaseInvoicePdfItem[];
  subtotal: number;
  vatRate: number;               // z.B. 8.1
  vatAmount: number;
  total: number;
  paidAmount?: number;
  notes?: string;
  // Verknüpfungen
  purchaseOrderNumber?: string;
}

const COMPANY_DEFAULTS = {
  name: 'Loomora AG',
  street: 'Bahnhofstrasse 42',
  zipCity: '8001 Zürich',
  vatNumber: 'CHE-123.456.789 MWST',
  phone: '+41 44 123 45 67',
  email: 'buchhaltung@loomora.ch',
};

function formatChf(n: number) {
  return `CHF ${n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString('de-CH'); } catch { return d; }
}

function buildDoc(data: PurchaseInvoicePdfData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const primary: [number, number, number] = [30, 58, 138];
  const text: [number, number, number] = [51, 51, 51];
  const muted: [number, number, number] = [128, 128, 128];

  const company = {
    name: data.companyName || COMPANY_DEFAULTS.name,
    street: data.companyStreet || COMPANY_DEFAULTS.street,
    zipCity: data.companyZipCity || COMPANY_DEFAULTS.zipCity,
    vatNumber: data.companyVatNumber || COMPANY_DEFAULTS.vatNumber,
  };

  // ── HEADER: Firmenname rechts oben ──
  let y = margin;
  doc.setFontSize(20).setFont('helvetica', 'bold').setTextColor(...primary);
  doc.text(company.name, pageWidth - margin, y, { align: 'right' });
  y += 6;
  doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(...muted);
  doc.text(company.street, pageWidth - margin, y, { align: 'right' });
  y += 4;
  doc.text(company.zipCity, pageWidth - margin, y, { align: 'right' });
  y += 4;
  doc.text(company.vatNumber, pageWidth - margin, y, { align: 'right' });

  // ── LIEFERANTENADRESSE (Fensterumschlag links) ──
  y = 55;
  doc.setFontSize(8).setTextColor(...muted);
  doc.text(`${company.name} • ${company.street} • ${company.zipCity}`, margin, y);
  y += 8;
  doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(...text);
  doc.text(data.supplierName, margin, y);
  if (data.supplierAddress) { y += 5; doc.setFont('helvetica', 'normal'); doc.text(data.supplierAddress, margin, y); }
  if (data.supplierCity) { y += 5; doc.text(data.supplierCity, margin, y); }
  if (data.supplierVatNumber) { y += 5; doc.setFontSize(9).setTextColor(...muted); doc.text(`UID: ${data.supplierVatNumber}`, margin, y); }

  // ── DOKUMENTTITEL ──
  y = 105;
  doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor(...primary);
  doc.text('EINGANGSRECHNUNG', margin, y);

  // ── INFO-BLOCK rechts ──
  y += 10;
  const infoX = 130;
  const valX = 175;
  const infoRows: [string, string][] = [
    ['Interne Nr.:', data.invoiceNumber],
    ['Lieferanten-RgNr.:', data.externalNumber || '—'],
    ['Rechnungsdatum:', formatDate(data.invoiceDate)],
  ];
  if (data.dueDate) infoRows.push(['Fällig am:', formatDate(data.dueDate)]);
  if (data.purchaseOrderNumber) infoRows.push(['Bestellung:', data.purchaseOrderNumber]);

  doc.setFontSize(9).setTextColor(...text);
  infoRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold'); doc.text(label, infoX, y);
    doc.setFont('helvetica', 'normal'); doc.text(value, valX, y);
    y += 6;
  });

  // Fälligkeits-Warnung
  if (data.dueDate && new Date(data.dueDate) < new Date()) {
    const warnY = y;
    doc.setFontSize(8).setTextColor(200, 50, 50).setFont('helvetica', 'bold');
    doc.text('⚠ ÜBERFÄLLIG', infoX, warnY);
    doc.setTextColor(...text);
    y += 6;
  }

  // ── INTRO-TEXT ──
  y = 145;
  doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(...text);
  doc.text('Wir haben folgende Rechnung von unserem Lieferanten erhalten:', margin, y);

  // ── POSITIONSTABELLE ──
  y += 8;
  autoTable(doc, {
    startY: y,
    head: [['Pos.', 'Beschreibung', 'Menge', 'Einheit', 'Einzelpreis', 'Total']],
    body: data.items.map((item, i) => [
      (i + 1).toString(),
      item.description,
      item.quantity.toString(),
      item.unit || 'Stk',
      formatChf(item.unitPrice),
      formatChf(item.total),
    ]),
    theme: 'striped',
    headStyles: { fillColor: primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: text },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 68 },
      2: { cellWidth: 16, halign: 'right' },
      3: { cellWidth: 16 },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // ── TOTALS ──
  y = ((doc as any).lastAutoTable?.finalY ?? (y + 50)) + 10;
  const totalsX = 130;
  const totalsValX = pageWidth - margin;

  doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(...text);
  doc.text('Zwischensumme (netto):', totalsX, y);
  doc.text(formatChf(data.subtotal), totalsValX, y, { align: 'right' });
  y += 6;
  doc.text(`MwSt. ${data.vatRate}%:`, totalsX, y);
  doc.text(formatChf(data.vatAmount), totalsValX, y, { align: 'right' });
  y += 2;
  doc.setDrawColor(...primary);
  doc.line(totalsX, y, totalsValX, y);
  y += 6;
  doc.setFontSize(12).setFont('helvetica', 'bold');
  doc.text('Gesamtbetrag:', totalsX, y);
  doc.text(formatChf(data.total), totalsValX, y, { align: 'right' });

  if (data.paidAmount && data.paidAmount > 0) {
    y += 8;
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(0, 150, 80);
    doc.text(`Bezahlt: -${formatChf(data.paidAmount)}`, totalsX, y, { align: 'left' });
    y += 6;
    const open = data.total - data.paidAmount;
    doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(open > 0 ? 200 : 0, open > 0 ? 100 : 150, 0);
    doc.text(`Offener Betrag: ${formatChf(open)}`, totalsX, y);
    doc.setTextColor(...text);
  }

  // ── BEMERKUNGEN ──
  if (data.notes) {
    y += 15;
    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(...text);
    doc.text('Bemerkungen:', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(data.notes, pageWidth - 2 * margin);
    doc.text(lines, margin, y);
  }

  // ── SWISS MWST HINWEIS ──
  y = 262;
  doc.setFontSize(8).setTextColor(...muted).setFont('helvetica', 'normal');
  doc.text('Vorsteuerabzug gemäss Art. 28 MWSTG möglich, sofern alle Pflichtangaben nach Art. 26 MWSTG erfüllt sind.', margin, y);

  // ── PAGE FOOTER ──
  const footerY = 285;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
  doc.setFontSize(8).setTextColor(...muted);
  doc.text(
    `${company.name} • ${company.street} • ${company.zipCity} • ${company.vatNumber}`,
    pageWidth / 2, footerY, { align: 'center' }
  );

  return doc;
}

/** Download PDF */
export function downloadPurchaseInvoicePDF(data: PurchaseInvoicePdfData): void {
  const doc = buildDoc(data);
  doc.save(`Eingangsrechnung-${data.invoiceNumber}.pdf`);
}

/** Base64 string für E-Mail Anhang */
export function getPurchaseInvoicePDFBase64(data: PurchaseInvoicePdfData): string {
  const doc = buildDoc(data);
  return doc.output('datauristring').split(',')[1];
}

/** Blob URL → neues Fenster → window.print() */
export function printPurchaseInvoicePDF(data: PurchaseInvoicePdfData): void {
  const doc = buildDoc(data);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      win.print();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    });
  }
}
