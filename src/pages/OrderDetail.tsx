import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder, useCreateOrder, useUpdateOrder } from "@/hooks/use-sales";
import { useCompany } from "@/hooks/use-company";
import { Loader2 } from "lucide-react";

import { 
  ArrowLeft, 
  ShoppingCart, 
  Calendar, 
  Euro, 
  Building2,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  FileText,
  Printer,
  MoreHorizontal,
  AlertCircle,
  MapPin,
  Download,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { CreateDeliveryNoteDialog } from "@/components/documents/CreateDeliveryNoteDialog";
import { SalesDocumentData, downloadSalesDocumentPDF } from "@/lib/pdf/sales-document";

// Unified progress function (synced with Orders.tsx)
function getOrderProgress(status: string): number {
  switch (status?.toUpperCase()) {
    case "DRAFT": return 10;
    case "SENT": return 33;
    case "CONFIRMED": return 66;
    case "CANCELLED": return 0;
    default: return 10;
  }
}

// Status mapping from backend enum to German display labels
const statusLabelMap: Record<string, string> = {
  DRAFT: "Neu",
  SENT: "In Bearbeitung",
  CONFIRMED: "Abgeschlossen",
  CANCELLED: "Storniert",
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return dateStr; }
}

function mapOrderToView(order: any) {
  const items = order.items || [];
  const total = Number(order.total) || 0;
  const paidAmount = Number(order.paidAmount) || 0;
  const rawStatus = order.status || "DRAFT";

  return {
    id: order.number || order.id,
    rawStatus,
    status: statusLabelMap[rawStatus] || rawStatus || "Neu",
    progress: getOrderProgress(rawStatus),
    customer: {
      id: order.customer?.id,
      name: order.customer?.name || "Unbekannt",
      contact: order.customer?.contactPerson || order.customer?.companyName || "",
      address: [order.customer?.street, [order.customer?.zipCode, order.customer?.city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    },
    quote: order.quote?.number || "",
    quoteId: order.quote?.id || order.quoteId || "",
    createdAt: formatDate(order.orderDate || order.createdAt),
    deliveryDate: formatDate(order.deliveryDate),
    positions: items.map((item: any, idx: number) => ({
      id: item.id || String(idx + 1),
      description: item.description || "",
      quantity: item.quantity || 0,
      unit: item.unit || "Stk",
      status: "In Arbeit",
      progress: 0,
    })),
    total,
    paid: paidAmount,
    milestones: [] as { name: string; date: string; completed: boolean }[],
    deliveries: (order.deliveryNotes || []).map((dn: any) => ({
      id: dn.id,
      number: dn.number || dn.id,
      date: formatDate(dn.deliveryDate || dn.createdAt),
      status: dn.status === "DELIVERED" ? "Geliefert" : dn.status === "SHIPPED" ? "Versendet" : "Entwurf",
    })),
    deliveryAddress: order.deliveryAddress || null,
  };
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Neu": { color: "bg-info/10 text-info", icon: ShoppingCart },
  "In Bearbeitung": { color: "bg-warning/10 text-warning", icon: Clock },
  "Abgeschlossen": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Storniert": { color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const positionStatusColors: Record<string, string> = {
  "Abgeschlossen": "bg-success/10 text-success",
  "In Arbeit": "bg-warning/10 text-warning",
  "Geplant": "bg-muted text-muted-foreground",
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rawOrder, isLoading, error } = useOrder(id || "");
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const { data: companyData } = useCompany();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !rawOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Auftrag nicht gefunden</p>
        <Link to="/orders" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const orderData = mapOrderToView(rawOrder);
  
  const status = statusConfig[orderData.status] || statusConfig["Neu"];
  const StatusIcon = status.icon;

  // Prepare PDF data - use raw ISO dates, not formatted strings
  const pdfData: SalesDocumentData = {
    type: 'order',
    number: orderData.id,
    date: (rawOrder as any)?.orderDate || (rawOrder as any)?.date || (rawOrder as any)?.createdAt || new Date().toISOString().split("T")[0],
    deliveryDate: (rawOrder as any)?.deliveryDate || undefined,
    reference: orderData.quote,
    company: {
      name: companyData?.name || "—",
      street: companyData?.street || "",
      postalCode: companyData?.zipCode || "",
      city: companyData?.city || "",
      phone: companyData?.phone || "",
      email: companyData?.email || "",
      vatNumber: companyData?.vatNumber || "",
    },
    customer: {
      name: (rawOrder as any)?.customer?.companyName || orderData.customer.name,
      contact: "",
      street: (rawOrder as any)?.customer?.street || orderData.customer.address.split(',')[0],
      postalCode: (rawOrder as any)?.customer?.zipCode || orderData.customer.address.split(',')[1]?.trim().split(' ')[0] || '',
      city: (rawOrder as any)?.customer?.city || orderData.customer.address.split(',')[1]?.trim().split(' ').slice(1).join(' ') || '',
    },
    deliveryAddress: (rawOrder as any)?.deliveryAddress ? {
      company: (rawOrder as any).deliveryAddress.company,
      street: (rawOrder as any).deliveryAddress.street,
      zipCode: (rawOrder as any).deliveryAddress.zipCode,
      city: (rawOrder as any).deliveryAddress.city,
      country: (rawOrder as any).deliveryAddress.country,
    } : undefined,
    positions: orderData.positions.map((pos, idx) => ({
      position: idx + 1,
      description: pos.description,
      quantity: pos.quantity,
      unit: pos.unit || "Stk",
      unitPrice: orderData.positions.length > 0 ? orderData.total / orderData.positions.length : 0,
      total: orderData.positions.length > 0 ? orderData.total / orderData.positions.length : 0,
    })),
    subtotal: orderData.total / 1.081,
    vatRate: 8.1,
    vatAmount: orderData.total - (orderData.total / 1.081),
    total: orderData.total,
    deliveryTerms: "Lieferung frei Haus",
    paymentTerms: "30 Tage netto",
  };

  const handleDownloadPDF = () => {
    downloadSalesDocumentPDF(pdfData);
    toast.success("PDF heruntergeladen");
  };

  const handleDuplicate = async () => {
    try {
      const raw = rawOrder as any;
      const dup = await createOrder.mutateAsync({
        customerId: raw.customerId || raw.customer?.id,
        projectId: raw.projectId,
        notes: raw.notes,
        orderDate: new Date().toISOString().split("T")[0],
        items: (raw.items || []).map((item: any, idx: number) => ({
          position: idx + 1,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
        })),
      } as any);
      toast.success("Auftrag wurde dupliziert");
      navigate(`/orders/${(dup as any).id}`);
    } catch {
      toast.error("Fehler beim Duplizieren");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Auftrag wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.")) return;
    try {
      await updateOrder.mutateAsync({ id: id!, data: { status: "CANCELLED" } as any });
      toast.success("Auftrag wurde storniert");
    } catch {
      toast.error("Fehler beim Stornieren");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{orderData.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {orderData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{orderData.customer.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPDFPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDeliveryDialog(true)}>
            <Truck className="h-4 w-4 mr-2" />
            Lieferschein erstellen
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/new?orderId=${id}&customerId=${orderData.customer.id || ''}`)}>
            <FileText className="h-4 w-4 mr-2" />
            Rechnung erstellen
          </Button>
          <Button variant="outline" size="sm">
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
              <DropdownMenuItem onClick={() => navigate(`/orders/${id}/edit`)}>Bearbeiten</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate} disabled={createOrder.isPending}>
                {createOrder.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Duplizieren
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleCancel} disabled={updateOrder.isPending}>
                Stornieren
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Auftragsfortschritt</h3>
              <p className="text-sm text-muted-foreground">
                {orderData.progress}% abgeschlossen
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Liefertermin</p>
              <p className="font-semibold">{orderData.deliveryDate}</p>
            </div>
          </div>
          <Progress value={orderData.progress} className="h-3" />

          {/* Milestones */}
          <div className="flex justify-between mt-6">
            {orderData.milestones.map((milestone, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  milestone.completed ? "bg-success text-success-foreground" : "bg-muted"
                }`}>
                  {milestone.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <p className="text-xs font-medium mt-2 max-w-[80px]">{milestone.name}</p>
                <p className="text-xs text-muted-foreground">{milestone.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Auftragspositionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Beschreibung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fortschritt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData.positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={positionStatusColors[pos.status]}>
                          {pos.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pos.progress} className="h-2 w-20" />
                          <span className="text-sm text-muted-foreground">{pos.progress}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Lieferscheine */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Lieferscheine</CardTitle>
              <Button size="sm" onClick={() => setShowDeliveryDialog(true)}>
                <Truck className="h-4 w-4 mr-2" />
                Lieferschein erstellen
              </Button>
            </CardHeader>
            <CardContent>
              {orderData.deliveries.length > 0 ? (
                <div className="space-y-3">
                  {orderData.deliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/delivery-notes/${delivery.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Truck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm hover:text-primary">{delivery.number}</p>
                          <p className="text-xs text-muted-foreground">{delivery.date}</p>
                        </div>
                      </div>
                      <Badge className={
                        delivery.status === "Geliefert" ? "bg-success/10 text-success" :
                        delivery.status === "Versendet" ? "bg-warning/10 text-warning" :
                        "bg-muted text-muted-foreground"
                      }>{delivery.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border rounded-lg">
                  <Truck className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Noch kein Lieferschein vorhanden</p>
                  <p className="text-xs text-muted-foreground mt-1">Erstellen Sie den ersten Lieferschein für diesen Auftrag</p>
                  <Button size="sm" className="mt-3" onClick={() => setShowDeliveryDialog(true)}>
                    <Truck className="h-4 w-4 mr-2" />
                    Lieferschein erstellen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kunde</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link to={`/customers/${orderData.customer.id || ''}`} className="font-medium hover:text-primary">
                    {orderData.customer.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{orderData.customer.contact}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{orderData.customer.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          {orderData.deliveryAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Lieferadresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    {orderData.deliveryAddress.company && (
                      <p className="font-medium">{orderData.deliveryAddress.company}</p>
                    )}
                    {orderData.deliveryAddress.street && (
                      <p>{orderData.deliveryAddress.street}</p>
                    )}
                    {(orderData.deliveryAddress.zipCode || orderData.deliveryAddress.city) && (
                      <p>{orderData.deliveryAddress.zipCode} {orderData.deliveryAddress.city}</p>
                    )}
                    {orderData.deliveryAddress.country && orderData.deliveryAddress.country !== "CH" && (
                      <p className="text-muted-foreground">{orderData.deliveryAddress.country}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Finanzen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Auftragswert</span>
                <span className="font-semibold">CHF {orderData.total.toLocaleString("de-CH")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bezahlt</span>
                <span className="font-medium text-success">CHF {orderData.paid.toLocaleString("de-CH")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Offen</span>
                <span className="font-medium text-warning">CHF {(orderData.total - orderData.paid).toLocaleString("de-CH")}</span>
              </div>
              <Separator />
              <Progress value={orderData.total > 0 ? (orderData.paid / orderData.total) * 100 : 0} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {orderData.total > 0 ? Math.round((orderData.paid / orderData.total) * 100) : 0}% bezahlt
              </p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Angebot</span>
                <Link to={`/quotes/${orderData.quoteId}`} className="font-medium hover:text-primary">
                  {orderData.quote || "—"}
                </Link>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Erstellt am</span>
                <span className="font-medium">{orderData.createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Liefertermin</span>
                <span className="font-medium">{orderData.deliveryDate}</span>
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
        title={`Auftrag ${orderData.id}`}
      />

      {/* Create Delivery Note Dialog */}
      <CreateDeliveryNoteDialog
        open={showDeliveryDialog}
        onOpenChange={setShowDeliveryDialog}
        orderId={id || ""}
        orderNumber={orderData.id}
        items={orderData.positions.map((pos) => ({
          id: pos.id,
          description: pos.description,
          quantity: pos.quantity,
          unit: pos.unit,
        }))}
      />
    </div>
  );
};

export default OrderDetail;
