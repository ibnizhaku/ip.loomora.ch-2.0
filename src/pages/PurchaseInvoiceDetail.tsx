import { useParams, Link, useNavigate } from "react-router-dom";
import { downloadPdf } from "@/lib/api";
import { 
  ArrowLeft, 
  FileText, 
  Building2,
  Mail,
  Phone,
  Clock,
  Printer,
  MoreHorizontal,
  Download,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Ban,
  MapPin,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { usePurchaseInvoice } from "@/hooks/use-purchase-invoices";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  DRAFT: { color: "bg-muted text-muted-foreground", icon: FileText, label: "Entwurf" },
  PENDING: { color: "bg-warning/10 text-warning", icon: Clock, label: "Offen" },
  APPROVED: { color: "bg-info/10 text-info", icon: CheckCircle2, label: "Freigegeben" },
  PAID: { color: "bg-success/10 text-success", icon: CheckCircle2, label: "Bezahlt" },
  CANCELLED: { color: "bg-muted text-muted-foreground", icon: Ban, label: "Storniert" },
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

const PurchaseInvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, isLoading, error } = usePurchaseInvoice(id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !raw) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Einkaufsrechnung nicht gefunden</p>
        <Link to="/purchase-invoices" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const pi = raw as any;
  const status = statusConfig[pi.status] || statusConfig.DRAFT;
  const StatusIcon = status.icon;
  const outstanding = Number(pi.openAmount ?? (pi.total - (pi.paidAmount || 0))) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/purchase-invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{pi.number || pi.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Lieferantenrechnung {pi.externalNumber || ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Zahlungserfassung wird geöffnet...")}>
            <CreditCard className="h-4 w-4 mr-2" />
            Zahlung erfassen
          </Button>
          <Button variant="outline" size="sm" onClick={() => { downloadPdf('invoices', id || '', `Einkaufsrechnung-${pi.number || pi.id}.pdf`); toast.success("PDF wird heruntergeladen"); }}>
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
              <DropdownMenuItem onClick={() => navigate(`/purchase-invoices/${id}/edit`)}>Bearbeiten</DropdownMenuItem>
              {pi.purchaseOrderId && (
                <DropdownMenuItem onClick={() => navigate(`/purchase-orders/${pi.purchaseOrder?.id || pi.purchaseOrderId}`)}>Bestellung anzeigen</DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => toast.info("Rechnung wird storniert...")}>Stornieren</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
                  {(pi.items || []).map((item: any, idx: number) => (
                    <TableRow key={item.id || idx}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>{item.unit || "Stück"}</TableCell>
                      <TableCell className="text-right">CHF {Number(item.unitPrice || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">CHF {Number(item.total || item.quantity * item.unitPrice || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Zwischensumme (netto)</span>
                  <span>CHF {Number(pi.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MwSt. (8.1%)</span>
                  <span>CHF {Number(pi.vatAmount || 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gesamtbetrag</span>
                  <span>CHF {Number(pi.total || 0).toFixed(2)}</span>
                </div>
                {(pi.paidAmount || 0) > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-success">
                      <span>Bezahlt</span>
                      <span>-CHF {Number(pi.paidAmount).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg text-warning">
                      <span>Offener Betrag</span>
                      <span>CHF {outstanding.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payments placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Zahlungsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Noch keine Zahlungen erfasst</p>
                <Button variant="outline" size="sm" className="mt-3">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Zahlung erfassen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Supplier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lieferant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link to={`/suppliers/${pi.supplier?.id || pi.supplierId}`} className="font-medium hover:text-primary">
                    {pi.supplier?.name || pi.supplier?.companyName || "Unbekannt"}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pi.purchaseOrderId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bestellung</span>
                  <Link to={`/purchase-orders/${pi.purchaseOrder?.id || pi.purchaseOrderId}`} className="font-medium hover:text-primary">
                    {pi.purchaseOrder?.number || pi.purchaseOrderId}
                  </Link>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rechnungsnummer</span>
                <span className="font-medium">{pi.externalNumber || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rechnungsdatum</span>
                <span className="font-medium">{formatDate(pi.invoiceDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fällig am</span>
                <span className="font-medium">{formatDate(pi.dueDate)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Offener Betrag</span>
                <span className="font-semibold text-warning">CHF {outstanding.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoiceDetail;
