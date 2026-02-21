/**
 * Sales Document PDF Generator
 * For quotes, orders, invoices, delivery notes, and credit notes
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface DocumentPosition {
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  vatRate?: number;
}

export interface CompanyInfo {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  vatNumber?: string;
  iban?: string;
  bic?: string;
}

export interface CustomerInfo {
  name: string;
  contact?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
}

export interface DeliveryAddressInfo {
  company?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
}

export interface SalesDocumentData {
  type: 'quote' | 'order' | 'invoice' | 'delivery-note' | 'credit-note' | 'reminder';
  number: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
  deliveryDate?: string;
  reference?: string;
  orderNumber?: string;
  projectNumber?: string;
  createdBy?: string;
  
  company: CompanyInfo;
  customer: CustomerInfo;
  deliveryAddress?: DeliveryAddressInfo;
  
  positions: DocumentPosition[];
  
  subtotal: number;
  discountPercent?: number;
  discountAmount?: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  
  notes?: string;
  paymentTerms?: string;
  deliveryTerms?: string;

  servicePeriodFrom?: string;
  servicePeriodTo?: string;
  earlyPaymentDiscount?: number;
  earlyPaymentDays?: number;
  originalInvoiceNumber?: string;

  // Reminder-specific fields
  reminderLevel?: number;
  reminderFee?: number;
  reminderInterestRate?: number;
  reminderInterestAmount?: number;
  reminderInvoiceTotal?: number;
}

const documentTitles: Record<string, { de: string }> = {
  'quote': { de: 'Angebot' },
  'order': { de: 'Auftragsbestätigung' },
  'invoice': { de: 'Rechnung' },
  'delivery-note': { de: 'Lieferschein' },
  'credit-note': { de: 'Gutschrift' },
  'reminder': { de: 'Mahnung' },
};

function formatAmount(amount: number): string {
  return amount.toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-CH');
  } catch {
    return dateStr;
  }
}

export function generateSalesDocumentPDF(data: SalesDocumentData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  const pageWidth = 210;
  const margin = 20;
  const title = documentTitles[data.type]?.de || 'Dokument';
  
  // Company Header (Top Right)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(data.company.name, pageWidth - margin, 20, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(data.company.street, pageWidth - margin, 26, { align: "right" });
  doc.text(`${data.company.postalCode} ${data.company.city}`, pageWidth - margin, 31, { align: "right" });
  
  if (data.company.phone) {
    doc.text(`Tel: ${data.company.phone}`, pageWidth - margin, 38, { align: "right" });
  }
  if (data.company.email) {
    doc.text(data.company.email, pageWidth - margin, 43, { align: "right" });
  }
  if (data.company.vatNumber) {
    doc.text(`MWST: ${data.company.vatNumber}`, pageWidth - margin, 50, { align: "right" });
  }
  
  // Customer Address (Left side, window position)
  let yPos = 50;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.customer.name, margin, yPos);
  doc.setFont("helvetica", "normal");
  
  if (data.customer.contact) {
    yPos += 5;
    doc.text(`z.Hd. ${data.customer.contact}`, margin, yPos);
  }
  if (data.customer.street) {
    yPos += 5;
    doc.text(data.customer.street, margin, yPos);
  }
  if (data.customer.postalCode && data.customer.city) {
    yPos += 5;
    doc.text(`${data.customer.postalCode} ${data.customer.city}`, margin, yPos);
  }

  // Delivery Address (if different from billing)
  if (data.deliveryAddress && (data.deliveryAddress.street || data.deliveryAddress.city)) {
    yPos += 8;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Lieferadresse:", margin, yPos);
    doc.setFont("helvetica", "normal");
    if (data.deliveryAddress.company) {
      yPos += 4;
      doc.text(data.deliveryAddress.company, margin, yPos);
    }
    if (data.deliveryAddress.street) {
      yPos += 4;
      doc.text(data.deliveryAddress.street, margin, yPos);
    }
    if (data.deliveryAddress.zipCode || data.deliveryAddress.city) {
      yPos += 4;
      doc.text(`${data.deliveryAddress.zipCode || ''} ${data.deliveryAddress.city || ''}`.trim(), margin, yPos);
    }
    if (data.deliveryAddress.country && data.deliveryAddress.country !== 'CH') {
      yPos += 4;
      doc.text(data.deliveryAddress.country, margin, yPos);
    }
    doc.setFontSize(10);
  }
  
  // Document Title
  yPos = Math.max(yPos + 10, 90);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${title} ${data.number}`, margin, yPos);
  
  // Document Meta
  yPos += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const metaLines: string[] = [];
  metaLines.push(`Datum: ${formatDate(data.date)}`);
  
  if (data.validUntil) {
    metaLines.push(`Gültig bis: ${formatDate(data.validUntil)}`);
  }
  if (data.dueDate) {
    metaLines.push(`Fällig am: ${formatDate(data.dueDate)}`);
  }
  if (data.deliveryDate) {
    metaLines.push(`Lieferdatum: ${formatDate(data.deliveryDate)}`);
  }
  if (data.orderNumber) {
    metaLines.push(`Auftragsnr.: ${data.orderNumber}`);
  }
  if (data.projectNumber) {
    metaLines.push(`Projektnr.: ${data.projectNumber}`);
  }
  if (data.reference) {
    metaLines.push(`Referenz: ${data.reference}`);
  }
  if (data.createdBy) {
    metaLines.push(`Erstellt von: ${data.createdBy}`);
  }
  if (data.servicePeriodFrom || data.servicePeriodTo) {
    const from = data.servicePeriodFrom ? formatDate(data.servicePeriodFrom) : '–';
    const to = data.servicePeriodTo ? formatDate(data.servicePeriodTo) : '–';
    metaLines.push(`Leistungszeitraum: ${from} – ${to}`);
  }
  if (data.originalInvoiceNumber) {
    metaLines.push(`Bezug auf Rechnung: ${data.originalInvoiceNumber}`);
  }
  
  metaLines.forEach((line, idx) => {
    doc.text(line, margin, yPos + idx * 5);
  });
  
  // Positions Table
  yPos += metaLines.length * 5 + 10;
  
  const tableHead = data.type === 'delivery-note'
    ? [["Pos", "Beschreibung", "Menge", "Einheit"]]
    : [["Pos", "Beschreibung", "Menge", "Einheit", "Einzelpreis", "Betrag"]];
  
  const tableData = data.positions.map((pos) => {
    if (data.type === 'delivery-note') {
      return [
        pos.position.toString(),
        pos.description,
        pos.quantity.toString(),
        pos.unit,
      ];
    }
    return [
      pos.position.toString(),
      pos.description,
      pos.quantity.toString(),
      pos.unit,
      `CHF ${formatAmount(pos.unitPrice)}`,
      `CHF ${formatAmount(pos.total)}`,
    ];
  });
  
  const columnStyles: any = data.type === 'delivery-note'
    ? {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 100 },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 25 },
      }
    : {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 68 },
        2: { cellWidth: 18, halign: "right" },
        3: { cellWidth: 20 },
        4: { cellWidth: 26, halign: "right" },
        5: { cellWidth: 26, halign: "right" },
      }; // Total: 12+68+18+20+26+26 = 170mm = A4 - margins
  
  autoTable(doc, {
    startY: yPos,
    head: tableHead,
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [50, 50, 50],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles,
    margin: { left: margin, right: margin },
    styles: {
      cellPadding: 3,
    },
  });
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals Section (not for delivery notes)
  if (data.type !== 'delivery-note') {
    const totalsX = pageWidth - margin - 60;
    let totalsY = finalY;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    if (data.type === 'reminder') {
      // Mahnung: Rechnungsbetrag + Mahngebühr + Verzugszins = Gesamtforderung
      doc.text("Rechnungsbetrag:", totalsX, totalsY);
      doc.text(`CHF ${formatAmount(data.reminderInvoiceTotal ?? data.subtotal)}`, pageWidth - margin, totalsY, { align: "right" });

      if (data.reminderFee && data.reminderFee > 0) {
        const levelNames: Record<number, string> = { 1: 'Zahlungserinnerung', 2: '1. Mahnung', 3: '2. Mahnung', 4: '3. Mahnung', 5: 'Letzte Mahnung' };
        totalsY += 5;
        doc.text(`Mahngebühr (${levelNames[data.reminderLevel || 1] || `Stufe ${data.reminderLevel}`}):`, totalsX, totalsY);
        doc.text(`CHF ${formatAmount(data.reminderFee)}`, pageWidth - margin, totalsY, { align: "right" });
      }

      if (data.reminderInterestAmount && data.reminderInterestAmount > 0) {
        totalsY += 5;
        doc.text(`Verzugszins (${data.reminderInterestRate ?? 5}% p.a.):`, totalsX, totalsY);
        doc.text(`CHF ${formatAmount(data.reminderInterestAmount)}`, pageWidth - margin, totalsY, { align: "right" });
      }

      totalsY += 3;
      doc.setDrawColor(0);
      doc.line(totalsX, totalsY, pageWidth - margin, totalsY);
      totalsY += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Gesamtforderung:", totalsX, totalsY);
      doc.text(`CHF ${formatAmount(data.total)}`, pageWidth - margin, totalsY, { align: "right" });
    } else {
      doc.text("Zwischensumme netto:", totalsX, totalsY);
      doc.text(`CHF ${formatAmount(data.subtotal)}`, pageWidth - margin, totalsY, { align: "right" });
      
      if (data.discountAmount && data.discountAmount > 0) {
        totalsY += 5;
        const discountLabel = data.discountPercent
          ? `Rabatt ${data.discountPercent}%:`
          : 'Rabatt:';
        doc.text(discountLabel, totalsX, totalsY);
        doc.text(`- CHF ${formatAmount(data.discountAmount)}`, pageWidth - margin, totalsY, { align: "right" });
      }
      
      totalsY += 5;
      doc.text(`MwSt. ${data.vatRate}%:`, totalsX, totalsY);
      doc.text(`CHF ${formatAmount(data.vatAmount)}`, pageWidth - margin, totalsY, { align: "right" });
      
      // Draw line
      totalsY += 3;
      doc.setDrawColor(0);
      doc.line(totalsX, totalsY, pageWidth - margin, totalsY);
      
      totalsY += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Gesamtbetrag:", totalsX, totalsY);
      doc.text(`CHF ${formatAmount(data.total)}`, pageWidth - margin, totalsY, { align: "right" });
    }
  }
  
  // Notes Section
  let notesY = data.type === 'delivery-note' ? finalY : finalY + 35;
  
  if (data.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text("Bemerkungen:", margin, notesY);
    notesY += 5;
    
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 2 * margin);
    doc.text(splitNotes, margin, notesY);
    notesY += splitNotes.length * 4;
  }
  
  // Payment/Delivery Terms
  if (data.paymentTerms) {
    notesY += 5;
    doc.text(`Zahlungsbedingungen: ${data.paymentTerms}`, margin, notesY);
  }
  if (data.deliveryTerms) {
    notesY += 5;
    doc.text(`Lieferbedingungen: ${data.deliveryTerms}`, margin, notesY);
  }
  if (data.earlyPaymentDiscount && data.earlyPaymentDays) {
    notesY += 5;
    doc.text(
      `${data.earlyPaymentDiscount}% Skonto bei Zahlung innert ${data.earlyPaymentDays} Tagen`,
      margin, notesY
    );
  }
  
  // Bank Details for Invoice
  if (data.type === 'invoice' && data.company.iban) {
    notesY += 12;
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Bankverbindung:", margin, notesY);
    doc.setFont("helvetica", "normal");
    notesY += 5;
    doc.text(`IBAN: ${data.company.iban}`, margin, notesY);
    if (data.company.bic) {
      notesY += 4;
      doc.text(`BIC: ${data.company.bic}`, margin, notesY);
    }
  }
  
  // Footer
  const footerY = 285;
  doc.setTextColor(120);
  doc.setFontSize(8);
  doc.text(
    `${data.company.name} | ${data.company.street} | ${data.company.postalCode} ${data.company.city}`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  
  return doc;
}

export function downloadSalesDocumentPDF(data: SalesDocumentData, filename?: string): void {
  const doc = generateSalesDocumentPDF(data);
  const title = documentTitles[data.type]?.de || 'Dokument';
  doc.save(filename || `${title}_${data.number}.pdf`);
}

export function getSalesDocumentPDFDataUrl(data: SalesDocumentData): string {
  const doc = generateSalesDocumentPDF(data);
  return doc.output('dataurlstring');
}

export function getSalesDocumentPDFBlobUrl(data: SalesDocumentData): string {
  const doc = generateSalesDocumentPDF(data);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}

export function getSalesDocumentPDFBase64(data: SalesDocumentData): string {
  const doc = generateSalesDocumentPDF(data);
  return doc.output('datauristring').split(',')[1]; // nur Base64-Teil ohne "data:application/pdf;base64,"
}
