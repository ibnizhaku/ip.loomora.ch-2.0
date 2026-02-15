import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Receipt, 
  Calendar, 
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Download,
  Printer,
  MoreHorizontal,
  CreditCard,
  Ban,
  Eye,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PDFPreviewDialog } from "@/components/documents/PDFPreviewDialog";
import { SalesDocumentData, downloadSalesDocumentPDF } from "@/lib/pdf/sales-document";
import { useInvoice } from "@/hooks/use-invoices";

// Status mapping from backend enum to German display labels
const invoiceStatusMap: Record<string, string> = {
  DRAFT: "Entwurf",
  SENT: "Gesendet",
  PARTIAL: "Teilweise bezahlt",
  PAID: "Bezahlt",
  OVERDUE: "Überfällig",
  CANCELLED: "Storniert",
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return dateStr; }
}

function mapInvoiceToView(invoice: any) {
  const items = invoice.items || [];
  const subtotal = Number(invoice.subtotal) || 0;
  const vatAmount = Number(invoice.vatAmount) || 0;
  const total = Number(invoice.total) || 0;
  const paidAmount = Number(invoice.paidAmount) || 0;

  return {
    id: invoice.number || invoice.id,
    status: invoiceStatusMap[invoice.status] || invoice.status || "Entwurf",
    customer: {
      id: invoice.customer?.id,
      name: invoice.customer?.name || "Unbekannt",
      contact: invoice.customer?.contactPerson || invoice.customer?.companyName || "",
      email: invoice.customer?.email || "",
      phone: invoice.customer?.phone || "",
      address: [invoice.customer?.street, [invoice.customer?.zipCode, invoice.customer?.city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
      taxId: invoice.customer?.vatNumber || "",
    },
    order: invoice.order?.number || "",
    orderId: invoice.order?.id || invoice.orderId || "",
    createdAt: formatDate(invoice.issueDate || invoice.createdAt),
    dueDate: formatDate(invoice.dueDate),
    positions: items.map((item: any, idx: number) => ({
      id: item.id || idx + 1,
      description: item.description || "",
      quantity: Number(item.quantity) || 0,
      unit: item.unit || "Stück",
      price: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0,
    })),
    subtotal,
    tax: vatAmount,
    total,
    payments: (invoice.payments || []).map((p: any) => ({
      date: formatDate(p.paymentDate || p.createdAt),
      amount: Number(p.amount) || 0,
      method: p.method || "Überweisung",
    })),
    paid: paidAmount,
    reminders: (invoice.reminders || []).map((r: any) => ({
      date: formatDate(r.sentAt || r.createdAt),
      type: r.type || "Mahnung",
    })),
    bankDetails: {
      bank: "PostFinance AG",
      iban: "CH93 0076 2011 6238 5295 7",
      bic: "POFICHBEXXX",
    },
  };
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: Receipt },
  "Gesendet": { color: "bg-info/10 text-info", icon: Send },
  "Bezahlt": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Teilweise bezahlt": { color: "bg-warning/10 text-warning", icon: Clock },
  "Überfällig": { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  "Storniert": { color: "bg-muted text-muted-foreground", icon: Ban },
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rawInvoice, isLoading, error } = useInvoice(id);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !rawInvoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Rechnung nicht gefunden</p>
        <Link to="/invoices" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const invoiceData = mapInvoiceToView(rawInvoice);
  
  const status = statusConfig[invoiceData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;
  const outstanding = invoiceData.total - invoiceData.paid;

  // Prepare PDF data
  const pdfData: SalesDocumentData = {
    type: 'invoice',
    number: invoiceData.id,
    date: invoiceData.createdAt,
    dueDate: invoiceData.dueDate,
    orderNumber: invoiceData.order,
    company: {
      name: "Loomora Metallbau AG",
      street: "Industriestrasse 15",
      postalCode: "8005",
      city: "Zürich",
      phone: "+41 44 123 45 67",
      email: "info@loomora.ch",
      vatNumber: "CHE-123.456.789",
      iban: invoiceData.bankDetails.iban,
      bic: invoiceData.bankDetails.bic,
    },
    customer: {
      name: invoiceData.customer.name,
      contact: invoiceData.customer.contact,
      street: invoiceData.customer.address.split(',')[0],
      postalCode: invoiceData.customer.address.split(',')[1]?.trim().split(' ')[0] || '',
      city: invoiceData.customer.address.split(',')[1]?.trim().split(' ').slice(1).join(' ') || '',
      email: invoiceData.customer.email,
      phone: invoiceData.customer.phone,
      vatNumber: invoiceData.customer.taxId,
    },
    positions: invoiceData.positions.map((pos, idx) => ({
      position: idx + 1,
      description: pos.description,
      quantity: pos.quantity,
      unit: pos.unit,
      unitPrice: pos.price,
      total: pos.total,
    })),
    subtotal: invoiceData.subtotal,
    vatRate: 8.1,
    vatAmount: invoiceData.tax,
    total: invoiceData.total,
    paymentTerms: "30 Tage netto",
  };

  const handleDownloadPDF = () => {
    downloadSalesDocumentPDF(pdfData);
    toast.success("PDF heruntergeladen");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{invoiceData.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {invoiceData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{invoiceData.customer.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Zahlung erfassen
          </Button>
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Mahnung erstellen
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPDFPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Drucken
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("Rechnung wird per E-Mail gesendet...")}>
                <Mail className="h-4 w-4 mr-2" />
                Per E-Mail senden
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/credit-notes/new?invoiceId=${id}`)}>Gutschrift erstellen</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Rechnung wird dupliziert...")}>Duplizieren</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => toast.info("Rechnung wird storniert...")}>Stornieren</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alert for overdue */}
      {invoiceData.status === "Überfällig" && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Rechnung überfällig</p>
              <p className="text-sm text-muted-foreground">
                Die Rechnung war am {invoiceData.dueDate} fällig. Offener Betrag: CHF {outstanding.toFixed(2)}
              </p>
            </div>
            <Button size="sm" className="ml-auto bg-destructive hover:bg-destructive/90">
              Mahnung senden
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Rechnungspositionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Beschreibung</TableHead>
                    <TableHead className="text-right">Menge</TableHead>
                    <TableHead>Einheit</TableHead>
                    <TableHead className="text-right">Einzelpreis</TableHead>
                    <TableHead className="text-right">Gesamt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceData.positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.description}</TableCell>
                      <TableCell className="text-right">{pos.quantity}</TableCell>
                      <TableCell>{pos.unit}</TableCell>
                      <TableCell className="text-right">CHF {pos.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">CHF {pos.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Zwischensumme (netto)</span>
                  <span>CHF {invoiceData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MwSt. (8.1%)</span>
                  <span>CHF {invoiceData.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gesamtbetrag</span>
                  <span>CHF {invoiceData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-success">
                  <span>Bereits bezahlt</span>
                  <span>-CHF {invoiceData.paid.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg text-destructive">
                  <span>Offener Betrag</span>
                  <span>CHF {outstanding.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Zahlungsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoiceData.payments.length > 0 ? invoiceData.payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                        <CreditCard className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">Zahlung eingegangen</p>
                        <p className="text-sm text-muted-foreground">{payment.date} • {payment.method}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-success">+CHF {payment.amount.toFixed(2)}</span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">Noch keine Zahlungen eingegangen.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          {invoiceData.reminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mahnungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoiceData.reminders.map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        <div>
                          <p className="font-medium">{reminder.type}</p>
                          <p className="text-sm text-muted-foreground">{reminder.date}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Versendet</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rechnungsempfänger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link to={`/customers/${invoiceData.customer.id || ''}`} className="font-medium hover:text-primary">
                    {invoiceData.customer.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{invoiceData.customer.contact}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {invoiceData.customer.address}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                {invoiceData.customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{invoiceData.customer.email}</span>
                  </div>
                )}
                {invoiceData.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{invoiceData.customer.phone}</span>
                  </div>
                )}
              </div>

              {invoiceData.customer.taxId && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <span className="text-muted-foreground">USt-IdNr.: </span>
                    <span>{invoiceData.customer.taxId}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoiceData.orderId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Auftrag</span>
                  <Link to={`/orders/${invoiceData.orderId}`} className="font-medium hover:text-primary">
                    {invoiceData.order || "—"}
                  </Link>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rechnungsdatum</span>
                <span className="font-medium">{invoiceData.createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fällig am</span>
                <span className="font-medium text-destructive">{invoiceData.dueDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bankverbindung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank</span>
                <span className="font-medium">{invoiceData.bankDetails.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IBAN</span>
                <span className="font-medium font-mono text-xs">{invoiceData.bankDetails.iban}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">BIC</span>
                <span className="font-medium">{invoiceData.bankDetails.bic}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        documentData={pdfData}
        title={`Rechnung ${invoiceData.id}`}
      />
    </div>
  );
};

export default InvoiceDetail;
