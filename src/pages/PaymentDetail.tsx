import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Banknote, Building2, FileText, CheckCircle2, Clock, AlertCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { usePayment } from "@/hooks/use-payments";

// Status mapping from backend enum to German display
const paymentStatusMap: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Entwurf", color: "bg-muted text-muted-foreground", icon: Clock },
  COMPLETED: { label: "Ausgeführt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  FAILED: { label: "Fehlgeschlagen", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
  CANCELLED: { label: "Storniert", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

const methodLabels: Record<string, string> = {
  BANK_TRANSFER: "Überweisung",
  CASH: "Bargeld",
  CREDIT_CARD: "Kreditkarte",
  QR_BILL: "QR-Rechnung",
  OTHER: "Sonstige",
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return dateStr; }
}

function mapPaymentToView(payment: any) {
  const amount = Number(payment.amount) || 0;
  const isOutgoing = payment.type === "OUTGOING";
  
  return {
    id: payment.number || payment.id,
    typ: isOutgoing ? "Kreditorenzahlung" : "Debitorenzahlung",
    datum: formatDate(payment.paymentDate || payment.createdAt),
    valuta: formatDate(payment.paymentDate),
    status: payment.status || "PENDING",
    betrag: amount,
    währung: payment.currency || "CHF",
    zahlungsart: methodLabels[payment.method] || payment.method || "Überweisung",
    referenz: payment.reference || payment.qrReference || "—",
    verwendungszweck: payment.notes || "—",
    // Empfänger
    empfänger: isOutgoing
      ? (payment.supplier?.name || "—")
      : (payment.customer?.name || "—"),
    empfängerKonto: payment.bankAccount?.iban || "—",
    empfängerBank: payment.bankAccount?.bankName || "—",
    empfängerBIC: payment.bankAccount?.bic || "—",
    // Absender
    absenderKonto: payment.bankAccount?.iban || "—",
    absenderBank: payment.bankAccount?.bankName || "—",
    // Buchung (nicht immer vorhanden)
    buchungNr: "",
    sollKonto: "",
    sollBezeichnung: "",
    habenKonto: "",
    habenBezeichnung: "",
    // Related invoice
    invoice: payment.invoice,
    purchaseInvoice: payment.purchaseInvoice,
  };
}

export default function PaymentDetail() {
  const { id } = useParams();
  const { data: rawPayment, isLoading, error } = usePayment(id || "");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !rawPayment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Zahlung nicht gefunden</p>
        <Link to="/payments" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const zahlungData = mapPaymentToView(rawPayment);
  const statusInfo = paymentStatusMap[zahlungData.status] || paymentStatusMap.PENDING;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/payments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{zahlungData.id}</h1>
            <Badge className={statusInfo.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusInfo.label}
            </Badge>
            <Badge variant="outline">{zahlungData.typ}</Badge>
          </div>
          <p className="text-muted-foreground">{zahlungData.verwendungszweck}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Beleg
          </Button>
        </div>
      </div>

      {/* Betrag Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Zahlungsbetrag</p>
              <p className="text-4xl font-bold text-primary">{formatCurrency(zahlungData.betrag)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valutadatum</p>
              <p className="text-xl font-medium">{zahlungData.valuta}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zahlungsdetails */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Empfänger */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Empfänger</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium text-lg">{zahlungData.empfänger}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IBAN</p>
              <p className="font-mono">{zahlungData.empfängerKonto}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bank</p>
                <p>{zahlungData.empfängerBank}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">BIC/SWIFT</p>
                <p className="font-mono">{zahlungData.empfängerBIC}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Absender */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Absender (Eigenes Konto)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">IBAN</p>
              <p className="font-mono">{zahlungData.absenderKonto}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bank</p>
              <p>{zahlungData.absenderBank}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Zahlungsart</p>
              <Badge variant="outline">{zahlungData.zahlungsart}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Related Invoices */}
      {(zahlungData.invoice || zahlungData.purchaseInvoice) && (
        <Card>
          <CardHeader>
            <CardTitle>Zugehörige Rechnungen</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rechnung</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zahlungData.invoice && (
                  <TableRow>
                    <TableCell>
                      <Link to={`/invoices/${zahlungData.invoice.id}`} className="text-primary hover:underline font-medium">
                        {zahlungData.invoice.number || zahlungData.invoice.id}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(zahlungData.invoice.issueDate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(zahlungData.invoice.total) || 0)}</TableCell>
                    <TableCell>
                      <Badge className="bg-success/10 text-success">Verknüpft</Badge>
                    </TableCell>
                  </TableRow>
                )}
                {zahlungData.purchaseInvoice && (
                  <TableRow>
                    <TableCell>
                      <Link to={`/purchase-invoices/${zahlungData.purchaseInvoice.id}`} className="text-primary hover:underline font-medium">
                        {zahlungData.purchaseInvoice.number || zahlungData.purchaseInvoice.id}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(zahlungData.purchaseInvoice.issueDate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(zahlungData.purchaseInvoice.total) || 0)}</TableCell>
                    <TableCell>
                      <Badge className="bg-success/10 text-success">Verknüpft</Badge>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Meta */}
      <Card>
        <CardContent className="py-4">
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <span className="text-muted-foreground">Erfasst:</span>
              <span className="ml-2">{zahlungData.datum}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Referenz:</span>
              <span className="ml-2 font-mono">{zahlungData.referenz}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Valuta:</span>
              <span className="ml-2">{zahlungData.valuta}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
