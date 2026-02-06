import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  TimeEntriesPDFData, 
  downloadTimeEntriesPDF, 
  getTimeEntriesPDFDataUrl 
} from "@/lib/pdf/time-entries";

interface TimeEntriesPDFPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfData: TimeEntriesPDFData | null;
}

export function TimeEntriesPDFPreview({ 
  open, 
  onOpenChange, 
  pdfData,
}: TimeEntriesPDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = async (newOpen: boolean) => {
    if (newOpen && pdfData) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const url = getTimeEntriesPDFDataUrl(pdfData);
        setPdfUrl(url);
      } catch (error) {
        console.error("PDF generation error:", error);
        toast.error("Fehler beim Erstellen der PDF-Vorschau");
      } finally {
        setIsLoading(false);
      }
    } else {
      setPdfUrl(null);
    }
    onOpenChange(newOpen);
  };

  const handleDownload = () => {
    if (!pdfData) return;
    try {
      downloadTimeEntriesPDF(pdfData);
      toast.success("PDF heruntergeladen");
    } catch (error) {
      toast.error("Fehler beim Download");
    }
  };

  const handlePrint = () => {
    if (!pdfUrl) return;
    const printWindow = window.open(pdfUrl);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Zeiterfassungsbericht</DialogTitle>
              <DialogDescription>
                PDF-Vorschau der Zeiteinträge
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} disabled={!pdfUrl}>
                <Printer className="h-4 w-4 mr-2" />
                Drucken
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={!pdfData}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-muted/30">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">PDF wird erstellt...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Keine Vorschau verfügbar</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
