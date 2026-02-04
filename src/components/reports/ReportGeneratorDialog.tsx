import { useState } from "react";
import { Download, FileText, Loader2, FileSpreadsheet, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  useGenerateReport, 
  type ReportType, 
  type ReportFormat, 
  type ReportPeriod,
  type AvailableReport 
} from "@/hooks/use-reports";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportGeneratorDialogProps {
  report: AvailableReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const months = [
  { value: "1", label: "Januar" },
  { value: "2", label: "Februar" },
  { value: "3", label: "März" },
  { value: "4", label: "April" },
  { value: "5", label: "Mai" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Dezember" },
];

const quarters = [
  { value: "1", label: "Q1 (Jan-Mär)" },
  { value: "2", label: "Q2 (Apr-Jun)" },
  { value: "3", label: "Q3 (Jul-Sep)" },
  { value: "4", label: "Q4 (Okt-Dez)" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export function ReportGeneratorDialog({ report, open, onOpenChange }: ReportGeneratorDialogProps) {
  const [year, setYear] = useState(String(currentYear));
  const [period, setPeriod] = useState<ReportPeriod>("YEARLY");
  const [month, setMonth] = useState<string>("");
  const [quarter, setQuarter] = useState<string>("");
  const [format, setFormat] = useState<ReportFormat>("PDF");
  const [includeDetails, setIncludeDetails] = useState(false);
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);

  const generateReport = useGenerateReport();

  const handleGenerate = async () => {
    try {
      const params = {
        type: report.type,
        year: parseInt(year),
        period,
        month: period === "MONTHLY" && month ? parseInt(month) : undefined,
        quarter: period === "QUARTERLY" && quarter ? parseInt(quarter) : undefined,
        format,
        includeDetails,
        compareWithPrevious,
      };

      const data = await generateReport.mutateAsync(params);

      if (format === "PDF") {
        generatePDF(data, report.name);
      } else if (format === "CSV") {
        downloadCSV(data, report.name);
      } else {
        downloadJSON(data, report.name);
      }

      toast.success(`${report.name} erfolgreich erstellt`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Erstellen des Berichts");
      console.error(error);
    }
  };

  const generatePDF = (data: any, title: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(title, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generiert am: ${new Date().toLocaleDateString("de-CH")}`, 14, 30);
    doc.text(`Periode: ${getPeriodLabel()}`, 14, 36);
    
    // Content based on report type
    let yPos = 50;
    
    if (data.metadata) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Firma: ${data.metadata.companyName || "Loomora Metallbau AG"}`, 14, yPos);
      yPos += 10;
    }

    // Convert data to table
    if (data.summary) {
      const summaryData = Object.entries(data.summary).map(([key, value]) => [
        formatKey(key),
        formatValue(value),
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [["Kennzahl", "Wert"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    // Save
    const filename = `${report.type.toLowerCase()}_${year}${period === "MONTHLY" && month ? `_${month}` : ""}.pdf`;
    doc.save(filename);
  };

  const downloadCSV = (data: any, title: string) => {
    const rows: string[] = [];
    
    // Header
    rows.push(`"${title}"`);
    rows.push(`"Generiert: ${new Date().toLocaleDateString("de-CH")}"`);
    rows.push("");
    
    // Summary
    if (data.summary) {
      rows.push('"Zusammenfassung"');
      Object.entries(data.summary).forEach(([key, value]) => {
        rows.push(`"${formatKey(key)}";"${formatValue(value)}"`);
      });
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.type.toLowerCase()}_${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = (data: any, title: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.type.toLowerCase()}_${year}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatKey = (key: string): string => {
    const labels: Record<string, string> = {
      totalEmployees: "Anzahl Mitarbeiter",
      totalGrossSalary: "Bruttolohn Total",
      totalNetSalary: "Nettolohn Total",
      totalDeductions: "Abzüge Total",
      totalEmployerCosts: "Arbeitgeberkosten Total",
      totalRevenue: "Umsatz Total",
      totalCosts: "Kosten Total",
      totalProfit: "Gewinn Total",
      averageMargin: "Durchschn. Marge",
      compliant: "Konform",
      nonCompliant: "Nicht konform",
      complianceRate: "Compliance-Rate",
      grossProfit: "Bruttogewinn",
      operatingProfit: "Betriebsgewinn",
      netProfit: "Reingewinn",
    };
    return labels[key] || key.replace(/([A-Z])/g, " $1").trim();
  };

  const formatValue = (value: any): string => {
    if (typeof value === "number") {
      if (value > 1000) {
        return `CHF ${value.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;
      }
      if (value < 1 && value > 0) {
        return `${(value * 100).toFixed(1)}%`;
      }
      return value.toLocaleString("de-CH");
    }
    return String(value);
  };

  const getPeriodLabel = (): string => {
    if (period === "MONTHLY" && month) {
      return `${months.find(m => m.value === month)?.label} ${year}`;
    }
    if (period === "QUARTERLY" && quarter) {
      return `${quarters.find(q => q.value === quarter)?.label} ${year}`;
    }
    return `Jahr ${year}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {report.name}
          </DialogTitle>
          <DialogDescription>{report.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Period Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Zeitraum</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YEARLY">Jährlich</SelectItem>
                <SelectItem value="QUARTERLY">Quartalsweise</SelectItem>
                <SelectItem value="MONTHLY">Monatlich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Jahr</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month (if monthly) */}
          {period === "MONTHLY" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Monat</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Monat wählen" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quarter (if quarterly) */}
          {period === "QUARTERLY" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Quartal</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Quartal wählen" />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((q) => (
                    <SelectItem key={q.value} value={q.value}>
                      {q.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Format */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </div>
                </SelectItem>
                <SelectItem value="CSV">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel)
                  </div>
                </SelectItem>
                <SelectItem value="JSON">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Details einbeziehen</Label>
                <p className="text-xs text-muted-foreground">
                  Einzelne Positionen und Transaktionen anzeigen
                </p>
              </div>
              <Switch checked={includeDetails} onCheckedChange={setIncludeDetails} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Vorjahresvergleich</Label>
                <p className="text-xs text-muted-foreground">
                  Mit Vorjahresperiode vergleichen
                </p>
              </div>
              <Switch checked={compareWithPrevious} onCheckedChange={setCompareWithPrevious} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleGenerate} disabled={generateReport.isPending}>
            {generateReport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
