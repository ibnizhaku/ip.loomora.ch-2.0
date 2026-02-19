import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Truck, 
  Building2,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  MoreHorizontal,
  User,
  Calendar,
  FileText,
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
import { SalesDocumentData, downloadSalesDocumentPDF, getSalesDocumentPDFDataUrl } from "@/lib/pdf/sales-document";
import { useDeliveryNote } from "@/hooks/use-delivery-notes";

// Status mapping from backend enum to German display labels
const dnStatusMap: Record<string, string> = {
  DRAFT: "Entwurf",
  SHIPPED: "Versendet",
  DELIVERED: "Geliefert",
  CANCELLED: "Storniert",
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return dateStr; }
}

function mapDeliveryNoteToView(dn: any) {
  const items = dn.items || [];
  return {
    id: dn.number || dn.id,
    status: dnStatusMap[dn.status] || dn.status || "Entwurf",
    customer: {
      id: dn.customer?.id,
      name: dn.customer?.name || dn.customerName || "Unbekannt",
      contact: dn.customer?.contactPerson || "",
      deliveryAddress: dn.deliveryAddress || [dn.customer?.street, [dn.customer?.zipCode, dn.customer?.city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
      billingAddress: [dn.customer?.street, [dn.customer?.zipCode, dn.customer?.city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    },
    order: dn.order?.number || dn.orderNumber || "",
    orderId: dn.order?.id || dn.orderId || "",
    createdAt: formatDate(dn.deliveryDate || dn.createdAt),
    deliveredAt: formatDate(dn.shippedDate || dn.deliveryDate),
    deliveredBy: dn.carrier || "—",
    trackingNumber: dn.trackingNumber || "—",
    positions: items.map((item: any, idx: number) => ({
      id: item.id || idx + 1,
      articleNo: item.product?.articleNumber || item.productId || `POS-${idx + 1}`,
      description: item.description || item.product?.name || "",
      quantity: Number(item.quantity) || 0,
      delivered: Number(item.deliveredQuantity ?? item.quantity) || 0,
    })),
    signature: null as { name: string; date: string } | null,
    notes: dn.notes || "",
    timeline: [] as { date: string; action: string; user: string }[],
  };
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileText },
  "In Vorbereitung": { color: "bg-info/10 text-info", icon: Package },
  "Versendet": { color: "bg-warning/10 text-warning", icon: Truck },
  "Geliefert": { color: "bg-success/10 text-success", icon: CheckCircle2 },
};

const DeliveryNoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rawDn, isLoading, error } = useDeliveryNote(id || "");
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !rawDn) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Lieferschein nicht gefunden</p>
        <Link to="/delivery-notes" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const deliveryNoteData = mapDeliveryNoteToView(rawDn);
  
  const status = statusConfig[deliveryNoteData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;

  // Prepare PDF data for delivery note – rohe ISO-Daten verwenden (nicht vorformatiert)
  const pdfData: SalesDocumentData = {
    type: 'delivery-note',
    number: (rawDn as any).number || deliveryNoteData.id,
    date: (rawDn as any).deliveryDate || (rawDn as any).createdAt || new Date().toISOString(),
    deliveryDate: (rawDn as any).shippedDate || (rawDn as any).deliveryDate,
    orderNumber: deliveryNoteData.order,
    company: {
      name: "Loomora Metallbau AG",
      street: "Industriestrasse 15",
      postalCode: "8005",
      city: "Zürich",
      phone: "+41 44 123 45 67",
      email: "info@loomora.ch",
    },
    customer: {
      name: deliveryNoteData.customer.name,
      contact: deliveryNoteData.customer.contact,
      street: deliveryNoteData.customer.deliveryAddress.split(',')[0],
      postalCode: deliveryNoteData.customer.deliveryAddress.split(',')[1]?.trim().split(' ')[0] || '',
      city: deliveryNoteData.customer.deliveryAddress.split(',')[1]?.trim().split(' ').slice(1).join(' ') || '',
    },
    positions: deliveryNoteData.positions.map((pos, idx) => ({
      position: idx + 1,
      description: `${pos.articleNo} - ${pos.description}`,
      quantity: pos.delivered,
      unit: "Stk",
      unitPrice: 0,
      total: 0,
    })),
    subtotal: 0,
    vatRate: 0,
    vatAmount: 0,
    total: 0,
    notes: deliveryNoteData.notes,
    deliveryTerms: `Versand: ${deliveryNoteData.deliveredBy}`,
  };

  const handleDownloadPDF = () => {
    downloadSalesDocumentPDF(pdfData);
    toast.success("PDF heruntergeladen");
  };

  const handlePrint = () => {
    const url = getSalesDocumentPDFDataUrl(pdfData);
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => { printWindow.print(); };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            if (deliveryNoteData.orderId) {
              navigate(`/orders/${deliveryNoteData.orderId}`);
            } else {
              navigate("/delivery-notes");
            }
          }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{deliveryNoteData.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {deliveryNoteData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{deliveryNoteData.customer.name}</p>
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
          <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/new?from=delivery-note&deliveryNoteId=${id}`)}>
            <FileText className="h-4 w-4 mr-2" />
            Rechnung erstellen
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
              <DropdownMenuItem onClick={() => navigate(`/delivery-notes/${id}/edit`)}>Bearbeiten</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Lieferschein wird dupliziert...")}>Duplizieren</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Sendungsverfolgung wird geöffnet...")}>Sendungsverfolgung öffnen</DropdownMenuItem>
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
              <CardTitle>Lieferpositionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Art.-Nr.</TableHead>
                    <TableHead className="w-[40%]">Beschreibung</TableHead>
                    <TableHead className="text-right">Bestellt</TableHead>
                    <TableHead className="text-right">Geliefert</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryNoteData.positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-mono text-sm">{pos.articleNo}</TableCell>
                      <TableCell className="font-medium">{pos.description}</TableCell>
                      <TableCell className="text-right">{pos.quantity}</TableCell>
                      <TableCell className="text-right">{pos.delivered}</TableCell>
                      <TableCell>
                        {pos.quantity === pos.delivered ? (
                          <Badge className="bg-success/10 text-success">Vollständig</Badge>
                        ) : (
                          <Badge className="bg-warning/10 text-warning">Teillieferung</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Signature */}
          {deliveryNoteData.signature && (
            <Card>
              <CardHeader>
                <CardTitle>Empfangsbestätigung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Empfangen von: {deliveryNoteData.signature.name}</p>
                    <p className="text-sm text-muted-foreground">{deliveryNoteData.signature.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {deliveryNoteData.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Bemerkungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{deliveryNoteData.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {deliveryNoteData.timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sendungsverlauf</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveryNoteData.timeline.map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          index === deliveryNoteData.timeline.length - 1 
                            ? "bg-success text-success-foreground" 
                            : "bg-muted"
                        }`}>
                          {index === deliveryNoteData.timeline.length - 1 ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        {index < deliveryNoteData.timeline.length - 1 && (
                          <div className="w-px h-8 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{entry.action}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{entry.date}</span>
                          <span>•</span>
                          <span>{entry.user}</span>
                        </div>
                      </div>
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
              <CardTitle className="text-base">Empfänger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link to={`/customers/${deliveryNoteData.customer.id || ''}`} className="font-medium hover:text-primary">
                    {deliveryNoteData.customer.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{deliveryNoteData.customer.contact}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">LIEFERADRESSE</p>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{deliveryNoteData.customer.deliveryAddress}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Versandinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Versanddienstleister</span>
                <span className="font-medium">{deliveryNoteData.deliveredBy}</span>
              </div>
              {deliveryNoteData.trackingNumber !== "—" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sendungsnummer</span>
                  <span className="font-mono text-xs">{deliveryNoteData.trackingNumber.slice(0, 15)}...</span>
                </div>
              )}
              <Separator />
              <Button variant="outline" size="sm" className="w-full">
                <Truck className="h-4 w-4 mr-2" />
                Sendung verfolgen
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deliveryNoteData.orderId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Auftrag</span>
                  <Link to={`/orders/${deliveryNoteData.orderId}`} className="font-medium hover:text-primary">
                    {deliveryNoteData.order || "—"}
                  </Link>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Erstellt am</span>
                <span className="font-medium">{deliveryNoteData.createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Geliefert am</span>
                <span className="font-medium">{deliveryNoteData.deliveredAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Positionen</span>
                <span className="font-medium">{deliveryNoteData.positions.length}</span>
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
        title={`Lieferschein ${deliveryNoteData.id}`}
      />
    </div>
  );
};

export default DeliveryNoteDetail;
