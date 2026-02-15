import { useState } from "react";
import { Copy, Check, Download, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codes: string[];
}

export default function RecoveryCodesDialog({ open, onOpenChange, codes }: Props) {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    toast.success("Recovery Codes kopiert");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Loomora – Recovery Codes", 20, 25);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("Bewahren Sie diese Codes sicher auf. Jeder Code kann nur einmal verwendet werden.", 20, 35);
    doc.text("Datum: " + new Date().toLocaleDateString("de-CH"), 20, 45);

    doc.setFontSize(14);
    doc.setTextColor(0);
    codes.forEach((code, i) => {
      doc.text(`${i + 1}.  ${code}`, 30, 60 + i * 10);
    });

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("loomora.ch – Dieses Dokument vertraulich behandeln.", 20, 155);

    doc.save("loomora-recovery-codes.pdf");
    toast.success("PDF heruntergeladen");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-warning" />
            Recovery Codes
          </DialogTitle>
          <DialogDescription>
            Speichern Sie diese Codes sicher ab. Sie können damit Ihr Konto
            entsperren, falls Sie keinen Zugriff auf Ihre Authenticator-App haben.
            Jeder Code ist nur einmal gültig.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 p-4 bg-muted/50 rounded-lg border">
          {codes.map((code, i) => (
            <code key={i} className="font-mono text-sm py-1.5 px-3 bg-background rounded text-center">
              {code}
            </code>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={copyAll}>
            {copied ? <Check className="mr-2 h-4 w-4 text-success" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Kopiert" : "Kopieren"}
          </Button>
          <Button variant="outline" className="flex-1" onClick={downloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            PDF herunterladen
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Ich habe die Codes gespeichert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
