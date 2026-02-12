import { useState } from "react";
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
  AlertCircle,
  Eye,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { generatePurchaseOrderPDF } from "@/lib/pdf/purchase-order-pdf";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type OrderStatus = 'Entwurf' | 'Bestellt' | 'Auftragsbestätigt' | 'Teilweise geliefert' | 'Vollständig geliefert' | 'Storniert';

interface Position {
  id: number;
  sku: string;
  description: string;
  quantity: number;
  delivered: number;
  unit: string;
  price: number;
  total: number;
}

interface HistoryEntry {
  date: string;
  action: string;
  user: string;
}

interface Delivery {
  id: string;
  date: string;
  status: string;
  items: { positionId: number; quantity: number }[];
}

const initialPurchaseOrderData = {
  id: "BEST-2024-0034",
  status: "Teilweise geliefert" as OrderStatus,
  supplier: {
    id: "1",
    name: "IT Components AG",
    number: "LF-001",
    contact: "Peter Huber",
    email: "p.huber@itcomponents.ch",
    phone: "+41 44 123 45 67",
    address: "Industriestrasse 88",
    city: "8005 Zürich",
  },
  project: {
    id: "proj-1",
    name: "Server Migration",
    number: "PRJ-2024-015",
  },
  createdAt: "2024-01-10",
  expectedDelivery: "2024-01-25",
  positions: [
    { id: 1, sku: "SRV-R750", description: "Server Hardware (Dell R750)", quantity: 3, delivered: 2, unit: "Stück", price: 4500, total: 13500 },
    { id: 2, sku: "SSD-2TB-E", description: "SSD 2TB Enterprise", quantity: 10, delivered: 10, unit: "Stück", price: 350, total: 3500 },
    { id: 3, sku: "RAM-64GB", description: "RAM 64GB DDR4 ECC", quantity: 12, delivered: 8, unit: "Stück", price: 280, total: 3360 },
    { id: 4, sku: "SW-48P", description: "Netzwerk-Switch 48 Port", quantity: 2, delivered: 0, unit: "Stück", price: 1200, total: 2400 },
  ] as Position[],
  subtotal: 22760,
  vatRate: 8.1,
  tax: 1843.56,
  total: 24603.56,
  notes: "Bitte Lieferung an Lager Halle 3. Kontakt: Max Mustermann, Tel. 044 111 22 33",
  deliveries: [
    { id: "WE-2024-0012", date: "2024-01-18", status: "Geprüft", items: [{ positionId: 1, quantity: 2 }, { positionId: 2, quantity: 10 }] },
    { id: "WE-2024-0015", date: "2024-01-22", status: "Geprüft", items: [{ positionId: 3, quantity: 8 }] },
  ] as Delivery[],
  history: [
    { date: "2024-01-10T09:15:00", action: "Bestellung erstellt", user: "Max Müller" },
    { date: "2024-01-10T09:30:00", action: "Bestellung per E-Mail versendet", user: "Max Müller" },
    { date: "2024-01-11T14:20:00", action: "Auftragsbestätigung erhalten", user: "System" },
    { date: "2024-01-18T10:00:00", action: "Teillieferung eingegangen (WE-2024-0012)", user: "Lager" },
    { date: "2024-01-22T11:30:00", action: "Teillieferung eingegangen (WE-2024-0015)", user: "Lager" },
  ] as HistoryEntry[],
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
  return amount.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for order data
  const [orderData, setOrderData] = useState(initialPurchaseOrderData);
  
  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [goodsReceiptDialogOpen, setGoodsReceiptDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Email form state
  const [emailForm, setEmailForm] = useState({
    recipient: orderData.supplier.email,
    subject: `Einkaufsbestellung ${orderData.id}`,
    message: `Sehr geehrte Damen und Herren,\n\nanbei erhalten Sie unsere Bestellung ${orderData.id}.\n\nBitte bestätigen Sie den Erhalt und das voraussichtliche Lieferdatum.\n\nFreundliche Grüsse\nLoomora AG`,
  });
  
  // Goods receipt form state
  const [receiptItems, setReceiptItems] = useState(
    orderData.positions.map(pos => ({
      positionId: pos.id,
      description: pos.description,
      ordered: pos.quantity,
      alreadyDelivered: pos.delivered,
      receiving: 0,
    }))
  );

  const status = statusConfig[orderData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;

  const totalOrdered = orderData.positions.reduce((sum, pos) => sum + pos.quantity, 0);
  const totalDelivered = orderData.positions.reduce((sum, pos) => sum + pos.delivered, 0);
  const deliveryProgress = totalOrdered > 0 ? Math.round((totalDelivered / totalOrdered) * 100) : 0;

  const availableStatusChanges = statusFlow[orderData.status] || [];

  // Add history entry
  const addHistoryEntry = (action: string) => {
    const newEntry: HistoryEntry = {
      date: new Date().toISOString(),
      action,
      user: "Aktueller Benutzer",
    };
    setOrderData(prev => ({
      ...prev,
      history: [newEntry, ...prev.history],
    }));
  };

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
    
    setOrderData(prev => ({
      ...prev,
      status: newStatus,
    }));
    addHistoryEntry(`Status geändert zu "${newStatus}"`);
    toast.success("Status aktualisiert", {
      description: `Bestellung ist jetzt: ${newStatus}`,
    });
    setStatusDialogOpen(false);
    setNewStatus(null);
  };

  const confirmCancel = () => {
    setOrderData(prev => ({
      ...prev,
      status: "Storniert",
    }));
    addHistoryEntry("Bestellung storniert");
    toast.success("Bestellung storniert");
    setCancelDialogOpen(false);
    setNewStatus(null);
  };

  // PDF handlers
  const handleDownloadPDF = () => {
    const pdfData = {
      orderNumber: orderData.id,
      supplier: {
        name: orderData.supplier.name,
        number: orderData.supplier.number,
        city: `${orderData.supplier.address}\n${orderData.supplier.city}`,
      },
      items: orderData.positions.map(pos => ({
        sku: pos.sku,
        name: pos.description,
        quantity: pos.quantity,
        unit: pos.unit,
        unitPrice: pos.price,
        total: pos.total,
      })),
      subtotal: orderData.subtotal,
      vat: orderData.tax,
      total: orderData.total,
      expectedDelivery: orderData.expectedDelivery,
      project: orderData.project,
      notes: orderData.notes,
    };
    
    generatePurchaseOrderPDF(pdfData);
    toast.success("PDF heruntergeladen");
  };

  const handlePrint = () => {
    // Generate PDF and open print dialog
    window.print();
    toast.info("Druckdialog geöffnet");
  };

  // Email handler
  const handleSendEmail = () => {
    // Simulate email sending
    addHistoryEntry(`Bestellung per E-Mail an ${emailForm.recipient} gesendet`);
    
    if (orderData.status === "Entwurf") {
      setOrderData(prev => ({
        ...prev,
        status: "Bestellt",
      }));
    }
    
    toast.success("E-Mail gesendet", {
      description: `Bestellung wurde an ${emailForm.recipient} gesendet`,
    });
    setEmailDialogOpen(false);
  };

  // Goods receipt handler
  const handleGoodsReceipt = () => {
    const receivingItems = receiptItems.filter(item => item.receiving > 0);
    
    if (receivingItems.length === 0) {
      toast.error("Keine Positionen zum Einbuchen");
      return;
    }

    // Update delivered quantities
    const updatedPositions = orderData.positions.map(pos => {
      const receiptItem = receiptItems.find(r => r.positionId === pos.id);
      if (receiptItem && receiptItem.receiving > 0) {
        return {
          ...pos,
          delivered: Math.min(pos.quantity, pos.delivered + receiptItem.receiving),
        };
      }
      return pos;
    });

    // Create new delivery record
    const newDelivery: Delivery = {
      id: `WE-2024-${String(orderData.deliveries.length + 20).padStart(4, '0')}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: "Geprüft",
      items: receivingItems.map(item => ({
        positionId: item.positionId,
        quantity: item.receiving,
      })),
    };

    // Check if fully delivered
    const newTotalDelivered = updatedPositions.reduce((sum, pos) => sum + pos.delivered, 0);
    const isFullyDelivered = newTotalDelivered >= totalOrdered;

    setOrderData(prev => ({
      ...prev,
      positions: updatedPositions,
      deliveries: [...prev.deliveries, newDelivery],
      status: isFullyDelivered ? "Vollständig geliefert" : "Teilweise geliefert",
    }));

    addHistoryEntry(`Wareneingang ${newDelivery.id} erfasst`);
    
    toast.success("Wareneingang erfasst", {
      description: `${newDelivery.id} wurde erstellt`,
    });
    
    setGoodsReceiptDialogOpen(false);
    
    // Reset receipt form
    setReceiptItems(updatedPositions.map(pos => ({
      positionId: pos.id,
      description: pos.description,
      ordered: pos.quantity,
      alreadyDelivered: pos.delivered,
      receiving: 0,
    })));
  };

  // Duplicate handler
  const handleDuplicate = () => {
    toast.success("Bestellung dupliziert", {
      description: "Eine neue Bestellung wurde als Entwurf erstellt",
    });
    navigate("/purchase-orders/create");
  };

  // Edit handler
  const handleEdit = () => {
    if (orderData.status !== "Entwurf") {
      toast.error("Nur Entwürfe können bearbeitet werden");
      return;
    }
    navigate(`/purchase-orders/${id}/edit`);
  };

  // Invoice assignment handler
  const handleAssignInvoice = () => {
    toast.success("Rechnung zugeordnet", {
      description: "Weiterleitung zu Einkaufsrechnungen",
    });
    addHistoryEntry("Rechnung zugeordnet");
    setInvoiceDialogOpen(false);
    navigate("/purchase-invoices/create");
  };

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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setGoodsReceiptDialogOpen(true)}
            >
              <Truck className="h-4 w-4 mr-2" />
              Wareneingang
            </Button>
          )}
          {(orderData.status === "Teilweise geliefert" || orderData.status === "Vollständig geliefert") && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setInvoiceDialogOpen(true)}
            >
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
                <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
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
                      {targetStatus === "Storniert" ? (
                        <XCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
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
                {format(new Date(orderData.expectedDelivery), 'd. MMMM yyyy', { locale: de })}
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
                  {orderData.deliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{delivery.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(delivery.date), 'd. MMMM yyyy', { locale: de })}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {delivery.status}
                      </Badge>
                    </div>
                  ))}
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
              <CardTitle>Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.history.map((entry, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{entry.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(entry.date), "d. MMM yyyy, HH:mm", { locale: de })} Uhr</span>
                        <span>•</span>
                        <span>{typeof entry.user === 'object' ? (entry.user as any)?.name || (entry.user as any)?.email : entry.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <Link to={`/suppliers/${orderData.supplier.id}`} className="font-medium hover:text-primary">
                    {orderData.supplier.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{orderData.supplier.contact}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <a 
                  href={`mailto:${orderData.supplier.email}`}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{orderData.supplier.email}</span>
                </a>
                <a 
                  href={`tel:${orderData.supplier.phone}`}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{orderData.supplier.phone}</span>
                </a>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{orderData.supplier.address}<br/>{orderData.supplier.city}</span>
                </div>
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
                <Link 
                  to={`/projects/${orderData.project.id}`}
                  className="flex items-center gap-3 hover:text-primary"
                >
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
                  {format(new Date(orderData.createdAt), 'd. MMM yyyy', { locale: de })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Liefertermin</span>
                <span className="font-medium">
                  {format(new Date(orderData.expectedDelivery), 'd. MMM yyyy', { locale: de })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Positionen</span>
                <span className="font-medium">{orderData.positions.length}</span>
              </div>
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
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {orderData.notes}
                </p>
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
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={confirmStatusChange}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
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

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bestellung per E-Mail senden</DialogTitle>
            <DialogDescription>
              Senden Sie die Bestellung an den Lieferanten
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Empfänger</Label>
              <Input 
                type="email"
                value={emailForm.recipient}
                onChange={(e) => setEmailForm({...emailForm, recipient: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Betreff</Label>
              <Input 
                value={emailForm.subject}
                onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Nachricht</Label>
              <Textarea 
                rows={6}
                value={emailForm.message}
                onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Bestellung_{orderData.id}.pdf</p>
                <p className="text-xs text-muted-foreground">Wird als Anhang mitgesendet</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goods Receipt Dialog */}
      <Dialog open={goodsReceiptDialogOpen} onOpenChange={setGoodsReceiptDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Wareneingang erfassen</DialogTitle>
            <DialogDescription>
              Geben Sie die erhaltenen Mengen ein
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artikel</TableHead>
                  <TableHead className="text-right">Bestellt</TableHead>
                  <TableHead className="text-right">Bereits geliefert</TableHead>
                  <TableHead className="text-right">Offen</TableHead>
                  <TableHead className="w-[120px]">Erhalten</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receiptItems.map((item, index) => {
                  const open = item.ordered - item.alreadyDelivered;
                  return (
                    <TableRow key={item.positionId}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.ordered}</TableCell>
                      <TableCell className="text-right">{item.alreadyDelivered}</TableCell>
                      <TableCell className="text-right">
                        <span className={open === 0 ? "text-success" : "text-warning"}>
                          {open}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min={0}
                          max={open}
                          value={item.receiving}
                          onChange={(e) => {
                            const newItems = [...receiptItems];
                            newItems[index].receiving = Math.min(parseInt(e.target.value) || 0, open);
                            setReceiptItems(newItems);
                          }}
                          className="h-8 w-20"
                          disabled={open === 0}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoodsReceiptDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleGoodsReceipt}>
              <Truck className="h-4 w-4 mr-2" />
              Wareneingang buchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Assignment Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechnung zuordnen</DialogTitle>
            <DialogDescription>
              Weisen Sie eine Einkaufsrechnung dieser Bestellung zu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Bestellung</Label>
              <Input value={orderData.id} disabled />
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
            <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
              Abbrechen
            </Button>
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
