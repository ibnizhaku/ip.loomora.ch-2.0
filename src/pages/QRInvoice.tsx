import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  QrCode,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Copy,
  Printer,
  Send,
  MoreHorizontal,
  AlertTriangle,
  Loader2,
  AlertCircle,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  generateSwissQRInvoicePDF,
  type QRInvoiceData,
} from "@/lib/pdf/swiss-qr-invoice";
import { useInvoices, type Invoice } from "@/hooks/use-invoices";
import { useCompany } from "@/hooks/use-company";
import { useInvoiceStats } from "@/hooks/use-invoices";

// Map Invoice status → QR page display status
function mapStatus(status: Invoice["status"]): "draft" | "sent" | "paid" | "overdue" {
  switch (status) {
    case "PAID": return "paid";
    case "SENT": return "sent";
    case "OVERDUE": return "overdue";
    default: return "draft";
  }
}

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  sent: "Versendet",
  paid: "Bezahlt",
  overdue: "Überfällig",
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function QRInvoice() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const { data: invoicesData, isLoading } = useInvoices({ pageSize: 100 });
  const { data: companyData } = useCompany();
  const stats = useInvoiceStats();

  const invoices: Invoice[] = invoicesData?.data ?? [];

  const hasIban = !!(companyData?.iban || companyData?.qrIban);

  const filteredInvoices = invoices.filter((invoice) => {
    const customerName =
      invoice.customer?.name || "";
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const qrStatus = mapStatus(invoice.status);
    const matchesStatus =
      statusFilter === "all" || qrStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPDF = async (invoice: Invoice) => {
    if (!invoice.qrReference) {
      toast.error(
        "Keine QR-Referenz vorhanden. Bitte Backend prüfen – Referenz wird beim Erstellen der Rechnung automatisch generiert."
      );
      return;
    }
    if (!hasIban) {
      toast.error(
        "IBAN fehlt. Bitte unter Einstellungen → Firma → Bankverbindung konfigurieren."
      );
      return;
    }

    setIsGenerating(invoice.id);
    try {
      const raw = invoice as any;
      const qrData: QRInvoiceData = {
        invoiceNumber: invoice.number,
        invoiceDate: formatDate(invoice.issueDate || invoice.createdAt),
        dueDate: formatDate(invoice.dueDate),
        currency: "CHF",
        amount: invoice.total,
        vatRate: 8.1,
        vatAmount: invoice.vatAmount,
        subtotal: invoice.subtotal,
        iban: companyData?.iban || "",
        qrIban: companyData?.qrIban || undefined,
        reference: invoice.qrReference,
        referenceType: companyData?.qrIban ? "QRR" : "SCOR",
        additionalInfo: `Rechnung ${invoice.number}`,
        creditor: {
          name: companyData?.name || "",
          street: companyData?.street || "",
          postalCode: companyData?.zipCode || "",
          city: companyData?.city || "",
          country: "CH",
        },
        debtor: {
          name:
            raw?.customer?.companyName ||
            raw?.customer?.name ||
            invoice.customer?.name ||
            "",
          street: raw?.customer?.street || "",
          postalCode: raw?.customer?.zipCode || "",
          city: raw?.customer?.city || "",
          country: "CH",
        },
        positions: (invoice.items || []).map((item, idx) => ({
          position: idx + 1,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        paymentTermDays: 30,
      };

      await generateSwissQRInvoicePDF(qrData);
      toast.success(`QR-Rechnung ${invoice.number} heruntergeladen`);
    } catch (error) {
      console.error("QR PDF error:", error);
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
            QR-Rechnungen
          </h1>
          <p className="text-muted-foreground">
            Swiss QR-Invoice gem. ISO 20022 Standard
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={() => navigate("/invoices/new")}>
            <Plus className="h-4 w-4" />
            Rechnung erstellen
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
              Vollständig konform mit ISO 20022 und SIX Vorgaben. PDF mit Zahlteil inkl.
              QR-Code, Schweizer Kreuz und Empfangsschein. Unterstützt QRR, SCOR und NON Referenzen.
            </p>
          </div>
        </div>
      </div>

      {/* IBAN Warning */}
      {!hasIban && companyData && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>IBAN nicht konfiguriert</AlertTitle>
          <AlertDescription>
            Für QR-Rechnungen wird eine IBAN benötigt. Bitte unter{" "}
            <button
              className="underline font-medium"
              onClick={() => navigate("/settings")}
            >
              Einstellungen → Firma
            </button>{" "}
            die Bankverbindung hinterlegen.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Rechnungen</p>
              <p className="text-2xl font-bold">
                {stats.isLoading ? "—" : stats.total}
              </p>
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
              <p className="text-2xl font-bold text-success">
                {stats.isLoading ? "—" : stats.paid}
              </p>
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
              <p className="text-2xl font-bold">
                {stats.isLoading ? "—" : stats.pending}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Überfällig</p>
              <p className="text-2xl font-bold text-destructive">
                {stats.isLoading ? "—" : stats.overdue}
              </p>
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
            <SelectItem value="sent">Versendet</SelectItem>
            <SelectItem value="paid">Bezahlt</SelectItem>
            <SelectItem value="overdue">Überfällig</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Keine Rechnungen gefunden.</p>
          <Button
            className="mt-4 gap-2"
            onClick={() => navigate("/invoices/new")}
          >
            <Plus className="h-4 w-4" />
            Erste Rechnung erstellen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice, index) => {
            const qrStatus = mapStatus(invoice.status);
            const hasQrRef = !!invoice.qrReference;
            return (
              <div
                key={invoice.id}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-xl",
                        hasQrRef && hasIban ? "bg-primary/10" : "bg-muted"
                      )}
                    >
                      {isGenerating === invoice.id ? (
                        <Loader2 className="h-7 w-7 text-primary animate-spin" />
                      ) : hasQrRef && hasIban ? (
                        <QrCode className="h-7 w-7 text-primary" />
                      ) : (
                        <AlertTriangle className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {invoice.customer?.name || "—"}
                        </h3>
                        <Badge className={statusStyles[qrStatus]}>
                          {statusLabels[qrStatus]}
                        </Badge>
                        {!hasQrRef && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Keine QR-Ref.
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono">{invoice.number}</span>
                        {" • "}
                        Fällig: {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden lg:block">
                      <p className="text-sm text-muted-foreground">IBAN</p>
                      <p className="font-mono text-sm">
                        {companyData?.iban
                          ? companyData.iban.substring(0, 12) + "..."
                          : "—"}
                      </p>
                    </div>

                    <div className="text-right min-w-[120px]">
                      <p className="text-sm text-muted-foreground">Betrag</p>
                      <p className="font-mono font-bold text-lg">
                        CHF {invoice.total.toLocaleString("de-CH")}
                      </p>
                    </div>

                    <div className="flex gap-1">
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
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setPreviewInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Vorschau
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadPDF(invoice)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF herunterladen
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Rechnung öffnen
                        </DropdownMenuItem>
                        {invoice.qrReference && (
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(
                                invoice.qrReference!
                              );
                              toast.success("QR-Referenz kopiert");
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Referenz kopieren
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {invoice.qrReference && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      QR-Referenz:{" "}
                      <span className="font-mono">
                        {invoice.qrReference.replace(
                          /(.{2})(.{5})(.{5})(.{5})(.{5})(.{5})/,
                          "$1 $2 $3 $4 $5 $6"
                        )}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewInvoice}
        onOpenChange={() => setPreviewInvoice(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>QR-Rechnung Vorschau</DialogTitle>
            <DialogDescription>
              {previewInvoice?.number} – {previewInvoice?.customer?.name}
            </DialogDescription>
          </DialogHeader>
          {previewInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Rechnungsnummer</p>
                  <p className="font-mono font-semibold">{previewInvoice.number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Betrag</p>
                  <p className="font-mono font-semibold">
                    CHF {previewInvoice.total.toLocaleString("de-CH")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fälligkeitsdatum</p>
                  <p className="font-semibold">{formatDate(previewInvoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Referenztyp</p>
                  <p className="font-semibold">
                    {companyData?.qrIban ? "QR-Referenz (QRR)" : "Creditor Ref. (SCOR)"}
                  </p>
                </div>
              </div>

              {previewInvoice.qrReference ? (
                <div>
                  <p className="text-muted-foreground text-sm">QR-Referenz</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {previewInvoice.qrReference.replace(
                      /(.{2})(.{5})(.{5})(.{5})(.{5})(.{5})/,
                      "$1 $2 $3 $4 $5 $6"
                    )}
                  </p>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Keine QR-Referenz</AlertTitle>
                  <AlertDescription>
                    Diese Rechnung hat noch keine QR-Referenz. Sie wird vom Backend beim Erstellen automatisch generiert.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleDownloadPDF(previewInvoice)}
                  className="flex-1"
                  disabled={!previewInvoice.qrReference || !hasIban}
                >
                  <Download className="h-4 w-4 mr-2" />
                  QR-PDF herunterladen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewInvoice(null);
                    navigate(`/invoices/${previewInvoice.id}`);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Rechnung öffnen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewInvoice(null)}
                >
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
