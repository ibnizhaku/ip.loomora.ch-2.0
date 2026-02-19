/**
 * Swiss QR-Invoice PDF Generator
 * Fully compliant with ISO 20022 Swiss Payment Standard
 * 
 * References:
 * - Swiss Payment Standards 2024 (SIX Interbank Clearing)
 * - Implementation Guidelines for the QR-bill
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

// ============================================
// Types & Interfaces
// ============================================

export interface QRInvoiceCreditor {
  name: string;
  street: string;
  buildingNumber?: string;
  postalCode: string;
  city: string;
  country: string; // ISO 3166-1 alpha-2 (e.g., "CH")
}

export interface QRInvoiceDebtor {
  name: string;
  street?: string;
  buildingNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

export interface QRInvoicePosition {
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  vatRate?: number;
}

export interface QRInvoiceData {
  // Invoice Header
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  
  // Amounts
  currency: "CHF" | "EUR";
  amount: number;
  vatRate: number;
  vatAmount: number;
  subtotal: number;
  
  // Payment Reference
  iban: string;
  qrIban?: string; // QR-IBAN for QRR references
  reference?: string;
  referenceType: "QRR" | "SCOR" | "NON";
  additionalInfo?: string;
  
  // Parties
  creditor: QRInvoiceCreditor;
  debtor?: QRInvoiceDebtor;
  
  // Positions
  positions: QRInvoicePosition[];
  
  // Optional
  orderNumber?: string;
  projectNumber?: string;
  paymentTermDays?: number;
}

// ============================================
// Constants (Swiss Payment Standard)
// ============================================

const QR_TYPE = "SPC"; // Swiss Payment Code
const VERSION = "0200"; // Version 2.0
const CODING = "1"; // UTF-8

// Payment part dimensions (mm) - according to SIX specs
const PAYMENT_PART_HEIGHT = 105;
const RECEIPT_WIDTH = 62;
const PAYMENT_PART_WIDTH = 148;
const QR_CODE_SIZE = 46; // mm
const SWISS_CROSS_SIZE = 7; // mm

// Scissors line position
const SCISSORS_Y = 297 - PAYMENT_PART_HEIGHT;

// ============================================
// QR Code Data String Builder
// ============================================

export function buildQRCodeData(data: QRInvoiceData): string {
  const lines: string[] = [];
  
  // Header
  lines.push(QR_TYPE);
  lines.push(VERSION);
  lines.push(CODING);
  
  // Creditor Account (IBAN or QR-IBAN)
  const iban = data.referenceType === "QRR" && data.qrIban 
    ? data.qrIban.replace(/\s/g, "")
    : data.iban.replace(/\s/g, "");
  lines.push(iban);
  
  // Creditor (structured address type "S")
  lines.push("S"); // Address type
  lines.push(data.creditor.name.substring(0, 70));
  lines.push(data.creditor.street?.substring(0, 70) || "");
  lines.push(data.creditor.buildingNumber?.substring(0, 16) || "");
  lines.push(data.creditor.postalCode.substring(0, 16));
  lines.push(data.creditor.city.substring(0, 35));
  lines.push(data.creditor.country);
  
  // Ultimate Creditor (not used - 7 empty lines)
  lines.push(""); // Type
  lines.push(""); // Name
  lines.push(""); // Street
  lines.push(""); // Building
  lines.push(""); // Postal code
  lines.push(""); // City
  lines.push(""); // Country
  
  // Payment Amount (empty string if amount is 0 – SIX-Spec: open amount)
  lines.push(data.amount > 0 ? data.amount.toFixed(2) : "");
  lines.push(data.currency);
  
  // Ultimate Debtor
  if (data.debtor && data.debtor.name) {
    lines.push("S"); // Address type
    lines.push(data.debtor.name.substring(0, 70));
    lines.push(data.debtor.street?.substring(0, 70) || "");
    lines.push(data.debtor.buildingNumber?.substring(0, 16) || "");
    lines.push(data.debtor.postalCode?.substring(0, 16) || "");
    lines.push(data.debtor.city?.substring(0, 35) || "");
    lines.push(data.debtor.country || "CH");
  } else {
    // No debtor - 7 empty lines
    lines.push("");
    lines.push("");
    lines.push("");
    lines.push("");
    lines.push("");
    lines.push("");
    lines.push("");
  }
  
  // Reference
  lines.push(data.referenceType);
  lines.push(data.reference?.replace(/\s/g, "") || "");
  
  // Additional information
  lines.push(data.additionalInfo?.substring(0, 140) || "");
  
  // Trailer
  lines.push("EPD"); // End Payment Data
  
  // Alternative procedures (SIX-Spec requires exactly 2 AV lines)
  lines.push(""); // AV1
  lines.push(""); // AV2
  
  return lines.join("\n");
}

// ============================================
// QR Code Generation with Swiss Cross
// ============================================

async function generateQRCodeWithSwissCross(data: string): Promise<string> {
  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(data, {
    errorCorrectionLevel: "M", // Medium error correction
    margin: 0,
    width: 500,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
  
  return qrCodeDataUrl;
}

// ============================================
// Swiss Cross Drawing
// ============================================

/**
 * Draws the Swiss Cross centered at (centerX, centerY)
 * Exact SIX dimensions:
 *   Total cross area:     7.0 × 7.0 mm
 *   White background sq:  6.0 × 6.0 mm (1mm margin)
 *   Red square:           4.8 × 4.8 mm
 *   Vertical arm:         1.0 × 2.8 mm
 *   Horizontal arm:       2.8 × 1.0 mm
 */
