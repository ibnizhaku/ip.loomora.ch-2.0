import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder } from "@/hooks/use-sales";
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
import { SalesDocumentData, downloadSalesDocumentPDF } from "@/lib/pdf/sales-document";

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

  return {
    id: order.number || order.id,
    status: statusLabelMap[order.status] || order.status || "Neu",
    progress: order.status === "CONFIRMED" ? 100 : order.status === "SENT" ? 50 : 0,
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
      id: item.id || idx + 1,
      description: item.description || "",
      quantity: item.quantity || 0,
      status: "In Arbeit",
      progress: 0,
    })),
    total,
    paid: paidAmount,
    milestones: [] as { name: string; date: string; completed: boolean }[],
    deliveries: (order.deliveryNotes || []).map((dn: any) => ({
      id: dn.number || dn.id,
      date: formatDate(dn.deliveryDate || dn.createdAt),
      status: dn.status === "DELIVERED" ? "Geliefert" : dn.status === "SHIPPED" ? "Versendet" : "Entwurf",
    })),
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

  // Prepare PDF data
  const pdfData: SalesDocumentData = {
    type: 'order',
    number: orderData.id,
    date: orderData.createdAt,
    deliveryDate: orderData.deliveryDate,
    reference: orderData.quote,
    company: {
      name: "Loomora Metallbau AG",
      street: "Industriestrasse 15",
      postalCode: "8005",
      city: "Zürich",
      phone: "+41 44 123 45 67",
      email: "info@loomora.ch",
      vatNumber: "CHE-123.456.789",
    },
    customer: {
      name: orderData.customer.name,
      contact: orderData.customer.contact,
      street: orderData.customer.address.split(',')[0],
      postalCode: orderData.customer.address.split(',')[1]?.trim().split(' ')[0] || '',
      city: orderData.customer.address.split(',')[1]?.trim().split(' ').slice(1).join(' ') || '',
    },
    positions: orderData.positions.map((pos, idx) => ({
      position: idx + 1,
      description: pos.description,
      quantity: pos.quantity,
      unit: "Stk",
      unitPrice: orderData.total / orderData.positions.length,
      total: orderData.total / orderData.positions.length,
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
          <Button variant="outline" size="sm" onClick={() => navigate(`/delivery-notes/new?orderId=${id}&customerId=${orderData.customer.id || ''}`)}>
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
              <DropdownMenuItem onClick={() => { toast.info("Auftrag wird dupliziert..."); }}>Duplizieren</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Stornieren</DropdownMenuItem>
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
            <CardHeader>
              <CardTitle>Lieferscheine</CardTitle>
            </CardHeader>
            <CardContent>
              {orderData.deliveries.length > 0 ? (
                <div className="space-y-3">
                  {orderData.deliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Link to={`/delivery-notes/${delivery.id}`} className="font-medium hover:text-primary">
                            {delivery.id}
                          </Link>
                          <p className="text-sm text-muted-foreground">{delivery.date}</p>
                        </div>
                      </div>
                      <Badge className="bg-success/10 text-success">{delivery.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Noch keine Lieferscheine erstellt.</p>
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
    </div>
  );
};

export default OrderDetail;
