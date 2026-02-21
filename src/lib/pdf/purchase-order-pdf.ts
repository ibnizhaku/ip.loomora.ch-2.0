import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Supplier {
  name: string;
  number: string;
  city: string;
}

interface Project {
  id: string;
  name: string;
  number: string;
}

interface PurchaseOrderData {
  orderNumber: string;
  supplier: Supplier;
  items: OrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  expectedDelivery?: string;
  reference?: string;
  notes?: string;
  project?: Project | null;
  createdBy?: string | null;
}

// Company info - in real app this would come from settings
const COMPANY_INFO = {
  name: 'Loomora AG',
  street: 'Bahnhofstrasse 42',
  zipCity: '8001 Zürich',
  country: 'Schweiz',
  phone: '+41 44 123 45 67',
  email: 'einkauf@loomora.ch',
  website: 'www.loomora.ch',
  vatNumber: 'CHE-123.456.789 MWST',
};

export function generatePurchaseOrderPDF(data: PurchaseOrderData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  _buildPurchaseOrderPDF(doc, data);
  doc.save(`Bestellung_${data.orderNumber}.pdf`);
}

/** Generates the same PDF and returns it as a base64 string (for email attachments) */
export function getPurchaseOrderPDFBase64(data: PurchaseOrderData): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  _buildPurchaseOrderPDF(doc, data);
  return doc.output('datauristring').split(',')[1];
}

/** Internal builder — used by both generatePurchaseOrderPDF and getPurchaseOrderPDFBase64 */
function _buildPurchaseOrderPDF(doc: jsPDF, data: PurchaseOrderData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  const primaryColor: [number, number, number] = [30, 58, 138];
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [128, 128, 128];

  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_INFO.name, pageWidth - margin, y, { align: 'right' });
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_INFO.street, pageWidth - margin, y, { align: 'right' });
  y += 4;
  doc.text(COMPANY_INFO.zipCity, pageWidth - margin, y, { align: 'right' });
  y += 4;
  doc.text(`Tel: ${COMPANY_INFO.phone}`, pageWidth - margin, y, { align: 'right' });
  y += 4;
  doc.text(COMPANY_INFO.email, pageWidth - margin, y, { align: 'right' });

  y = 55;
  doc.setFontSize(8);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(`${COMPANY_INFO.name} • ${COMPANY_INFO.street} • ${COMPANY_INFO.zipCity}`, margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(data.supplier.name, margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Lieferanten-Nr.: ${data.supplier.number}`, margin, y);
  y += 5;
  doc.text(data.supplier.city, margin, y);

  y = 105;
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('EINKAUFSBESTELLUNG', margin, y);

  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  const infoX = 130;
  const valueX = 165;
  doc.setFont('helvetica', 'bold');
  doc.text('Bestellnummer:', infoX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.orderNumber, valueX, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Datum:', infoX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('de-CH'), valueX, y);
  if (data.expectedDelivery) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Liefertermin:', infoX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(data.expectedDelivery).toLocaleDateString('de-CH'), valueX, y);
  }
  if (data.reference) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Ihre Referenz:', infoX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.reference, valueX, y);
  }
  if (data.project) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Projekt:', infoX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.project.number}`, valueX, y);
  }

  if (data.createdBy) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Ersteller:', infoX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.createdBy, valueX, y);
  }

  y = 145;
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Wir bestellen bei Ihnen folgende Artikel:', margin, y);
  y += 8;

  const tableData = data.items.map((item, index) => [
    (index + 1).toString(),
    item.sku,
    item.name,
    `${item.quantity} ${item.unit}`,
    `CHF ${item.unitPrice.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`,
    `CHF ${item.total.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Pos.', 'Art.-Nr.', 'Bezeichnung', 'Menge', 'Einzelpreis', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: textColor },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 60 },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  y = ((doc as any).lastAutoTable?.finalY ?? (y + 50)) + 10;
  const totalsX = 130;
  const totalsValueX = pageWidth - margin;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Zwischensumme:', totalsX, y);
  doc.text(`CHF ${data.subtotal.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`, totalsValueX, y, { align: 'right' });
  y += 6;
  doc.text('MwSt. 8.1%:', totalsX, y);
  doc.text(`CHF ${data.vat.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`, totalsValueX, y, { align: 'right' });
  y += 2;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Gesamtbetrag:', totalsX, y);
  doc.text(`CHF ${data.total.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`, totalsValueX, y, { align: 'right' });

  if (data.notes) {
    y += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bemerkungen:', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 2 * margin);
    doc.text(splitNotes, margin, y);
    y += splitNotes.length * 5;
  }

  y = 260;
  doc.setFontSize(9);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Bitte bestätigen Sie den Erhalt dieser Bestellung.', margin, y);
  y += 5;
  doc.text('Bei Fragen wenden Sie sich bitte an unseren Einkauf.', margin, y);
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Freundliche Grüsse', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_INFO.name, margin, y);
  y += 4;
  doc.text('Einkaufsabteilung', margin, y);

  const footerY = 285;
  doc.setFontSize(8);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
  doc.text(
    `${COMPANY_INFO.name} • ${COMPANY_INFO.street} • ${COMPANY_INFO.zipCity} • ${COMPANY_INFO.vatNumber}`,
    pageWidth / 2, footerY, { align: 'center' }
  );
}