function drawSwissCross(doc: jsPDF, centerX: number, centerY: number): void {
  // White background square: 6×6mm
  doc.setFillColor(255, 255, 255);
  doc.rect(centerX - 3, centerY - 3, 6, 6, "F");

  // Red square: 4.8×4.8mm  (#DC0000)
  doc.setFillColor(220, 0, 0);
  doc.rect(centerX - 2.4, centerY - 2.4, 4.8, 4.8, "F");

  // White cross – vertical arm: 1.0×2.8mm
  doc.setFillColor(255, 255, 255);
  doc.rect(centerX - 0.5, centerY - 1.4, 1.0, 2.8, "F");

  // White cross – horizontal arm: 2.8×1.0mm
  doc.rect(centerX - 1.4, centerY - 0.5, 2.8, 1.0, "F");
}

// ============================================
// Format Helpers
// ============================================

function formatAmount(amount: number): string {
  return amount.toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatIBAN(iban: string): string {
  // Format: CH93 0076 2011 6238 5295 7
  const clean = iban.replace(/\s/g, "");
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

function formatQRReference(ref: string): string {
  if (!ref) return "";
  // Format: 00 00000 00000 00000 00000 00156
  const clean = ref.replace(/\s/g, "").padStart(27, "0");
  return `${clean.slice(0, 2)} ${clean.slice(2, 7)} ${clean.slice(7, 12)} ${clean.slice(12, 17)} ${clean.slice(17, 22)} ${clean.slice(22, 27)}`;
}

function formatSCORReference(ref: string): string {
  if (!ref) return "";
  // Format: RF18 5390 0754 7034
  const clean = ref.replace(/\s/g, "");
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

// ============================================
// Main PDF Generator
// ============================================

export async function generateSwissQRInvoicePDF(data: QRInvoiceData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  
  // ==========================================
  // PAGE 1: Invoice Content
  // ==========================================
  
  // Company Header (Top Right)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.creditor.name, pageWidth - margin, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(data.creditor.street, pageWidth - margin, 25, { align: "right" });
  doc.text(`${data.creditor.postalCode} ${data.creditor.city}`, pageWidth - margin, 30, { align: "right" });
  
  // Debtor Address (Left side, window position)
  let yPos = 50;
  if (data.debtor) {
    doc.setFontSize(10);
    doc.text(data.debtor.name, margin, yPos);
    if (data.debtor.street) {
      yPos += 5;
      doc.text(data.debtor.street, margin, yPos);
    }
    if (data.debtor.postalCode && data.debtor.city) {
      yPos += 5;
      doc.text(`${data.debtor.postalCode} ${data.debtor.city}`, margin, yPos);
    }
  }
  
  // Invoice Title
  yPos = 85;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`Rechnung ${data.invoiceNumber}`, margin, yPos);
  
  // Invoice Meta
  yPos += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Rechnungsdatum: ${data.invoiceDate}`, margin, yPos);
  yPos += 5;
  doc.text(`Fällig am: ${data.dueDate}`, margin, yPos);
  if (data.orderNumber) {
    yPos += 5;
    doc.text(`Auftragsnummer: ${data.orderNumber}`, margin, yPos);
  }
  if (data.projectNumber) {
    yPos += 5;
    doc.text(`Projektnummer: ${data.projectNumber}`, margin, yPos);
  }
  
  // Positions Table
  yPos += 15;
  
  const tableData = data.positions.map((pos) => [
    pos.position.toString(),
    pos.description,
    `${pos.quantity} ${pos.unit}`,
    `CHF ${formatAmount(pos.unitPrice)}`,
    `CHF ${formatAmount(pos.total)}`,
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [["Pos", "Beschreibung", "Menge", "Einzelpreis", "Betrag"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 80 },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals Section
  const totalsX = pageWidth - margin - 60;
  let totalsY = finalY;
  
  doc.setFontSize(10);
  doc.text("Zwischensumme:", totalsX, totalsY);
  doc.text(`CHF ${formatAmount(data.subtotal)}`, pageWidth - margin, totalsY, { align: "right" });
  
  totalsY += 6;
  doc.text(`MwSt. ${data.vatRate}%:`, totalsX, totalsY);
  doc.text(`CHF ${formatAmount(data.vatAmount)}`, pageWidth - margin, totalsY, { align: "right" });
  
  totalsY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Gesamtbetrag:", totalsX, totalsY);
  doc.text(`CHF ${formatAmount(data.amount)}`, pageWidth - margin, totalsY, { align: "right" });
  
  // Payment Terms
  totalsY += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  if (data.paymentTermDays) {
    doc.text(`Zahlungsbedingungen: ${data.paymentTermDays} Tage netto`, margin, totalsY);
  }
  totalsY += 5;
  doc.text("Bitte verwenden Sie den beigefügten Einzahlungsschein für die Zahlung.", margin, totalsY);
  doc.setTextColor(0);
  
  // ==========================================
  // PAYMENT PART (Page 2)
  // ==========================================
  doc.addPage();
  
  // Scissors / Perforation Line
  const perfY = SCISSORS_Y;
  doc.setDrawColor(0);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(0, perfY, pageWidth, perfY);
  doc.setLineDashPattern([], 0);
  
  // Scissors icon (text representation)
  doc.setFontSize(8);
  doc.text("✂", 5, perfY - 1);
  
  // Payment Part Background
  const paymentStartY = perfY + 5;
  
  // ==========================================
  // RECEIPT (Empfangsschein) - Left Side
  // ==========================================
  
  const receiptX = 5;
  let receiptY = paymentStartY;
  
  // Title
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Empfangsschein", receiptX, receiptY);
  
  // Account / Payable to
  receiptY += 8;
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("Konto / Zahlbar an", receiptX, receiptY);
  
  receiptY += 3;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  // SIX-Spec: QR-IBAN must be displayed when referenceType is QRR
  const displayIbanReceipt = (data.referenceType === "QRR" && data.qrIban) ? data.qrIban : data.iban;
  doc.text(formatIBAN(displayIbanReceipt), receiptX, receiptY);
  receiptY += 3.5;
  doc.text(data.creditor.name, receiptX, receiptY);
  receiptY += 3.5;
  doc.text(data.creditor.street, receiptX, receiptY);
  receiptY += 3.5;
  doc.text(`${data.creditor.postalCode} ${data.creditor.city}`, receiptX, receiptY);
  
  // Reference
  if (data.reference && data.referenceType !== "NON") {
    receiptY += 6;
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("Referenz", receiptX, receiptY);
    receiptY += 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const formattedRef = data.referenceType === "QRR" 
      ? formatQRReference(data.reference)
      : formatSCORReference(data.reference);
    doc.text(formattedRef, receiptX, receiptY);
  }
  
  // Payable by
  receiptY += 6;
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("Zahlbar durch", receiptX, receiptY);
  
  if (data.debtor && data.debtor.name) {
    receiptY += 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(data.debtor.name, receiptX, receiptY);
    if (data.debtor.street) {
      receiptY += 3.5;
      doc.text(data.debtor.street, receiptX, receiptY);
    }
    if (data.debtor.postalCode && data.debtor.city) {
      receiptY += 3.5;
      doc.text(`${data.debtor.postalCode} ${data.debtor.city}`, receiptX, receiptY);
    }
  } else {
    // Empty box for handwriting
    receiptY += 3;
    doc.setDrawColor(0);
    doc.rect(receiptX, receiptY, 52, 20);
  }
  
  // Currency and Amount (bottom of receipt)
  const receiptBottomY = pageHeight - 15;
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("Währung", receiptX, receiptBottomY - 10);
  doc.text("Betrag", receiptX + 20, receiptBottomY - 10);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(data.currency, receiptX, receiptBottomY - 6);
  doc.text(formatAmount(data.amount), receiptX + 20, receiptBottomY - 6);
  
  // Acceptance point
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("Annahmestelle", receiptX + 35, receiptBottomY);
  
  // ==========================================
  // PAYMENT PART (Zahlteil) - Right Side
  // ==========================================
  
  const paymentX = RECEIPT_WIDTH + 5;
  let paymentY = paymentStartY;
  
  // Title
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Zahlteil", paymentX, paymentY);
  
  // QR Code
  const qrX = paymentX;
  const qrY = paymentY + 5;
  
  // Generate and embed QR code
  const qrData = buildQRCodeData(data);
  const qrCodeImage = await generateQRCodeWithSwissCross(qrData);
  doc.addImage(qrCodeImage, "PNG", qrX, qrY, QR_CODE_SIZE, QR_CODE_SIZE);
  
  // Draw Swiss Cross centered on QR code (exact SIX dimensions)
  drawSwissCross(doc, qrX + QR_CODE_SIZE / 2, qrY + QR_CODE_SIZE / 2);
  
  // Text information (right of QR code)
  const infoX = paymentX + QR_CODE_SIZE + 5;
  let infoY = paymentY + 5;
  
  // Currency and Amount
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Währung", infoX, infoY);
  doc.text("Betrag", infoX + 25, infoY);
  
  infoY += 4;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.currency, infoX, infoY);
  doc.text(formatAmount(data.amount), infoX + 25, infoY);
  
  // Account / Payable to (below amount)
  infoY = qrY + QR_CODE_SIZE + 5;
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("Konto / Zahlbar an", paymentX, infoY);
  
  infoY += 3;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  // SIX-Spec: QR-IBAN must be displayed when referenceType is QRR
  const displayIbanPayment = (data.referenceType === "QRR" && data.qrIban) ? data.qrIban : data.iban;
  doc.text(formatIBAN(displayIbanPayment), paymentX, infoY);
  infoY += 3.5;
  doc.text(data.creditor.name, paymentX, infoY);
  infoY += 3.5;
  doc.text(data.creditor.street, paymentX, infoY);
  infoY += 3.5;
  doc.text(`${data.creditor.postalCode} ${data.creditor.city}`, paymentX, infoY);
  
  // Reference
  if (data.reference && data.referenceType !== "NON") {
    infoY += 5;
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("Referenz", paymentX, infoY);
    infoY += 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const formattedRef = data.referenceType === "QRR"
      ? formatQRReference(data.reference)
      : formatSCORReference(data.reference);
    doc.text(formattedRef, paymentX, infoY);
  }
  
  // Additional information
  if (data.additionalInfo) {
    infoY += 5;
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("Zusätzliche Informationen", paymentX, infoY);
    infoY += 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(data.additionalInfo.substring(0, 50), paymentX, infoY);
  }
  
  // Payable by (right column) – SIX-Spec: 80mm from left of payment part
  const debtorX = paymentX + 75; // 67+75 = 142mm, gives ~68mm width until 210mm
  let debtorY = qrY;
  
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("Zahlbar durch", debtorX, debtorY);
  
  if (data.debtor && data.debtor.name) {
    debtorY += 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(data.debtor.name, debtorX, debtorY);
    if (data.debtor.street) {
      debtorY += 3.5;
      doc.text(data.debtor.street, debtorX, debtorY);
    }
    if (data.debtor.postalCode && data.debtor.city) {
      debtorY += 3.5;
      doc.text(`${data.debtor.postalCode} ${data.debtor.city}`, debtorX, debtorY);
    }
  } else {
    // Empty box for handwriting
    debtorY += 3;
    doc.setDrawColor(0);
    doc.rect(debtorX, debtorY, 55, 25);
  }
  
  // Vertical separator line between receipt and payment part
  doc.setDrawColor(0);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(RECEIPT_WIDTH, perfY, RECEIPT_WIDTH, pageHeight);
  doc.setLineDashPattern([], 0);
  
  // Save PDF
  const filename = `QR-Rechnung_${data.invoiceNumber}.pdf`;
  doc.save(filename);
}

// ============================================
// Mod10 Recursive (SIX Swiss Payment Standard)
// ============================================

/**
 * Calculates the check digit using the recursive Mod10 algorithm
 * as specified by SIX Interbank Clearing.
 * 
 * Table: [0, 9, 4, 6, 8, 2, 7, 1, 3, 5]
 */
export function calculateMod10Recursive(numericString: string): number {
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
  let carry = 0;

  for (const char of numericString) {
    const digit = parseInt(char, 10);
    if (isNaN(digit)) {
      throw new Error(`Non-numeric character in QR reference base: "${char}"`);
    }
    carry = table[(carry + digit) % 10];
  }

  return (10 - carry) % 10;
}

/**
 * Generates a 27-digit QR Reference Number (QRR).
 * 26-digit numeric base + 1 check digit (recursive Mod10).
 */
export function generateQRReference(invoiceNumber: string): string {
  const numericOnly = invoiceNumber.replace(/\D/g, "");
  
  if (numericOnly.length === 0) {
    throw new Error("Invoice number must contain at least one digit");
  }
  
  const base = numericOnly.padStart(26, "0").substring(0, 26);
  const checkDigit = calculateMod10Recursive(base);
  
  return base + checkDigit.toString();
}

/**
 * Validates a QR Reference (QRR) per SIX standard.
 * - Exactly 27 numeric characters
 * - Last digit = recursive Mod10 check digit of first 26
 */
export function validateQRReference(reference: string): boolean {
  if (!reference) return false;
  
  const clean = reference.replace(/\s/g, "");
  
  if (clean.length !== 27) return false;
  if (!/^\d{27}$/.test(clean)) return false;
  
  const base = clean.substring(0, 26);
  const expectedCheckDigit = calculateMod10Recursive(base);
  const actualCheckDigit = parseInt(clean[26], 10);
  
  return expectedCheckDigit === actualCheckDigit;
}

// ============================================
// Utility: Validate Swiss QR-IBAN
// ============================================

export function isQRIBAN(iban: string): boolean {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  if (!clean.startsWith("CH") && !clean.startsWith("LI")) {
    return false;
  }
  
  const iid = parseInt(clean.substring(4, 9), 10);
  return iid >= 30000 && iid <= 31999;
}

/**
 * Determines reference type based on IBAN data.
 * QRR requires valid QR-IBAN + 27-digit numeric reference.
 */
export function determineReferenceType(
  iban?: string | null,
  qrIban?: string | null,
  reference?: string | null
): "QRR" | "SCOR" | "NON" {
  if (qrIban && isQRIBAN(qrIban) && reference) {
    const cleanRef = reference.replace(/\s/g, "");
    if (/^\d{27}$/.test(cleanRef)) {
      return "QRR";
    }
  }
  
  if (reference && reference.toUpperCase().startsWith("RF")) {
    return "SCOR";
  }
  
  return "NON";
}
