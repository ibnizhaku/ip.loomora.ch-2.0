import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { downloadPdf } from "@/lib/api";
import { 
  ArrowLeft, 
  FileText, 
  Building2,
  Clock,
  Printer,
  MoreHorizontal,
  Download,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Ban,
  Loader2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { usePurchaseInvoice, useUpdatePurchaseInvoice, useRecordPayment } from "@/hooks/use-purchase-invoices";
import { useEntityHistory } from "@/hooks/use-audit-log";

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
  const updateInvoice = useUpdatePurchaseInvoice();
  const recordPaymentMutation = useRecordPayment();
  const { data: auditHistory } = useEntityHistory("PURCHASE_INVOICE", id || "");

  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    method: "BANK_TRANSFER",
    note: "",
  });

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

  const isCancellable = pi.status !== "CANCELLED" && pi.status !== "PAID";

  const handleCancel = () => {
    updateInvoice.mutate(
      { id: id || "", data: { status: "CANCELLED" } },
      {
        onSuccess: () => {
          toast.success("Rechnung storniert");
          setCancelDialogOpen(false);
          setCancelReason("");
        },
        onError: () => toast.error("Fehler beim Stornieren"),
      }
    );
  };

  const handleRecordPayment = () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error("Bitte gültigen Betrag eingeben");
      return;
    }
    recordPaymentMutation.mutate(
      {
        id: id || "",
        data: {
          amount: Number(paymentForm.amount),
          paymentDate: paymentForm.paymentDate,
          method: paymentForm.method,
          note: paymentForm.note || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Zahlung erfasst", {
            description: `CHF ${Number(paymentForm.amount).toLocaleString("de-CH")} am ${paymentForm.paymentDate}`,
          });
          setPaymentDialogOpen(false);
          setPaymentForm({ amount: "", paymentDate: new Date().toISOString().split("T")[0], method: "BANK_TRANSFER", note: "" });
        },
        onError: () => toast.error("Fehler beim Erfassen der Zahlung"),
      }
    );
  };

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
          {pi.status !== "CANCELLED" && pi.status !== "PAID" && (
            <Button variant="outline" size="sm" onClick={() => setPaymentDialogOpen(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Zahlung erfassen
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => {
            downloadPdf('purchase-invoices', id || '', `Einkaufsrechnung-${pi.number || pi.id}.pdf`);
            toast.success("PDF wird heruntergeladen");
          }}>
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
              {isCancellable && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => setCancelDialogOpen(true)}>
                    <Ban className="h-4 w-4 mr-2" />
                    Stornieren
                  </DropdownMenuItem>
                </>
              )}
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

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Zahlungsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              {(!pi.payments || pi.payments.length === 0) ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Zahlungen erfasst</p>
                  {pi.status !== "CANCELLED" && pi.status !== "PAID" && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setPaymentDialogOpen(true)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Zahlung erfassen
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {pi.payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-success" />
                        <div>
                          <p className="text-sm font-medium">
                            {payment.method === "BANK_TRANSFER" ? "Überweisung"
                              : payment.method === "DIRECT_DEBIT" ? "Lastschrift"
                              : payment.method === "CASH" ? "Bar"
                              : payment.method}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString("de-CH") : "—"}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-success">
                        CHF {Number(payment.amount).toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  {pi.status !== "CANCELLED" && pi.status !== "PAID" && (
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setPaymentDialogOpen(true)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Weitere Zahlung erfassen
                    </Button>
                  )}
                </div>
              )}
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
                <span className={`font-medium ${pi.isOverdue ? "text-destructive" : ""}`}>
                  {formatDate(pi.dueDate)}
                  {pi.isOverdue && <AlertTriangle className="h-3 w-3 inline ml-1" />}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Offener Betrag</span>
                <span className="font-semibold text-warning">CHF {outstanding.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Verlauf */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Verlauf
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!auditHistory || auditHistory.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-4">Noch keine Einträge</p>
              ) : (
                <div className="space-y-4">
                  {auditHistory.map((log: any, index: number) => (
                    <div key={log.id || index} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {log.action === "CREATE" ? "Erstellt" : log.action === "UPDATE" ? "Bearbeitet" : log.action === "DELETE" ? "Gelöscht" : log.action === "SEND" ? "Versendet" : log.action === "APPROVE" ? "Genehmigt" : log.action === "REJECT" ? "Abgelehnt" : log.description || log.action}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(log.createdAt || log.timestamp).toLocaleString("de-CH")}</span>
                          <span>•</span>
                          <span>{log.user ? `${log.user.firstName} ${log.user.lastName}`.trim() : "System"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechnung stornieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion markiert die Rechnung als storniert. Sie kann danach nicht mehr bearbeitet werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label className="text-sm text-muted-foreground">Stornierungsgrund (optional)</Label>
            <Textarea
              className="mt-2"
              rows={3}
              placeholder="Grund für die Stornierung..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={updateInvoice.isPending}
            >
              {updateInvoice.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ban className="h-4 w-4 mr-2" />}
              Stornieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Zahlung erfassen
            </DialogTitle>
            <DialogDescription>
              Offener Betrag: <strong>CHF {outstanding.toFixed(2)}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Betrag (CHF) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Zahlungsdatum *</Label>
              <Input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Zahlungsart</Label>
              <Select
                value={paymentForm.method}
                onValueChange={(v) => setPaymentForm(prev => ({ ...prev, method: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Überweisung</SelectItem>
                  <SelectItem value="DIRECT_DEBIT">Lastschrift</SelectItem>
                  <SelectItem value="CASH">Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notiz (optional)</Label>
              <Textarea
                rows={2}
                placeholder="Zusätzliche Informationen..."
                value={paymentForm.note}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, note: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleRecordPayment} className="gap-2">
              <CreditCard className="h-4 w-4" />
              Zahlung buchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseInvoiceDetail;
