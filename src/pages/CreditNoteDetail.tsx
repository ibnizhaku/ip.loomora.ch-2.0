import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Euro, 
  Building2,
  Mail,
  Phone,
  Clock,
  Printer,
  MoreHorizontal,
  Download,
  Undo2
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

const creditNoteData = {
  id: "GS-2024-0012",
  status: "Gebucht",
  originalInvoice: "RE-2024-0089",
  customer: {
    name: "Fashion Store GmbH",
    contact: "Lisa Schmidt",
    email: "l.schmidt@fashion.de",
    phone: "+49 30 87654321",
    address: "Modestraße 25, 10117 Berlin"
  },
  createdAt: "25.01.2024",
  reason: "Teilrückgabe - Defekte Lieferung",
  positions: [
    { id: 1, description: "Software-Lizenz (nicht benötigt)", quantity: 2, unit: "Stück", price: 299, total: 598 },
    { id: 2, description: "Schulung (nicht durchgeführt)", quantity: 0.5, unit: "Tage", price: 1200, total: 600 },
  ],
  subtotal: 1198,
  tax: 227.62,
  total: 1425.62,
  history: [
    { date: "25.01.2024 10:30", action: "Gutschrift erstellt", user: "Anna Meier" },
    { date: "25.01.2024 10:35", action: "Gutschrift gebucht", user: "System" },
    { date: "25.01.2024 11:00", action: "Per E-Mail versendet", user: "Anna Meier" },
  ]
};

const CreditNoteDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/credit-notes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{creditNoteData.id}</h1>
              <Badge className="bg-success/10 text-success">
                {creditNoteData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Gutschrift zu {creditNoteData.originalInvoice}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Drucken
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Per E-Mail senden
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplizieren</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Stornieren</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reason */}
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-4 py-4">
              <Undo2 className="h-6 w-6 text-warning" />
              <div>
                <p className="font-semibold">Gutschriftsgrund</p>
                <p className="text-sm text-muted-foreground">{creditNoteData.reason}</p>
              </div>
            </CardContent>
          </Card>

          {/* Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Gutschriftspositionen</CardTitle>
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
                  {creditNoteData.positions.map((pos) => (
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
                  <span>CHF {creditNoteData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MwSt. (8.1%)</span>
                  <span>CHF {creditNoteData.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gutschriftsbetrag</span>
                  <span className="text-success">-CHF {creditNoteData.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditNoteData.history.map((entry, index) => (
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
                  <Link to="/customers/1" className="font-medium hover:text-primary">
                    {creditNoteData.customer.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{creditNoteData.customer.contact}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{creditNoteData.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{creditNoteData.customer.phone}</span>
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
                <span className="text-muted-foreground">Bezug auf Rechnung</span>
                <Link to={`/invoices/${creditNoteData.originalInvoice}`} className="font-medium hover:text-primary">
                  {creditNoteData.originalInvoice}
                </Link>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Erstellt am</span>
                <span className="font-medium">{creditNoteData.createdAt}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gutschriftsbetrag</span>
                <span className="font-semibold text-success">-CHF {creditNoteData.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreditNoteDetail;
