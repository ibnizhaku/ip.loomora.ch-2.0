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
import { toast } from "sonner";

const purchaseInvoiceData = {
  id: "ER-2024-0028",
  status: "Offen",
  supplier: {
    name: "IT Components AG",
    contact: "Peter Huber",
    email: "p.huber@itcomponents.de",
    phone: "+49 89 12345678",
    address: "Industriestraße 88, 80339 München",
    taxId: "DE987654321"
  },
  purchaseOrder: "BEST-2024-0034",
  invoiceNumber: "2024-IT-1234",
  createdAt: "28.01.2024",
  receivedAt: "27.01.2024",
  dueDate: "27.02.2024",
  positions: [
    { id: 1, description: "Server Hardware (Dell R750)", quantity: 2, unit: "Stück", price: 4500, total: 9000 },
    { id: 2, description: "SSD 2TB Enterprise", quantity: 10, unit: "Stück", price: 350, total: 3500 },
    { id: 3, description: "RAM 64GB DDR4 ECC", quantity: 8, unit: "Stück", price: 280, total: 2240 },
  ],
  subtotal: 14740,
  tax: 2800.60,
  total: 17540.60,
  payments: [],
  paid: 0,
  history: [
    { date: "27.01.2024 14:00", action: "Rechnung eingegangen", user: "Buchhaltung" },
    { date: "28.01.2024 09:30", action: "Rechnung erfasst und geprüft", user: "Anna Schmidt" },
    { date: "28.01.2024 10:00", action: "Zur Zahlung freigegeben", user: "Max Müller" },
  ]
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileText },
  "Offen": { color: "bg-warning/10 text-warning", icon: Clock },
  "Bezahlt": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Überfällig": { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  "Storniert": { color: "bg-muted text-muted-foreground", icon: Ban },
};

const PurchaseInvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const status = statusConfig[purchaseInvoiceData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;
  const outstanding = purchaseInvoiceData.total - purchaseInvoiceData.paid;

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
              <h1 className="font-display text-2xl font-bold">{purchaseInvoiceData.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {purchaseInvoiceData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Lieferantenrechnung {purchaseInvoiceData.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Zahlungserfassung wird geöffnet...")}>
            <CreditCard className="h-4 w-4 mr-2" />
            Zahlung erfassen
          </Button>
          <Button variant="outline" size="sm" onClick={() => { downloadPdf('invoices', id || '', `Einkaufsrechnung-${purchaseInvoiceData.id}.pdf`); toast.success("PDF wird heruntergeladen"); }}>
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
              <DropdownMenuItem onClick={() => navigate(`/purchase-orders/${purchaseInvoiceData.purchaseOrder}`)}>Bestellung anzeigen</DropdownMenuItem>
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
                  {purchaseInvoiceData.positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.description}</TableCell>
                      <TableCell className="text-right">{pos.quantity}</TableCell>
                      <TableCell>{pos.unit}</TableCell>
                      <TableCell className="text-right">CHF {pos.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">CHF {pos.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Zwischensumme (netto)</span>
                  <span>CHF {purchaseInvoiceData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MwSt. (8.1%)</span>
                  <span>CHF {purchaseInvoiceData.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gesamtbetrag</span>
                  <span>CHF {purchaseInvoiceData.total.toFixed(2)}</span>
                </div>
                {purchaseInvoiceData.paid > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-success">
                      <span>Bezahlt</span>
                      <span>-CHF {purchaseInvoiceData.paid.toFixed(2)}</span>
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
              {purchaseInvoiceData.payments.length > 0 ? (
                <div className="space-y-3">
                  {/* Payments would be listed here */}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Zahlungen erfasst</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Zahlung erfassen
                  </Button>
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
                {purchaseInvoiceData.history.map((entry, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{entry.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{entry.date}</span>
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
                  <Link to="/suppliers/1" className="font-medium hover:text-primary">
                    {purchaseInvoiceData.supplier.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{purchaseInvoiceData.supplier.contact}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{purchaseInvoiceData.supplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{purchaseInvoiceData.supplier.phone}</span>
                </div>
              </div>

              <Separator />

              <div className="text-sm">
                <span className="text-muted-foreground">USt-IdNr.: </span>
                <span>{purchaseInvoiceData.supplier.taxId}</span>
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
                <span className="text-muted-foreground">Bestellung</span>
                <Link to={`/purchase-orders/${purchaseInvoiceData.purchaseOrder}`} className="font-medium hover:text-primary">
                  {purchaseInvoiceData.purchaseOrder}
                </Link>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rechnungsnummer</span>
                <span className="font-medium">{purchaseInvoiceData.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Eingangsdatum</span>
                <span className="font-medium">{purchaseInvoiceData.receivedAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fällig am</span>
                <span className="font-medium">{purchaseInvoiceData.dueDate}</span>
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
