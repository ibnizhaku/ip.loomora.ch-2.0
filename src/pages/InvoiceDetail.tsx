import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Receipt, 
  Calendar, 
  Euro, 
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Download,
  Printer,
  MoreHorizontal,
  CreditCard,
  Ban
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

const invoiceData = {
  id: "RE-2024-0156",
  status: "Überfällig",
  customer: {
    name: "Müller & Partner GmbH",
    contact: "Stefan Müller",
    email: "s.mueller@mueller-partner.de",
    phone: "+49 89 98765432",
    address: "Geschäftsweg 8, 80339 München",
    taxId: "DE123456789"
  },
  order: "AUF-2024-0078",
  createdAt: "05.01.2024",
  dueDate: "19.01.2024",
  positions: [
    { id: 1, description: "Consulting-Leistungen Januar", quantity: 45, unit: "Stunden", price: 150, total: 6750 },
    { id: 2, description: "Software-Lizenzen (Jahreslizenz)", quantity: 5, unit: "Stück", price: 299, total: 1495 },
    { id: 3, description: "Schulung Mitarbeiter", quantity: 2, unit: "Tage", price: 1200, total: 2400 },
    { id: 4, description: "Support-Pauschale Q1", quantity: 1, unit: "Pauschal", price: 500, total: 500 },
  ],
  subtotal: 11145,
  tax: 2117.55,
  total: 13262.55,
  payments: [
    { date: "10.01.2024", amount: 5000, method: "Überweisung" },
  ],
  paid: 5000,
  reminders: [
    { date: "20.01.2024", type: "1. Mahnung" },
    { date: "27.01.2024", type: "2. Mahnung" },
  ],
  bankDetails: {
    bank: "Sparkasse München",
    iban: "DE89 3704 0044 0532 0130 00",
    bic: "COBADEFFXXX"
  }
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: Receipt },
  "Gesendet": { color: "bg-info/10 text-info", icon: Send },
  "Bezahlt": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Teilweise bezahlt": { color: "bg-warning/10 text-warning", icon: Clock },
  "Überfällig": { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  "Storniert": { color: "bg-muted text-muted-foreground", icon: Ban },
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const status = statusConfig[invoiceData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;
  const outstanding = invoiceData.total - invoiceData.paid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{invoiceData.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {invoiceData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{invoiceData.customer.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Zahlung erfassen
          </Button>
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Mahnung erstellen
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
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Per E-Mail senden
              </DropdownMenuItem>
              <DropdownMenuItem>Gutschrift erstellen</DropdownMenuItem>
              <DropdownMenuItem>Duplizieren</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Stornieren</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alert for overdue */}
      {invoiceData.status === "Überfällig" && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Rechnung überfällig</p>
              <p className="text-sm text-muted-foreground">
                Die Rechnung war am {invoiceData.dueDate} fällig. Offener Betrag: €{outstanding.toFixed(2)}
              </p>
            </div>
            <Button size="sm" className="ml-auto bg-destructive hover:bg-destructive/90">
              Mahnung senden
            </Button>
          </CardContent>
        </Card>
      )}

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
                  {invoiceData.positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.description}</TableCell>
                      <TableCell className="text-right">{pos.quantity}</TableCell>
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
                  <span>€{invoiceData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MwSt. (19%)</span>
                  <span>€{invoiceData.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gesamtbetrag</span>
                  <span>€{invoiceData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-success">
                  <span>Bereits bezahlt</span>
                  <span>-€{invoiceData.paid.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg text-destructive">
                  <span>Offener Betrag</span>
                  <span>€{outstanding.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Zahlungsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoiceData.payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                        <CreditCard className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">Zahlung eingegangen</p>
                        <p className="text-sm text-muted-foreground">{payment.date} • {payment.method}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-success">+€{payment.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          {invoiceData.reminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mahnungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoiceData.reminders.map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        <div>
                          <p className="font-medium">{reminder.type}</p>
                          <p className="text-sm text-muted-foreground">{reminder.date}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Versendet</Badge>
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
              <CardTitle className="text-base">Rechnungsempfänger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link to="/customers/1" className="font-medium hover:text-primary">
                    {invoiceData.customer.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{invoiceData.customer.contact}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {invoiceData.customer.address}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{invoiceData.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{invoiceData.customer.phone}</span>
                </div>
              </div>

              <Separator />

              <div className="text-sm">
                <span className="text-muted-foreground">USt-IdNr.: </span>
                <span>{invoiceData.customer.taxId}</span>
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
                <span className="text-muted-foreground">Auftrag</span>
                <Link to={`/orders/${invoiceData.order}`} className="font-medium hover:text-primary">
                  {invoiceData.order}
                </Link>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rechnungsdatum</span>
                <span className="font-medium">{invoiceData.createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fällig am</span>
                <span className="font-medium text-destructive">{invoiceData.dueDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bankverbindung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank</span>
                <span className="font-medium">{invoiceData.bankDetails.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IBAN</span>
                <span className="font-medium font-mono text-xs">{invoiceData.bankDetails.iban}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">BIC</span>
                <span className="font-medium">{invoiceData.bankDetails.bic}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
