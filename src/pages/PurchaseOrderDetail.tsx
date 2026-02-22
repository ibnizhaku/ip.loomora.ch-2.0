import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2,
  Mail,
  Phone,
  Clock,
  Printer,
  MoreHorizontal,
  Download,
  Truck,
  CheckCircle2,
  FileText,
  Package,
  MapPin,
  Send,
  Copy,
  Edit,
  XCircle,
  Loader2,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { generatePurchaseOrderPDF, getPurchaseOrderPDFBase64 } from "@/lib/pdf/purchase-order-pdf";
import { SendEmailModal } from "@/components/email/SendEmailModal";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { usePurchaseOrder, useUpdatePurchaseOrder } from "@/hooks/use-purchase-orders";
import { useEntityHistory } from "@/hooks/use-audit-log";

type OrderStatus = 'Entwurf' | 'Bestellt' | 'Auftragsbestätigt' | 'Teilweise geliefert' | 'Vollständig geliefert' | 'Storniert';

// Map API status to display status
const apiStatusToDisplay: Record<string, OrderStatus> = {
  DRAFT: "Entwurf",
  SENT: "Bestellt",
  CONFIRMED: "Auftragsbestätigt",
  PARTIAL: "Teilweise geliefert",
  RECEIVED: "Vollständig geliefert",
  CANCELLED: "Storniert",
};

const displayStatusToApi: Record<OrderStatus, string> = {
  "Entwurf": "DRAFT",
  "Bestellt": "SENT",
  "Auftragsbestätigt": "CONFIRMED",
  "Teilweise geliefert": "PARTIAL",
  "Vollständig geliefert": "RECEIVED",
  "Storniert": "CANCELLED",
};

