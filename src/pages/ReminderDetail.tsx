import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Mail, FileText, Clock, CheckCircle2, Send, Calculator, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useReminder } from "@/hooks/use-reminders";
import { useCompany } from "@/hooks/use-company";
import { SendEmailModal } from "@/components/email/SendEmailModal";
import { useEntityHistory } from "@/hooks/use-audit-log";
import { PDFPreviewDialog } from "@/components/documents/PDFPreviewDialog";
import { SalesDocumentData, downloadSalesDocumentPDF } from "@/lib/pdf/sales-document";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-success/10 text-success",
  PAID: "bg-info/10 text-info",
  CANCELLED: "bg-destructive/10 text-destructive",
};
const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf", SENT: "Versendet", PAID: "Bezahlt", CANCELLED: "Storniert",
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

function formatDateTime(d?: string | null) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "—";
    return dt.toLocaleString("de-CH");
  } catch { return "—"; }
}

export default function ReminderDetail() {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const { id } = useParams();
  const { data: raw, isLoading, error } = useReminder(id || "");
  const { data: auditHistory } = useEntityHistory("reminder", id || "");
  const { data: companyData } = useCompany();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }
  if (error || !raw) {
    return <div className="flex flex-col items-center justify-center h-64 text-muted-foreground"><p>Mahnung nicht gefunden</p><Link to="/reminders" className="text-primary hover:underline mt-2">Zurück</Link></div>;
  }

  const r = raw as any;
  const formatCurrency = (value: number) => new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(value || 0);

  const customer = r.invoice?.customer || r.customer;
  const invoiceTotal = Number(r.invoice?.total ?? r.invoice?.totalAmount ?? 0);
  const fee = Number(r.fee ?? 0);
  const interestAmount = Number(r.interestAmount ?? 0);
  const totalWithFee = Number(r.totalWithFee ?? r.totalAmount ?? invoiceTotal + fee + interestAmount);

  // PDF data für Frontend-Generierung (Mahnung)
  const levelNames: Record<number, string> = { 1: 'Zahlungserinnerung', 2: '1. Mahnung', 3: '2. Mahnung', 4: '3. Mahnung', 5: 'Letzte Mahnung' };
  const pdfData: SalesDocumentData = {
    type: 'reminder',
    number: r.number || r.id,
    date: r.createdAt,
    dueDate: r.dueDate,
    projectNumber: r.project?.number || r.project?.name || undefined,
    originalInvoiceNumber: r.invoice?.number || r.invoiceId || undefined,
    company: {
      name: companyData?.name || "—",
      street: companyData?.street || "",
      postalCode: companyData?.zipCode || "",
      city: companyData?.city || "",
      phone: companyData?.phone || "",
      email: companyData?.email || "",
      vatNumber: companyData?.vatNumber || "",
      iban: companyData?.iban || "",
    },
    customer: {
      name: customer?.companyName || customer?.name || "Unbekannt",
      street: customer?.street || "",
      postalCode: customer?.zipCode || customer?.zip || "",
      city: customer?.city || "",
      country: customer?.country || undefined,
      email: customer?.email || undefined,
    },
    // Positionen aus verknüpfter Rechnung übernehmen
    positions: (r.invoice?.items || []).map((item: any, idx: number) => ({
      position: idx + 1,
      description: item.description || item.name || "",
      quantity: Number(item.quantity ?? 1),
      unit: item.unit || "Stk.",
      unitPrice: Number(item.unitPrice ?? item.price ?? 0),
      total: Number(item.total ?? item.amount ?? 0),
    })),
    subtotal: invoiceTotal,
    vatRate: 0,
    vatAmount: 0,
    total: totalWithFee,
    reminderLevel: r.level || 1,
    reminderFee: fee,
    reminderInterestRate: Number(r.interestRate ?? 5),
    reminderInterestAmount: interestAmount,
    reminderInvoiceTotal: invoiceTotal,
    notes: r.notes || undefined,
    paymentTerms: `Zahlbar bis ${formatDate(r.dueDate)} (${levelNames[r.level || 1]})`,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/reminders"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{r.number || r.id}</h1>
            <Badge className={statusColors[r.status] || "bg-muted text-muted-foreground"}>
              {statusLabels[r.status] || r.status}
            </Badge>
            <Badge className="bg-warning/10 text-warning">
              <AlertTriangle className="mr-1 h-3 w-3" />
              {levelNames[r.level || 1] || `Stufe ${r.level}`}
            </Badge>
          </div>
          <p className="text-muted-foreground">{customer?.companyName || customer?.name || "Unbekannt"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPDFPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Vorschau
          </Button>
          <Button variant="outline" onClick={() => { downloadSalesDocumentPDF(pdfData, `Mahnung-${r.number || r.id}.pdf`); toast.success("PDF wird heruntergeladen"); }}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => setEmailModalOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Per E-Mail
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Offener Betrag</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(invoiceTotal)}</p>
            <p className="text-sm text-muted-foreground">Hauptforderung</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Mahngebühr</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(fee)}</p>
            <p className="text-sm text-muted-foreground">{levelNames[r.level || 1]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Verzugszins</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(interestAmount)}</p>
            {Number(r.interestRate) > 0 && <p className="text-sm text-muted-foreground">{Number(r.interestRate).toFixed(1)}% p.a.</p>}
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Gesamtforderung</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totalWithFee)}</p>
            <p className="text-sm text-muted-foreground">inkl. Gebühren & Zins</p>
          </CardContent>
        </Card>
      </div>

      {/* Kunde & Frist */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Schuldner</CardTitle></CardHeader>
          <CardContent>
            <Link to={`/customers/${customer?.id || r.customerId}`} className="text-xl font-bold text-primary hover:underline">
              {customer?.companyName || customer?.name || "Unbekannt"}
            </Link>
            {customer?.street && <p className="text-sm text-muted-foreground mt-1">{customer.street}</p>}
            {(customer?.zipCode || customer?.city) && (
              <p className="text-sm text-muted-foreground">{customer?.zipCode} {customer?.city}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Zahlungsfrist</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatDate(r.dueDate)}</p>
            <p className="text-sm text-muted-foreground">Frist für Zahlung</p>
          </CardContent>
        </Card>
      </div>

      {/* Verknüpfte Rechnung */}
      {r.invoice && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Verknüpfte Rechnung</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Link to={`/invoices/${r.invoice.id}`} className="text-primary hover:underline font-medium">
                  {r.invoice.number || r.invoiceId}
                </Link>
                <p className="text-sm text-muted-foreground">Betrag: {formatCurrency(invoiceTotal)}</p>
              </div>
              <p className="text-sm text-muted-foreground">Fällig: {formatDate(r.invoice.dueDate)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forderungsberechnung */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Forderungsberechnung</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <div className="flex justify-between">
              <span>Rechnungsbetrag</span>
              <span>{formatCurrency(invoiceTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>+ Mahngebühr ({levelNames[r.level || 1]})</span>
              <span>{formatCurrency(fee)}</span>
            </div>
            {interestAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>+ Verzugszins ({Number(r.interestRate ?? 5).toFixed(1)}% p.a.)</span>
                <span>{formatCurrency(interestAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Gesamtforderung</span>
              <span className="text-destructive">{formatCurrency(totalWithFee)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verlauf */}
      {(auditHistory || []).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Verlauf</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(auditHistory || []).map((log: any, index: number) => (
                <div key={log.id || index} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {log.action === "CREATE" ? "Erstellt"
                        : log.action === "UPDATE" ? "Bearbeitet"
                        : log.action === "STATUS_CHANGE" ? "Status geändert"
                        : log.action === "SEND" ? "Versendet"
                        : log.action === "DELETE" ? "Gelöscht"
                        : log.action}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {/* Backend gibt createdAt zurück, Interface hat timestamp */}
                      <span>{formatDateTime(log.createdAt || log.timestamp)}</span>
                      <span>•</span>
                      <span>{log.user ? `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim() || "System" : "System"}</span>
                    </div>
                    {log.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{log.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Preview */}
      <PDFPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        documentData={pdfData}
        title={`Mahnung ${r.number || r.id}`}
        onSendEmail={() => setEmailModalOpen(true)}
      />

      <SendEmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        documentType="reminder"
        documentId={id || ''}
        documentNumber={r.number || r.id}
        defaultRecipient={customer?.email}
      />
    </div>
  );
}
