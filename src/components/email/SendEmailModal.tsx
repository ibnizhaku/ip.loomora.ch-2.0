import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, AlertTriangle, Settings, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEmailAccount } from "@/hooks/use-email-account";
import { api } from "@/lib/api";
import { SalesDocumentData, getSalesDocumentPDFBase64 } from "@/lib/pdf/sales-document";

export type DocumentType =
  | "invoice"
  | "quote"
  | "delivery-note"
  | "reminder"
  | "credit-note"
  | "order";

interface SendEmailModalProps {
  open: boolean;
  onClose: () => void;
  documentType: DocumentType;
  documentId: string;
  documentNumber?: string;
  defaultRecipient?: string;
  companyName?: string;
  documentData?: SalesDocumentData; // Frontend-PDF Daten für identischen Anhang wie Vorschau
}

const documentTypeLabels: Record<DocumentType, string> = {
  invoice: "Rechnung",
  quote: "Angebot",
  "delivery-note": "Lieferschein",
  reminder: "Zahlungserinnerung",
  "credit-note": "Gutschrift",
  order: "Auftragsbestätigung",
};

function getSubject(type: DocumentType, number?: string, company?: string): string {
  const num = number ? ` ${number}` : "";
  const from = company ? ` von ${company}` : "";
  switch (type) {
    case "invoice":       return `Rechnung${num}${from}`;
    case "quote":         return `Angebot${num}${from}`;
    case "delivery-note": return `Lieferschein${num}${from}`;
    case "reminder":      return `Zahlungserinnerung${num}${from}`;
    case "credit-note":   return `Gutschrift${num}${from}`;
    case "order":         return `Auftragsbestätigung${num}${from}`;
  }
}

function getDefaultMessage(type: DocumentType, number?: string, company?: string): string {
  const doc = getSubject(type, number, company);
  return `Sehr geehrte Damen und Herren,\n\nanbei erhalten Sie ${doc} als PDF-Anhang.\n\nFür Rückfragen stehen wir Ihnen gerne zur Verfügung.\n\nMit freundlichen Grüssen\n${company ?? ""}`.trim();
}

export function SendEmailModal({
  open,
  onClose,
  documentType,
  documentId,
  documentNumber,
  defaultRecipient,
  companyName,
  documentData,
}: SendEmailModalProps) {
  const navigate = useNavigate();
  const { hasEmailAccount, fromEmail, fromName, isLoading } = useEmailAccount();

  const [to, setTo] = useState(defaultRecipient ?? "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(getSubject(documentType, documentNumber, companyName));
  const [message, setMessage] = useState(getDefaultMessage(documentType, documentNumber, companyName));

  // Reset fields when modal reopens
  useEffect(() => {
    if (open) {
      setTo(defaultRecipient ?? "");
      setCc("");
      setBcc("");
      setSubject(getSubject(documentType, documentNumber, companyName));
      setMessage(getDefaultMessage(documentType, documentNumber, companyName));
    }
  }, [open, defaultRecipient, documentType, documentNumber, companyName]);

  // Generiere Dateiname für den Anhang
  const getPdfFilename = () => {
    const label = documentTypeLabels[documentType] || "Dokument";
    const num = documentNumber || documentId;
    return `${label}-${num}.pdf`;
  };

  const sendMutation = useMutation({
    mutationFn: () => {
      // Falls documentData vorhanden: Frontend-PDF als Base64 generieren (identisch mit Vorschau)
      let pdfBase64: string | undefined;
      let pdfFilename: string | undefined;
      if (documentData) {
        try {
          pdfBase64 = getSalesDocumentPDFBase64(documentData);
          pdfFilename = getPdfFilename();
        } catch (err) {
          console.warn("PDF Base64-Generierung fehlgeschlagen:", err);
        }
      }

      return api.post<{ success: boolean; message: string }>('/mail/send', {
        to: to.trim(),
        cc: cc.trim() || undefined,
        bcc: bcc.trim() || undefined,
        subject,
        message,
        documentType,
        documentId,
        pdfBase64,
        pdfFilename,
      });
    },
    onSuccess: () => {
      toast.success("E-Mail erfolgreich versendet");
      onClose();
    },
    onError: (err: Error & { statusCode?: number }) => {
      if (err.statusCode === 403) {
        toast.error("Keine Berechtigung zum Versenden von E-Mails");
      } else {
        toast.error(err.message || "E-Mail konnte nicht versendet werden");
      }
    },
  });

  const handleSend = () => {
    if (!to.trim()) return;
    sendMutation.mutate();
  };

  if (isLoading) return null;

  // State A: No mail account configured
  if (!hasEmailAccount) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Kein E-Mail-Konto konfiguriert
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Sie haben noch kein E-Mail-Konto konfiguriert. Bitte gehen Sie zu{" "}
              <strong>Einstellungen → E-Mail</strong>, um Ihr SMTP-Konto einzurichten.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                onClose();
                navigate("/settings");
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Zu Einstellungen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // State B: Mail account present
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            E-Mail senden
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Von */}
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <Label className="text-right text-muted-foreground">Von</Label>
            <Input
              value={fromName ? `${fromName} <${fromEmail}>` : fromEmail}
              readOnly
              className="bg-muted/50 text-muted-foreground cursor-default"
            />
          </div>

          {/* An */}
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <Label htmlFor="email-to" className="text-right">An *</Label>
            <Input
              id="email-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="empfaenger@example.com"
            />
          </div>

          {/* CC */}
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <Label htmlFor="email-cc" className="text-right text-muted-foreground">CC</Label>
            <Input
              id="email-cc"
              type="email"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="optional"
            />
          </div>

          {/* BCC */}
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <Label htmlFor="email-bcc" className="text-right text-muted-foreground">BCC</Label>
            <Input
              id="email-bcc"
              type="email"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="optional"
            />
          </div>

          {/* Betreff */}
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <Label htmlFor="email-subject" className="text-right">Betreff</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Nachricht */}
          <div className="grid grid-cols-[80px_1fr] items-start gap-3">
            <Label htmlFor="email-message" className="text-right mt-2 text-muted-foreground">
              Nachricht
            </Label>
            <Textarea
              id="email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          {/* PDF-Anhang Info */}
          {(documentData || (documentId && documentType)) && (
            <div className="flex items-center gap-2 pl-[92px] text-xs text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5" />
              <span>
                {documentData
                  ? `${getPdfFilename()} wird als Anhang beigefügt`
                  : "Das Dokument wird automatisch als PDF-Anhang beigefügt"}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSend} disabled={!to.trim() || sendMutation.isPending}>
            <Send className="h-4 w-4 mr-2" />
            {sendMutation.isPending ? "Wird gesendet..." : "Senden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
