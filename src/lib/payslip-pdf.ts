import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PayslipPdfData {
  employeeName: string;
  position: string;
  ahvNumber?: string;
  period: string;
  periodStart?: string;
  periodEnd?: string;
  grossSalary: number;
  netSalary: number;
  earnings?: { description: string; amount: number }[];
  deductions?: { description: string; amount: number; rate?: number | null }[];
  employerName?: string;
  employerAddress?: string;
  bankAccount?: { iban: string; bank?: string };
}

function fmtCHF(v: number) {
  return `CHF ${v.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

export function generatePayslipPdf(data: PayslipPdfData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "A4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header - Arbeitgeber
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.employerName || "Lohnabrechnung", margin, 25);

  if (data.employerAddress) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(data.employerAddress, margin, 31);
  }

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Lohnabrechnung", margin, 45);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Periode: ${data.period}`, margin, 52);
  doc.text(`${fmtDate(data.periodStart)} — ${fmtDate(data.periodEnd)}`, margin, 58);

  // Mitarbeiter-Info
  doc.setDrawColor(200);
  doc.line(margin, 64, pageWidth - margin, 64);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Mitarbeiter", margin, 72);
  doc.setFont("helvetica", "normal");
  doc.text(data.employeeName, margin + 40, 72);

  doc.setFont("helvetica", "bold");
  doc.text("Position", margin, 78);
  doc.setFont("helvetica", "normal");
  doc.text(data.position, margin + 40, 78);

  if (data.ahvNumber) {
    doc.setFont("helvetica", "bold");
    doc.text("AHV-Nr.", margin, 84);
    doc.setFont("helvetica", "normal");
    doc.text(data.ahvNumber, margin + 40, 84);
  }

  let yPos = data.ahvNumber ? 92 : 86;

  // Earnings table
  const earnings = data.earnings?.length
    ? data.earnings
    : [{ description: "Grundlohn", amount: data.grossSalary }];

  doc.setDrawColor(200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 4;

  autoTable(doc, {
    startY: yPos,
    head: [["Lohnart", "Betrag"]],
    body: earnings.map((e) => [e.description, fmtCHF(e.amount)]),
    foot: [["Bruttolohn", fmtCHF(data.grossSalary)]],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [60, 60, 60], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
    theme: "grid",
  });

  yPos = (doc as any).lastAutoTable.finalY + 6;

  // Deductions table
  const deductionItems = data.deductions?.length
    ? data.deductions
    : [
        { description: "AHV / IV / EO (5.3%)", amount: data.grossSalary * 0.053 },
        { description: "ALV (1.1%)", amount: data.grossSalary * 0.011 },
        { description: "NBU (1.227%)", amount: data.grossSalary * 0.01227 },
        { description: "BVG", amount: data.grossSalary * 0.075 },
      ];

  const totalDeductions = deductionItems.reduce((sum, d) => sum + d.amount, 0);

  autoTable(doc, {
    startY: yPos,
    head: [["Abzug", "Betrag"]],
    body: deductionItems.map((d) => [
      d.description + (d.rate ? ` (${d.rate}%)` : ""),
      `- ${fmtCHF(d.amount)}`,
    ]),
    foot: [["Total Abzüge", `- ${fmtCHF(totalDeductions)}`]],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [180, 40, 40], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [255, 230, 230], textColor: [180, 40, 40], fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
    theme: "grid",
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Nettolohn
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 14, 2, 2, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Nettolohn (Auszahlung)", margin + 4, yPos + 9);
  doc.text(fmtCHF(data.netSalary), pageWidth - margin - 4, yPos + 9, { align: "right" });

  yPos += 22;

  // Bank info
  if (data.bankAccount?.iban) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Auszahlung auf:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`IBAN: ${data.bankAccount.iban}`, margin, yPos + 5);
    if (data.bankAccount.bank) {
      doc.text(`Bank: ${data.bankAccount.bank}`, margin, yPos + 10);
    }
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Erstellt am ${new Date().toLocaleDateString("de-CH")} — Diese Lohnabrechnung ist maschinell erstellt und ohne Unterschrift gültig.`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  const fileName = `Lohnabrechnung_${data.employeeName.replace(/\s+/g, "_")}_${data.period}.pdf`;
  doc.save(fileName);
}
