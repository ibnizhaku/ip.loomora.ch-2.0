import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Send, CheckCircle, Clock, FileText, Building2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePayment } from "@/hooks/use-payments";

const statusStyles: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning",
  COMPLETED: "bg-success/10 text-success",
  FAILED: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground",
};
const statusLabels: Record<string, string> = {
  PENDING: "Ausstehend", COMPLETED: "Ausgeführt", FAILED: "Fehlgeschlagen", CANCELLED: "Storniert",
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

export default function SepaPaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, isLoading, error } = usePayment(id || "");

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error || !raw) return <div className="flex flex-col items-center justify-center h-64 text-muted-foreground"><p>Zahlung nicht gefunden</p><Button variant="link" onClick={() => navigate(-1)}>Zurück</Button></div>;

  const p = raw as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold">{p.number || p.reference || p.id}</h1>
            <Badge className={statusStyles[p.status] || "bg-muted text-muted-foreground"}>
              {statusLabels[p.status] || p.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{p.type === 'INCOMING' ? 'Eingehende Zahlung' : 'Ausgehende Zahlung'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {p.type === 'INCOMING' ? 'Zahler' : 'Empfänger'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{p.customer?.name || p.supplier?.name || "—"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Zahlungsdetails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Betrag</p>
                  <p className="text-3xl font-bold">{p.currency || "CHF"} {Number(p.amount || 0).toLocaleString("de-CH", { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zahlungsdatum</p>
                  <p className="font-medium">{formatDate(p.paymentDate)}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Methode</p>
                  <p className="font-medium">{p.method || "—"}</p>
                </div>
                {p.reference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Referenz</p>
                    <p className="font-mono text-sm">{p.reference}</p>
                  </div>
                )}
              </div>
              {p.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Bemerkungen</p>
                    <p className="font-medium">{p.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {p.status === "PENDING" ? <Clock className="h-8 w-8 text-warning" /> : <CheckCircle className="h-8 w-8 text-success" />}
                <div>
                  <p className="font-medium">{statusLabels[p.status] || p.status}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(p.paymentDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(p.invoiceId || p.purchaseInvoiceId) && (
            <Card>
              <CardHeader><CardTitle>Verknüpfter Beleg</CardTitle></CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full gap-2" onClick={() => navigate(p.invoiceId ? `/invoices/${p.invoiceId}` : `/purchase-invoices/${p.purchaseInvoiceId}`)}>
                  <FileText className="h-4 w-4" />
                  {p.invoiceId || p.purchaseInvoiceId}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