const statusConfig: Record<OrderStatus, { color: string; icon: React.ElementType }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileText },
  "Bestellt": { color: "bg-info/10 text-info border-info/20", icon: Send },
  "Auftragsbestätigt": { color: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle2 },
  "Teilweise geliefert": { color: "bg-warning/10 text-warning border-warning/20", icon: Package },
  "Vollständig geliefert": { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  "Storniert": { color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  "Entwurf": ["Bestellt", "Storniert"],
  "Bestellt": ["Auftragsbestätigt", "Storniert"],
  "Auftragsbestätigt": ["Teilweise geliefert", "Vollständig geliefert", "Storniert"],
  "Teilweise geliefert": ["Vollständig geliefert", "Storniert"],
  "Vollständig geliefert": [],
  "Storniert": [],
};

function formatCHF(amount: number): string {
  return (amount || 0).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function safeDate(d?: string | null): Date | null {
  if (!d) return null;
  try { const date = new Date(d); return isNaN(date.getTime()) ? null : date; } catch { return null; }
}

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // API hooks
  const { data: apiData, isLoading, error } = usePurchaseOrder(id || "");
  const updateOrder = useUpdatePurchaseOrder();
  const { data: auditHistory } = useEntityHistory("purchase_order", id || "");
  
  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [goodsReceiptDialogOpen, setGoodsReceiptDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  
  // Email form state
  const [emailForm, setEmailForm] = useState({
    recipient: "",
    subject: "",
    message: "",
  });

  // Map API data
  const orderData = useMemo(() => {
    if (!apiData) return null;
    const displayStatus = apiStatusToDisplay[apiData.status] || "Entwurf";
    const items = (apiData.items || []).map((item: any, idx: number) => ({
      id: idx + 1,
      sku: item.productId || `POS-${idx + 1}`,
      description: item.description || "—",
      quantity: item.quantity || 0,
      delivered: item.delivered ?? 0,
      unit: item.unit || "Stück",
      price: item.unitPrice || 0,
      total: item.total ?? (item.quantity || 0) * (item.unitPrice || 0),
    }));
    return {
      id: apiData.number || apiData.id || id,
      status: displayStatus,
      supplier: {
        id: apiData.supplier?.id || apiData.supplierId || "",
        name: apiData.supplier?.name || apiData.supplier?.companyName || "—",
        number: (apiData.supplier as any)?.number || "—",
        contact: (apiData.supplier as any)?.contact || "—",
        email: (apiData.supplier as any)?.email || "",
        phone: (apiData.supplier as any)?.phone || "",
        address: (apiData.supplier as any)?.address || "",
        city: (apiData.supplier as any)?.city || "",
      },
      project: apiData.project ? {
        id: apiData.project.id,
        name: apiData.project.name,
        number: (apiData.project as any)?.number || "",
      } : null,
      createdAt: apiData.orderDate || apiData.createdAt,
      expectedDelivery: apiData.expectedDate || apiData.createdAt,
      positions: items,
      subtotal: apiData.subtotal || 0,
      vatRate: apiData.vatAmount && apiData.subtotal ? Math.round((apiData.vatAmount / apiData.subtotal) * 1000) / 10 : 8.1,
      tax: apiData.vatAmount || 0,
      total: apiData.total || 0,
      notes: apiData.notes || "",
      deliveries: (apiData as any)?.deliveries || [],
      history: (apiData as any)?.history || [],
      createdByName: (apiData as any)?.createdByName || null,
    };
  }, [apiData, id]);

  // Goods receipt items derived from orderData
  const receiptItems = useMemo(() => {
    if (!orderData) return [];
    return orderData.positions.map(pos => ({
      positionId: pos.id,
      description: pos.description,
      ordered: pos.quantity,
      alreadyDelivered: pos.delivered,
      receiving: 0,
    }));
  }, [orderData]);

  const [receiptState, setReceiptState] = useState<{ positionId: number; receiving: number }[]>([]);

  // Loading / Error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Bestellung nicht gefunden</p>
        <Link to="/purchase-orders" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const status = statusConfig[orderData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;

  const totalOrdered = orderData.positions.reduce((sum, pos) => sum + pos.quantity, 0);
  const totalDelivered = orderData.positions.reduce((sum, pos) => sum + pos.delivered, 0);
  const deliveryProgress = totalOrdered > 0 ? Math.round((totalDelivered / totalOrdered) * 100) : 0;

  const availableStatusChanges = statusFlow[orderData.status] || [];

  // Status change handler
  const handleStatusChange = (targetStatus: OrderStatus) => {
    setNewStatus(targetStatus);
    if (targetStatus === "Storniert") {
      setCancelDialogOpen(true);
    } else {
      setStatusDialogOpen(true);
    }
  };

  const confirmStatusChange = () => {
    if (!newStatus) return;
    const apiStatus = displayStatusToApi[newStatus];
    updateOrder.mutate({ id: id || "", data: { status: apiStatus } }, {
      onSuccess: () => {
        toast.success("Status aktualisiert", { description: `Bestellung ist jetzt: ${newStatus}` });
        setStatusDialogOpen(false);
        setNewStatus(null);
      },
      onError: () => toast.error("Fehler beim Status-Update"),
    });
  };

  const confirmCancel = () => {
    updateOrder.mutate({ id: id || "", data: { status: "CANCELLED" } }, {
      onSuccess: () => {
        toast.success("Bestellung storniert");
        setCancelDialogOpen(false);
        setNewStatus(null);
      },
      onError: () => toast.error("Fehler beim Stornieren"),
    });
  };

  const buildPdfData = () => ({
    orderNumber: orderData.number || orderData.id,
    supplier: { name: orderData.supplier.name, number: orderData.supplier.number || '', city: `${orderData.supplier.address || ''} ${orderData.supplier.city || ''}`.trim() },
    items: (orderData.positions || []).map(pos => ({ sku: pos.sku || '', name: pos.description || '', quantity: pos.quantity, unit: pos.unit || 'Stk', unitPrice: pos.price, total: pos.total })),
    subtotal: orderData.subtotal, vat: orderData.tax, total: orderData.total,
    expectedDelivery: orderData.expectedDelivery, project: orderData.project, notes: orderData.notes,
    createdBy: orderData.createdByName || null,
  });

  // PDF handlers
  const handleDownloadPDF = () => {
    generatePurchaseOrderPDF(buildPdfData());
    toast.success("PDF heruntergeladen");
  };

  const handlePrint = () => { window.print(); toast.info("Druckdialog geöffnet"); };


  // Goods receipt handler
  const handleGoodsReceipt = () => {
    toast.success("Wareneingang wird erfasst...");
    setGoodsReceiptDialogOpen(false);
    navigate(`/goods-receipts/new?purchaseOrderId=${id}`);
  };

  // Duplicate handler
  const handleDuplicate = () => {
    toast.success("Bestellung dupliziert", { description: "Eine neue Bestellung wurde als Entwurf erstellt" });
    navigate("/purchase-orders/new");
  };

  // Edit handler
  const handleEdit = () => {
    if (orderData.status !== "Entwurf") { toast.error("Nur Entwürfe können bearbeitet werden"); return; }
    navigate(`/purchase-orders/${id}/edit`);
  };

  // Invoice assignment handler
  const handleAssignInvoice = () => {
    setInvoiceDialogOpen(false);
    navigate(`/purchase-invoices/new?purchaseOrderId=${id}&supplierId=${orderData.supplier.id}`);
  };

  const createdDate = safeDate(orderData.createdAt);
  const expectedDate = safeDate(orderData.expectedDelivery);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/purchase-orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{orderData.id}</h1>
              <Badge variant="outline" className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {orderData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{orderData.supplier.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {orderData.status !== "Storniert" && orderData.status !== "Vollständig geliefert" && (
            <Button variant="outline" size="sm" onClick={() => setGoodsReceiptDialogOpen(true)}>
              <Truck className="h-4 w-4 mr-2" />
              Wareneingang
            </Button>
          )}
          {(orderData.status === "Teilweise geliefert" || orderData.status === "Vollständig geliefert") && (
            <Button variant="outline" size="sm" onClick={() => setInvoiceDialogOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Rechnung zuordnen
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
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
              {orderData.status === "Entwurf" && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplizieren
              </DropdownMenuItem>
              {orderData.status !== "Storniert" && (
                <DropdownMenuItem onClick={() => {
                  setEmailForm({
                    recipient: orderData.supplier.email,
                    subject: `Einkaufsbestellung ${orderData.id}`,
                    message: `Sehr geehrte Damen und Herren,\n\nanbei erhalten Sie unsere Bestellung ${orderData.id}.\n\nBitte bestätigen Sie den Erhalt und das voraussichtliche Lieferdatum.\n\nFreundliche Grüsse\nLoomora AG`,
                  });
                  setEmailDialogOpen(true);
                }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Per E-Mail senden
                </DropdownMenuItem>
              )}
              {availableStatusChanges.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {availableStatusChanges.map(targetStatus => (
                    <DropdownMenuItem 
                      key={targetStatus}
                      onClick={() => handleStatusChange(targetStatus)}
                      className={targetStatus === "Storniert" ? "text-destructive" : ""}
                    >
                      {targetStatus === "Storniert" ? <XCircle className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      {targetStatus === "Storniert" ? "Stornieren" : `Status: ${targetStatus}`}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delivery Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Lieferfortschritt</h3>
              <p className="text-sm text-muted-foreground">
                {totalDelivered} von {totalOrdered} Artikeln geliefert ({deliveryProgress}%)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Erwartete Lieferung</p>
              <p className="font-semibold">
                {expectedDate ? format(expectedDate, 'd. MMMM yyyy', { locale: de }) : "—"}
              </p>
            </div>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${deliveryProgress === 100 ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${deliveryProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Bestellpositionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Art.-Nr.</TableHead>
                    <TableHead className="w-[35%]">Beschreibung</TableHead>
                    <TableHead className="text-right">Bestellt</TableHead>
                    <TableHead className="text-right">Geliefert</TableHead>
                    <TableHead>Einheit</TableHead>
                    <TableHead className="text-right">Einzelpreis</TableHead>
                    <TableHead className="text-right">Gesamt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData.positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-mono text-sm">{pos.sku}</TableCell>
                      <TableCell className="font-medium">{pos.description}</TableCell>
                      <TableCell className="text-right">{pos.quantity}</TableCell>
                      <TableCell className="text-right">
                        <span className={pos.delivered === pos.quantity ? "text-success font-medium" : pos.delivered > 0 ? "text-warning font-medium" : "text-muted-foreground"}>
                          {pos.delivered}
                        </span>
                      </TableCell>
                      <TableCell>{pos.unit}</TableCell>
                      <TableCell className="text-right">CHF {formatCHF(pos.price)}</TableCell>
                      <TableCell className="text-right font-medium">CHF {formatCHF(pos.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Zwischensumme (netto)</span>
                  <span>CHF {formatCHF(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MwSt. ({orderData.vatRate}%)</span>
                  <span>CHF {formatCHF(orderData.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gesamtbetrag</span>
                  <span className="text-primary">CHF {formatCHF(orderData.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliveries */}
          <Card>
            <CardHeader>
              <CardTitle>Wareneingänge</CardTitle>
            </CardHeader>
            <CardContent>
              {orderData.deliveries.length > 0 ? (
                <div className="space-y-3">
                  {orderData.deliveries.map((delivery: any) => {
                    const deliveryDate = safeDate(delivery.date);
                    return (
                      <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{delivery.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {deliveryDate ? format(deliveryDate, 'd. MMMM yyyy', { locale: de }) : "—"}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-success/10 text-success border-success/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {delivery.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Noch keine Wareneingänge erfasst.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Verlauf
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!auditHistory || auditHistory.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Noch keine Verlaufseinträge.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditHistory.map((log: any, index: number) => (
                    <div key={log.id || index} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {log.action === "CREATE" ? "Erstellt"
                            : log.action === "UPDATE" ? "Bearbeitet"
                            : log.action === "DELETE" ? "Gelöscht"
                            : log.action === "SEND" ? "Versendet"
                            : log.action === "STATUS_CHANGE" ? "Status geändert"
                            : log.description || log.action}
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
                  <Link to={`/suppliers/${orderData.supplier.id}`} className="font-medium hover:text-primary">
                    {orderData.supplier.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{orderData.supplier.contact}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                {orderData.supplier.email && (
                  <a href={`mailto:${orderData.supplier.email}`} className="flex items-center gap-2 hover:text-primary">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{orderData.supplier.email}</span>
                  </a>
                )}
                {orderData.supplier.phone && (
                  <a href={`tel:${orderData.supplier.phone}`} className="flex items-center gap-2 hover:text-primary">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{orderData.supplier.phone}</span>
                  </a>
                )}
                {orderData.supplier.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{orderData.supplier.address}<br/>{orderData.supplier.city}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project */}
          {orderData.project && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projekt</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={`/projects/${orderData.project.id}`} className="flex items-center gap-3 hover:text-primary">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                    <FileText className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="font-medium">{orderData.project.name}</p>
                    <p className="text-sm text-muted-foreground">{orderData.project.number}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bestelldatum</span>
                <span className="font-medium">
                  {createdDate ? format(createdDate, 'd. MMM yyyy', { locale: de }) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Liefertermin</span>
                <span className="font-medium">
                  {expectedDate ? format(expectedDate, 'd. MMM yyyy', { locale: de }) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Positionen</span>
                <span className="font-medium">{orderData.positions.length}</span>
              </div>
              {orderData.createdByName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ersteller</span>
                  <span className="font-medium">{orderData.createdByName}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bestellwert</span>
                <span className="font-semibold">CHF {formatCHF(orderData.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {orderData.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bemerkungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{orderData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Status ändern</DialogTitle>
            <DialogDescription>
              Möchten Sie den Status dieser Bestellung auf "{newStatus}" ändern?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={confirmStatusChange} disabled={updateOrder.isPending}>
              {updateOrder.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bestellung stornieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Bestellung wird als storniert markiert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <XCircle className="h-4 w-4 mr-2" />
              Stornieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Modal (same as invoices) */}
      <SendEmailModal
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        documentType="purchase-order"
        documentId={id || ""}
        documentNumber={orderData.number || orderData.id}
        defaultRecipient={orderData.supplier.email}
        companyName={orderData.supplier.name}
        prebuiltPdfBase64={emailDialogOpen ? getPurchaseOrderPDFBase64(buildPdfData()) : undefined}
        prebuiltPdfFilename={`Einkaufsbestellung-${orderData.number || orderData.id}.pdf`}
      />

      {/* Goods Receipt Dialog */}
      <Dialog open={goodsReceiptDialogOpen} onOpenChange={setGoodsReceiptDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Wareneingang erfassen</DialogTitle>
            <DialogDescription>Geben Sie die erhaltenen Mengen ein</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artikel</TableHead>
                  <TableHead className="text-right">Bestellt</TableHead>
                  <TableHead className="text-right">Bereits geliefert</TableHead>
                  <TableHead className="text-right">Offen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receiptItems.map((item) => {
                  const open = item.ordered - item.alreadyDelivered;
                  return (
                    <TableRow key={item.positionId}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.ordered}</TableCell>
                      <TableCell className="text-right">{item.alreadyDelivered}</TableCell>
                      <TableCell className="text-right">
                        <span className={open === 0 ? "text-success" : "text-warning"}>{open}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoodsReceiptDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleGoodsReceipt}>
              <Truck className="h-4 w-4 mr-2" />
              Wareneingang erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Assignment Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechnung zuordnen</DialogTitle>
            <DialogDescription>Weisen Sie eine Einkaufsrechnung dieser Bestellung zu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Bestellung</Label>
              <Input value={orderData.id || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Lieferant</Label>
              <Input value={orderData.supplier.name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Bestellwert</Label>
              <Input value={`CHF ${formatCHF(orderData.total)}`} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleAssignInvoice}>
              <FileText className="h-4 w-4 mr-2" />
              Neue Rechnung erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrderDetail;
