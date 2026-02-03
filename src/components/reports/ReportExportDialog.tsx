import { useState } from "react";
import { Download, FileText, FileSpreadsheet, File, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReportExportDialogProps {
  year: string;
  trigger?: React.ReactNode;
}

const exportFormats = [
  { id: "pdf", label: "PDF", description: "Druckoptimiertes Format", icon: FileText },
  { id: "excel", label: "Excel (.xlsx)", description: "Bearbeitbare Tabelle", icon: FileSpreadsheet },
  { id: "csv", label: "CSV", description: "Kommagetrennte Werte", icon: File },
];

const availableReports = [
  { id: "revenue", label: "Umsatzbericht" },
  { id: "projects", label: "Projektübersicht" },
  { id: "time", label: "Zeiterfassungsbericht" },
  { id: "customers", label: "Kundenbericht" },
  { id: "performance", label: "Leistungsanalyse" },
  { id: "inventory", label: "Lagerbericht" },
];

export function ReportExportDialog({ year, trigger }: ReportExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState("pdf");
  const [selectedReports, setSelectedReports] = useState<string[]>(availableReports.map(r => r.id));
  const [isExporting, setIsExporting] = useState(false);

  const toggleReport = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const selectAll = () => {
    setSelectedReports(availableReports.map(r => r.id));
  };

  const deselectAll = () => {
    setSelectedReports([]);
  };

  const handleExport = async () => {
    if (selectedReports.length === 0) {
      toast.error("Bitte wählen Sie mindestens einen Bericht aus");
      return;
    }

    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const formatLabel = exportFormats.find(f => f.id === format)?.label || format;
    toast.success(
      `${selectedReports.length} Bericht(e) als ${formatLabel} exportiert`,
      { description: `Geschäftsjahr ${year}` }
    );
    
    setIsExporting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportieren
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Berichte exportieren</DialogTitle>
          <DialogDescription>
            Exportieren Sie Ihre Berichte für das Jahr {year}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Exportformat</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="grid grid-cols-3 gap-3">
              {exportFormats.map((fmt) => (
                <Label
                  key={fmt.id}
                  htmlFor={fmt.id}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all",
                    format === fmt.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={fmt.id} id={fmt.id} className="sr-only" />
                  <fmt.icon className={cn(
                    "h-6 w-6",
                    format === fmt.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium">{fmt.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Report Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Berichte auswählen</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>
                  Alle
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={deselectAll}>
                  Keine
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableReports.map((report) => (
                <div
                  key={report.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedReports.includes(report.id)
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                  onClick={() => toggleReport(report.id)}
                >
                  <Checkbox
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={() => toggleReport(report.id)}
                  />
                  <span className="text-sm">{report.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {selectedReports.length} Bericht(e) für {year} ausgewählt
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedReports.length === 0}>
            {isExporting ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-bounce" />
                Exportieren...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
