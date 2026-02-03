import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Calendar,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReportDetailDialogProps {
  report: {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    lastGenerated: string;
    type: string;
  };
  year: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const exportFormats = [
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "excel", label: "Excel", icon: FileSpreadsheet },
  { id: "csv", label: "CSV", icon: File },
];

// Mock report data based on type
const getReportPreviewData = (type: string, year: string) => {
  const baseData = {
    financial: {
      summary: "Finanzübersicht",
      metrics: [
        { label: "Gesamtumsatz", value: `CHF ${year === "2024" ? "584'250" : year === "2023" ? "512'800" : "445'320"}` },
        { label: "Ausgaben", value: `CHF ${year === "2024" ? "342'180" : year === "2023" ? "298'450" : "267'890"}` },
        { label: "Gewinn", value: `CHF ${year === "2024" ? "242'070" : year === "2023" ? "214'350" : "177'430"}` },
      ],
    },
    project: {
      summary: "Projektstatistik",
      metrics: [
        { label: "Aktive Projekte", value: year === "2024" ? "12" : year === "2023" ? "9" : "7" },
        { label: "Abgeschlossene Projekte", value: year === "2024" ? "47" : year === "2023" ? "38" : "32" },
        { label: "Erfolgsquote", value: year === "2024" ? "94%" : year === "2023" ? "91%" : "88%" },
      ],
    },
    time: {
      summary: "Zeiterfassung",
      metrics: [
        { label: "Erfasste Stunden", value: year === "2024" ? "8'450" : year === "2023" ? "7'820" : "7'120" },
        { label: "Durchschnitt/Tag", value: year === "2024" ? "7.2h" : year === "2023" ? "6.9h" : "6.5h" },
        { label: "Auslastung", value: year === "2024" ? "87%" : year === "2023" ? "82%" : "78%" },
      ],
    },
    customer: {
      summary: "Kundenübersicht",
      metrics: [
        { label: "Neue Kunden", value: year === "2024" ? "23" : year === "2023" ? "18" : "14" },
        { label: "Aktive Kunden", value: year === "2024" ? "89" : year === "2023" ? "76" : "62" },
        { label: "Kundenzufriedenheit", value: year === "2024" ? "4.8/5" : year === "2023" ? "4.6/5" : "4.4/5" },
      ],
    },
    performance: {
      summary: "Leistungskennzahlen",
      metrics: [
        { label: "Team-Effizienz", value: year === "2024" ? "92%" : year === "2023" ? "88%" : "84%" },
        { label: "Projektabschlussrate", value: year === "2024" ? "96%" : year === "2023" ? "93%" : "90%" },
        { label: "Durchlaufzeit", value: year === "2024" ? "18 Tage" : year === "2023" ? "21 Tage" : "24 Tage" },
      ],
    },
    inventory: {
      summary: "Lagerbestand",
      metrics: [
        { label: "Artikelanzahl", value: year === "2024" ? "1'245" : year === "2023" ? "1'089" : "956" },
        { label: "Lagerwert", value: `CHF ${year === "2024" ? "234'560" : year === "2023" ? "198'340" : "167'890"}` },
        { label: "Umschlagshäufigkeit", value: year === "2024" ? "8.2x" : year === "2023" ? "7.5x" : "6.8x" },
      ],
    },
  };
  return baseData[type as keyof typeof baseData] || baseData.financial;
};

export function ReportDetailDialog({
  report,
  year,
  open,
  onOpenChange,
}: ReportDetailDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [dateFrom, setDateFrom] = useState<Date>(new Date(parseInt(year), 0, 1));
  const [dateTo, setDateTo] = useState<Date>(new Date(parseInt(year), 11, 31));
  const [isGenerating, setIsGenerating] = useState(false);

  const previewData = getReportPreviewData(report.type, year);
  const ReportIcon = report.icon;

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const formatLabel = exportFormats.find((f) => f.id === selectedFormat)?.label || selectedFormat;
    toast.success(`${report.title} als ${formatLabel} generiert`, {
      description: `Zeitraum: ${format(dateFrom, "dd.MM.yyyy")} - ${format(dateTo, "dd.MM.yyyy")}`,
    });
    
    setIsGenerating(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ReportIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{report.title}</DialogTitle>
              <DialogDescription>{report.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Vorschau - {previewData.summary}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {previewData.metrics.map((metric) => (
                <div key={metric.label} className="text-center">
                  <p className="text-lg font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Zeitraum</Label>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(dateFrom, "dd.MM.yyyy", { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => date && setDateFrom(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">bis</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(dateTo, "dd.MM.yyyy", { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => date && setDateTo(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Format</Label>
            <RadioGroup
              value={selectedFormat}
              onValueChange={setSelectedFormat}
              className="flex gap-3"
            >
              {exportFormats.map((fmt) => (
                <Label
                  key={fmt.id}
                  htmlFor={`format-${fmt.id}`}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedFormat === fmt.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={fmt.id} id={`format-${fmt.id}`} className="sr-only" />
                  <fmt.icon
                    className={cn(
                      "h-4 w-4",
                      selectedFormat === fmt.id ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span className="text-sm font-medium">{fmt.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generieren...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Bericht generieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
