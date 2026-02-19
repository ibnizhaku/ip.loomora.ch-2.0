import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  SalesDocumentData, 
  downloadSalesDocumentPDF, 
  getSalesDocumentPDFDataUrl,
  getSalesDocumentPDFBlobUrl,
} from "@/lib/pdf/sales-document";

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentData: SalesDocumentData | null;
  title?: string;
  onSendEmail?: () => void;
  customPdfUrlGenerator?: () => Promise<string>;
}

const documentTypeLabels: Record<string, string> = {
  'quote': 'Angebot',
  'order': 'Auftrag',
  'invoice': 'Rechnung',
  'delivery-note': 'Lieferschein',
  'credit-note': 'Gutschrift',
};

export function PDFPreviewDialog({ 
  open, 
  onOpenChange, 
  documentData,
  title,
  onSendEmail,
  customPdfUrlGenerator,
}: PDFPreviewDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate PDF when dialog opens (either via prop or internal change)
  useEffect(() => {
    if (open && (documentData || customPdfUrlGenerator)) {
      setIsLoading(true);
      const generate = async () => {
        try {
          if (customPdfUrlGenerator) {
            const url = await customPdfUrlGenerator();
            setPdfUrl(url);
          } else if (documentData) {
            const url = getSalesDocumentPDFDataUrl(documentData);
            setPdfUrl(url);
          }
        } catch (error) {
          console.error("PDF generation error:", error);
          toast.error("Fehler beim Erstellen der PDF-Vorschau");
        } finally {
          setIsLoading(false);
        }
      };
      generate();
    } else if (!open) {
      setPdfUrl(null);
    }
  }, [open, documentData, customPdfUrlGenerator]);

  const handleDownload = () => {
    if (!documentData) return;
    try {
      downloadSalesDocumentPDF(documentData);
      toast.success("PDF heruntergeladen");
    } catch (error) {
      toast.error("Fehler beim Download");
    }
  };

  const handlePrint = () => {
    if (!documentData) return;
    const blobUrl = getSalesDocumentPDFBlobUrl(documentData);
    const printWindow = window.open(blobUrl);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
      };
    } else {
      URL.revokeObjectURL(blobUrl);
      toast.error("Popup wurde blockiert. Bitte Popup-Blocker deaktivieren.");
    }
  };

  const handleEmail = () => {
    if (onSendEmail) {
      onOpenChange(false);
      onSendEmail();
    } else {
      toast.info("E-Mail-Versand wird vorbereitet...");
    }
  };

  const typeLabel = documentData ? documentTypeLabels[documentData.type] || 'Dokument' : 'Dokument';
  const displayTitle = title || `${typeLabel} ${documentData?.number || ''}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{displayTitle}</DialogTitle>
              <DialogDescription>
                PDF-Vorschau - Klicken Sie auf Download um das Dokument zu speichern
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Per E-Mail
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} disabled={!pdfUrl}>
                <Printer className="h-4 w-4 mr-2" />
                Drucken
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={!documentData}>
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
