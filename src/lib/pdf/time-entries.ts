/**
 * Time Entries PDF Generator
 * For employee time tracking reports with approval status
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface TimeEntryForPDF {
  id: string;
  date: string;
  project: string;
  task: string;
  duration: number; // in minutes
  approvalStatus: ApprovalStatus;
  employeeName?: string;
  notes?: string;
}

export interface TimeEntriesPDFData {
  title: string;
  subtitle?: string;
  dateRange: {
    start: string;
    end: string;
  };
  entries: TimeEntryForPDF[];
  totalMinutes: number;
  approvedMinutes: number;
  pendingMinutes: number;
  rejectedMinutes: number;
  company?: {
    name: string;
    address?: string;
  };
  generatedBy?: string;
  showEmployee?: boolean;
}

const statusLabels: Record<ApprovalStatus, string> = {
  pending: 'Ausstehend',
  approved: 'Genehmigt',
  rejected: 'Abgelehnt',
};

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}

function formatHours(minutes: number): string {
  return (minutes / 60).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return format(date, 'd. MMM yyyy', { locale: de });
  } catch {
    return dateStr;
  }
}

export function generateTimeEntriesPDF(data: TimeEntriesPDFData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 20;
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.title, margin, yPos);

  if (data.company?.name) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(data.company.name, pageWidth - margin, yPos, { align: "right" });
    if (data.company.address) {
      doc.text(data.company.address, pageWidth - margin, yPos + 5, { align: "right" });
    }
  }

  yPos += 10;
  if (data.subtitle) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(data.subtitle, margin, yPos);
    yPos += 6;
  }

  // Date Range
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(
    `Zeitraum: ${formatDate(data.dateRange.start)} - ${formatDate(data.dateRange.end)}`,
    margin,
    yPos
  );
  yPos += 5;
  doc.text(
    `Erstellt am: ${format(new Date(), 'd. MMMM yyyy, HH:mm', { locale: de })} Uhr`,
    margin,
    yPos
  );
  if (data.generatedBy) {
    yPos += 5;
    doc.text(`Erstellt von: ${data.generatedBy}`, margin, yPos);
  }

  // Summary Cards
  yPos += 12;
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Zusammenfassung", margin, yPos);

  yPos += 8;
  const summaryBoxWidth = 40;
  const summaryGap = 5;

  // Total Hours
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, yPos, summaryBoxWidth, 20, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Gesamt", margin + 3, yPos + 6);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`${formatHours(data.totalMinutes)}h`, margin + 3, yPos + 15);

  // Approved Hours
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(margin + summaryBoxWidth + summaryGap, yPos, summaryBoxWidth, 20, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Genehmigt", margin + summaryBoxWidth + summaryGap + 3, yPos + 6);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 163, 74);
  doc.text(`${formatHours(data.approvedMinutes)}h`, margin + summaryBoxWidth + summaryGap + 3, yPos + 15);

  // Pending Hours
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(margin + 2 * (summaryBoxWidth + summaryGap), yPos, summaryBoxWidth, 20, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Ausstehend", margin + 2 * (summaryBoxWidth + summaryGap) + 3, yPos + 6);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(202, 138, 4);
  doc.text(`${formatHours(data.pendingMinutes)}h`, margin + 2 * (summaryBoxWidth + summaryGap) + 3, yPos + 15);

  // Rejected Hours
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(margin + 3 * (summaryBoxWidth + summaryGap), yPos, summaryBoxWidth, 20, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Abgelehnt", margin + 3 * (summaryBoxWidth + summaryGap) + 3, yPos + 6);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38);
  doc.text(`${formatHours(data.rejectedMinutes)}h`, margin + 3 * (summaryBoxWidth + summaryGap) + 3, yPos + 15);

  // Entries Table
  yPos += 30;
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Zeiteinträge", margin, yPos);
  yPos += 5;

  // Build table headers and data
  const headers = data.showEmployee
    ? [["Datum", "Mitarbeiter", "Projekt", "Aufgabe", "Dauer", "Status"]]
    : [["Datum", "Projekt", "Aufgabe", "Dauer", "Status"]];

  const tableData = data.entries.map((entry) => {
    const statusColor = entry.approvalStatus === 'approved' 
      ? 'Genehmigt' 
      : entry.approvalStatus === 'rejected' 
        ? 'Abgelehnt' 
        : 'Ausstehend';

    if (data.showEmployee) {
      return [
        formatDate(entry.date),
        entry.employeeName || '-',
        entry.project,
        entry.task,
        formatDuration(entry.duration),
        statusColor,
      ];
    }
    return [
      formatDate(entry.date),
      entry.project,
      entry.task,
      formatDuration(entry.duration),
      statusColor,
    ];
  });

  const columnStyles: Record<number, { cellWidth?: number; halign?: 'left' | 'center' | 'right' }> = data.showEmployee
    ? {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 22 },
      }
    : {
        0: { cellWidth: 28 },
        1: { cellWidth: 45 },
        2: { cellWidth: 50 },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 25 },
      };

  autoTable(doc, {
    startY: yPos,
    head: headers,
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [50, 50, 50],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles,
    margin: { left: margin, right: margin },
    styles: {
      cellPadding: 2,
      overflow: 'ellipsize',
    },
    didParseCell: (data) => {
      // Color code status column
      const statusColIndex = data.table.columns.length - 1;
      if (data.section === 'body' && data.column.index === statusColIndex) {
        const status = data.cell.raw as string;
        if (status === 'Genehmigt') {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'Abgelehnt') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [202, 138, 4];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Seite ${i} von ${pageCount}`,
      pageWidth / 2,
      287,
      { align: 'center' }
    );
    if (data.company?.name) {
      doc.text(
        data.company.name,
        margin,
        287
      );
    }
  }

  return doc;
}

export function downloadTimeEntriesPDF(data: TimeEntriesPDFData, filename?: string): void {
  const doc = generateTimeEntriesPDF(data);
  const defaultFilename = `Zeiterfassung_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename || defaultFilename);
}

export function getTimeEntriesPDFDataUrl(data: TimeEntriesPDFData): string {
  const doc = generateTimeEntriesPDF(data);
  return doc.output('dataurlstring');
}
