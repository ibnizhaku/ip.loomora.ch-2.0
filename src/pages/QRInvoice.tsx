import { useState } from "react";
import {
  Plus,
  Search,
  QrCode,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Eye,
  Copy,
  Printer,
  MoreHorizontal,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  generateSwissQRInvoicePDF, 
  generateQRReference,
  type QRInvoiceData 
} from "@/lib/pdf/swiss-qr-invoice";

interface QRInvoiceListItem {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  currency: "CHF" | "EUR";
  iban: string;
  reference: string;
  referenceType: "QRR" | "SCOR" | "NON";
  status: "draft" | "generated" | "sent" | "paid";
  dueDate: string;
  createdAt: string;
  qrGenerated: boolean;
}

const qrInvoices: QRInvoiceListItem[] = [
  {
    id: "1",
    invoiceNumber: "RE-2024-0156",
    customer: "Bauherr AG",
    amount: 31970,
    currency: "CHF",
    iban: "CH93 0076 2011 6238 5295 7",
    reference: generateQRReference("RE-2024-0156"),
    referenceType: "QRR",
    status: "sent",
    dueDate: "28.02.2024",
    createdAt: "29.01.2024",
    qrGenerated: true,
  },
  {
    id: "2",
    invoiceNumber: "RE-2024-0157",
    customer: "Immobilien Müller",
    amount: 8760,
    currency: "CHF",
    iban: "CH93 0076 2011 6238 5295 7",
    reference: generateQRReference("RE-2024-0157"),
    referenceType: "QRR",
    status: "paid",
    dueDate: "15.02.2024",
    createdAt: "25.01.2024",
    qrGenerated: true,
  },
  {
    id: "3",
    invoiceNumber: "RE-2024-0158",
    customer: "Logistik Center Zürich",
    amount: 15700,
    currency: "CHF",
    iban: "CH93 0076 2011 6238 5295 7",
    reference: generateQRReference("RE-2024-0158"),
    referenceType: "QRR",
    status: "generated",
    dueDate: "10.03.2024",
    createdAt: "30.01.2024",
    qrGenerated: true,
  },
  {
    id: "4",
    invoiceNumber: "RE-2024-0159",
    customer: "Privat Schneider",
    amount: 4250,
    currency: "CHF",
    iban: "CH93 0076 2011 6238 5295 7",
    reference: "",
    referenceType: "NON",
    status: "draft",
    dueDate: "15.03.2024",
    createdAt: "31.01.2024",
    qrGenerated: false,
  },
];

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  generated: "bg-info/10 text-info",
  sent: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
};

const statusLabels = {
  draft: "Entwurf",
  generated: "QR generiert",
  sent: "Versendet",
  paid: "Bezahlt",
};

const refTypeLabels = {
  QRR: "QR-Referenz",
  SCOR: "Creditor Ref.",
  NON: "Ohne Referenz",
};

