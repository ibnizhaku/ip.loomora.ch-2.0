import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ShoppingBag, 
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
  MapPin
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

const purchaseOrderData = {
  id: "BEST-2024-0034",
  status: "Teilweise geliefert",
  supplier: {
    name: "IT Components AG",
    contact: "Peter Huber",
    email: "p.huber@itcomponents.de",
    phone: "+49 89 12345678",
    address: "Industriestraße 88, 80339 München"
  },
  createdAt: "10.01.2024",
  expectedDelivery: "25.01.2024",
  positions: [
    { id: 1, description: "Server Hardware (Dell R750)", quantity: 3, delivered: 2, unit: "Stück", price: 4500, total: 13500 },
    { id: 2, description: "SSD 2TB Enterprise", quantity: 10, delivered: 10, unit: "Stück", price: 350, total: 3500 },
    { id: 3, description: "RAM 64GB DDR4 ECC", quantity: 12, delivered: 8, unit: "Stück", price: 280, total: 3360 },
    { id: 4, description: "Netzwerk-Switch 48 Port", quantity: 2, delivered: 0, unit: "Stück", price: 1200, total: 2400 },
  ],
  subtotal: 22760,
  tax: 4324.40,
  total: 27084.40,
  deliveries: [
    { id: "WE-2024-0012", date: "18.01.2024", status: "Geprüft" },
    { id: "WE-2024-0015", date: "22.01.2024", status: "Geprüft" },
  ],
  history: [
    { date: "10.01.2024 09:15", action: "Bestellung erstellt", user: "Max Müller" },
    { date: "10.01.2024 09:30", action: "Bestellung per E-Mail versendet", user: "Max Müller" },
    { date: "11.01.2024 14:20", action: "Auftragsbestätigung erhalten", user: "System" },
    { date: "18.01.2024 10:00", action: "Teillieferung eingegangen (WE-2024-0012)", user: "Lager" },
    { date: "22.01.2024 11:30", action: "Teillieferung eingegangen (WE-2024-0015)", user: "Lager" },
  ]
};

const statusConfig: Record<string, { color: string }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground" },
  "Bestellt": { color: "bg-info/10 text-info" },
  "Teilweise geliefert": { color: "bg-warning/10 text-warning" },
  "Vollständig geliefert": { color: "bg-success/10 text-success" },
  "Storniert": { color: "bg-destructive/10 text-destructive" },
};

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const status = statusConfig[purchaseOrderData.status] || statusConfig["Entwurf"];

  const totalOrdered = purchaseOrderData.positions.reduce((sum, pos) => sum + pos.quantity, 0);
  const totalDelivered = purchaseOrderData.positions.reduce((sum, pos) => sum + pos.delivered, 0);
  const deliveryProgress = Math.round((totalDelivered / totalOrdered) * 100);

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
              <h1 className="font-display text-2xl font-bold">{purchaseOrderData.id}</h1>
              <Badge className={status.color}>
                {purchaseOrderData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{purchaseOrderData.supplier.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Truck className="h-4 w-4 mr-2" />
            Wareneingang erfassen
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Rechnung zuordnen
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
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
              <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
              <DropdownMenuItem>Duplizieren</DropdownMenuItem>
              <DropdownMenuItem>Per E-Mail senden</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Stornieren</DropdownMenuItem>
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
              <p className="font-semibold">{purchaseOrderData.expectedDelivery}</p>
            </div>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
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
                    <TableHead className="w-[35%]">Beschreibung</TableHead>
                    <TableHead className="text-right">Bestellt</TableHead>
                    <TableHead className="text-right">Geliefert</TableHead>
                    <TableHead>Einheit</TableHead>
                    <TableHead className="text-right">Einzelpreis</TableHead>
                    <TableHead className="text-right">Gesamt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrderData.positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.description}</TableCell>
                      <TableCell className="text-right">{pos.quantity}</TableCell>
                      <TableCell className="text-right">
                        <span className={pos.delivered === pos.quantity ? "text-success" : "text-warning"}>
                          {pos.delivered}
                        </span>
                      </TableCell>
                      <TableCell>{pos.unit}</TableCell>
                      <TableCell className="text-right">€{pos.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">€{pos.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Zwischensumme (netto)</span>
                  <span>€{purchaseOrderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MwSt. (19%)</span>
                  <span>€{purchaseOrderData.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gesamtbetrag</span>
                  <span className="text-primary">€{purchaseOrderData.total.toFixed(2)}</span>
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
              {purchaseOrderData.deliveries.length > 0 ? (
                <div className="space-y-3">
                  {purchaseOrderData.deliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{delivery.id}</p>
                          <p className="text-sm text-muted-foreground">{delivery.date}</p>
                        </div>
                      </div>
                      <Badge className="bg-success/10 text-success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {delivery.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Noch keine Wareneingänge erfasst.</p>
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
                {purchaseOrderData.history.map((entry, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
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
                  <Link to="/suppliers/1" className="font-medium hover:text-primary">
                    {purchaseOrderData.supplier.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{purchaseOrderData.supplier.contact}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{purchaseOrderData.supplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{purchaseOrderData.supplier.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{purchaseOrderData.supplier.address}</span>
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bestelldatum</span>
                <span className="font-medium">{purchaseOrderData.createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Liefertermin</span>
                <span className="font-medium">{purchaseOrderData.expectedDelivery}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Positionen</span>
                <span className="font-medium">{purchaseOrderData.positions.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bestellwert</span>
                <span className="font-semibold">€{purchaseOrderData.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetail;