export default function QRInvoice() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<QRInvoiceListItem | null>(null);

  const filteredInvoices = qrInvoices.filter((invoice) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = qrInvoices.length;
  const paidInvoices = qrInvoices.filter((i) => i.status === "paid").length;
  const openAmount = qrInvoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = qrInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const handleGenerateQR = async (invoice: QRInvoiceListItem) => {
    setIsGenerating(invoice.id);
    toast.success(`QR-Code für ${invoice.invoiceNumber} wird generiert...`);
    
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(null);
      toast.success(`QR-Code für ${invoice.invoiceNumber} erfolgreich generiert`);
    }, 1500);
  };

  const handleDownloadPDF = async (invoice: QRInvoiceListItem) => {
    setIsGenerating(invoice.id);
    
    try {
      const qrData: QRInvoiceData = {
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.createdAt,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        amount: invoice.amount,
        vatRate: 8.1,
        vatAmount: invoice.amount * 0.081 / 1.081,
        subtotal: invoice.amount / 1.081,
        iban: invoice.iban,
        qrIban: "CH44 3199 9123 0008 8901 2",
        reference: invoice.reference || generateQRReference(invoice.invoiceNumber),
        referenceType: invoice.referenceType,
        additionalInfo: `Rechnung ${invoice.invoiceNumber}`,
        creditor: {
          name: "Loomora Metallbau AG",
          street: "Industriestrasse 15",
          postalCode: "8005",
          city: "Zürich",
          country: "CH",
        },
        debtor: {
          name: invoice.customer,
          street: "Kundenstrasse 1",
          postalCode: "8000",
          city: "Zürich",
          country: "CH",
        },
        positions: [
          { 
            position: 1, 
            description: "Metallbauarbeiten gemäss Auftrag", 
            quantity: 1, 
            unit: "Pausch.", 
            unitPrice: invoice.amount / 1.081, 
            total: invoice.amount / 1.081 
          },
        ],
        paymentTermDays: 30,
      };

      await generateSwissQRInvoicePDF(qrData);
      toast.success(`QR-Rechnung ${invoice.invoiceNumber} heruntergeladen`);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Fehler beim Erstellen der PDF");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            QR-Rechnung
          </h1>
          <p className="text-muted-foreground">
            Swiss QR-Invoice gem. ISO 20022 Standard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Sammel-PDF
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            QR-Rechnung erstellen
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <QrCode className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="font-semibold text-info">Swiss QR-Rechnung Standard</h3>
            <p className="text-sm text-muted-foreground">
              Vollständig konform mit ISO 20022 und SIX Vorgaben. Generiert PDF mit Zahlteil inkl. 
              QR-Code, Schweizer Kreuz und Empfangsschein. Unterstützt QRR, SCOR und NON Referenzen.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">QR-Rechnungen</p>
              <p className="text-2xl font-bold">{totalInvoices}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bezahlt</p>
              <p className="text-2xl font-bold text-success">{paidInvoices}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold">CHF {openAmount.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <FileText className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eingegangen</p>
              <p className="text-2xl font-bold">CHF {paidAmount.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechnung suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
            <SelectItem value="generated">Generiert</SelectItem>
            <SelectItem value="sent">Versendet</SelectItem>
            <SelectItem value="paid">Bezahlt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* QR Invoice List */}
      <div className="space-y-3">
        {filteredInvoices.map((invoice, index) => (
          <div
            key={invoice.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl",
                  invoice.qrGenerated ? "bg-primary/10" : "bg-muted"
                )}>
                  {isGenerating === invoice.id ? (
                    <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  ) : invoice.qrGenerated ? (
                    <QrCode className="h-7 w-7 text-primary" />
                  ) : (
                    <AlertTriangle className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{invoice.customer}</h3>
                    <Badge className={statusStyles[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{invoice.invoiceNumber}</span>
                    {" • "}
                    Fällig: {invoice.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <p className="text-sm text-muted-foreground">Referenztyp</p>
                  <Badge variant="outline">{refTypeLabels[invoice.referenceType]}</Badge>
                </div>

                <div className="text-right hidden lg:block">
                  <p className="text-sm text-muted-foreground">IBAN</p>
                  <p className="font-mono text-sm">{invoice.iban.substring(0, 12)}...</p>
                </div>

                <div className="text-right min-w-[120px]">
                  <p className="text-sm text-muted-foreground">Betrag</p>
                  <p className="font-mono font-bold text-lg">
                    {invoice.currency} {invoice.amount.toLocaleString("de-CH")}
                  </p>
                </div>

                <div className="flex gap-1">
                  {!invoice.qrGenerated && (
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleGenerateQR(invoice)}
                      disabled={isGenerating === invoice.id}
                    >
                      {isGenerating === invoice.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <QrCode className="h-4 w-4" />
                      )}
                      QR generieren
                    </Button>
                  )}
                  {invoice.qrGenerated && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => handleDownloadPDF(invoice)}
                      disabled={isGenerating === invoice.id}
                    >
                      {isGenerating === invoice.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      PDF
                    </Button>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPreviewInvoice(invoice)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Vorschau
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                      <Download className="h-4 w-4 mr-2" />
                      PDF herunterladen
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Printer className="h-4 w-4 mr-2" />
                      Drucken
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Send className="h-4 w-4 mr-2" />
                      Per E-Mail senden
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      navigator.clipboard.writeText(invoice.reference);
                      toast.success("QR-Referenz kopiert");
                    }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Referenz kopieren
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {invoice.reference && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  QR-Referenz: <span className="font-mono">{invoice.reference.replace(/(.{2})(.{5})(.{5})(.{5})(.{5})(.{5})/, "$1 $2 $3 $4 $5 $6")}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QR Code Preview Panel */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">QR-Zahlteil Vorschau (ISO 20022)</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="p-6 border border-dashed border-border rounded-lg bg-white dark:bg-card">
            <div className="aspect-square max-w-[200px] mx-auto bg-muted rounded-lg flex items-center justify-center relative">
              <QrCode className="h-24 w-24 text-muted-foreground" />
              {/* Swiss Cross Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-destructive flex items-center justify-center">
                  <div className="text-destructive-foreground text-2xl font-bold">+</div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Swiss QR Code mit Schweizer Kreuz
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Konto / Zahlbar an</p>
              <p className="font-mono text-sm">CH93 0076 2011 6238 5295 7</p>
              <p className="text-sm">Loomora Metallbau AG</p>
              <p className="text-sm">Industriestrasse 15</p>
              <p className="text-sm">8005 Zürich</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Referenz (QRR)</p>
              <p className="font-mono text-sm">00 00000 00000 00000 00000 00156</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Zahlbar durch</p>
              <p className="text-sm">Bauherr AG</p>
              <p className="text-sm">Bahnhofstrasse 10</p>
              <p className="text-sm">8001 Zürich</p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex gap-8">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Währung</p>
                  <p className="text-lg font-bold">CHF</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Betrag</p>
                  <p className="text-lg font-bold">31'970.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>QR-Rechnung Vorschau</DialogTitle>
            <DialogDescription>
              {previewInvoice?.invoiceNumber} - {previewInvoice?.customer}
            </DialogDescription>
          </DialogHeader>
          {previewInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Rechnungsnummer</p>
                  <p className="font-mono font-semibold">{previewInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Betrag</p>
                  <p className="font-mono font-semibold">{previewInvoice.currency} {previewInvoice.amount.toLocaleString("de-CH")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fälligkeitsdatum</p>
                  <p className="font-semibold">{previewInvoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Referenztyp</p>
                  <p className="font-semibold">{refTypeLabels[previewInvoice.referenceType]}</p>
                </div>
              </div>
              {previewInvoice.reference && (
                <div>
                  <p className="text-muted-foreground text-sm">QR-Referenz</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {previewInvoice.reference.replace(/(.{2})(.{5})(.{5})(.{5})(.{5})(.{5})/, "$1 $2 $3 $4 $5 $6")}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleDownloadPDF(previewInvoice)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  PDF herunterladen
                </Button>
                <Button variant="outline" onClick={() => setPreviewInvoice(null)}>
                  Schliessen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
