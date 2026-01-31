import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Euro, 
  Building2, 
  User,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  Printer,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const quoteData = {
  id: "ANG-2024-0042",
  status: "Gesendet",
  customer: {
    name: "TechStart GmbH",
    contact: "Maria Weber",
    email: "m.weber@techstart.de",
    phone: "+49 30 12345678",
    address: "Innovationsstraße 15, 10115 Berlin"
  },
  project: "E-Commerce Plattform",
  createdAt: "15.01.2024",
  validUntil: "15.02.2024",
  positions: [
    { id: 1, description: "Frontend-Entwicklung", quantity: 80, unit: "Stunden", price: 120, total: 9600 },
    { id: 2, description: "Backend-Entwicklung", quantity: 60, unit: "Stunden", price: 130, total: 7800 },
    { id: 3, description: "UI/UX Design", quantity: 40, unit: "Stunden", price: 110, total: 4400 },
    { id: 4, description: "Projektmanagement", quantity: 20, unit: "Stunden", price: 100, total: 2000 },
    { id: 5, description: "Testing & QA", quantity: 30, unit: "Stunden", price: 95, total: 2850 },
  ],
  subtotal: 26650,
  tax: 5063.50,
  total: 31713.50,
  notes: "Zahlungsziel: 14 Tage nach Rechnungsstellung. Bei Auftragserteilung innerhalb der Gültigkeitsfrist gewähren wir 3% Skonto.",
  history: [
    { date: "15.01.2024 14:30", action: "Angebot erstellt", user: "Max Keller" },
    { date: "15.01.2024 15:45", action: "Angebot per E-Mail versendet", user: "Max Keller" },
    { date: "18.01.2024 10:20", action: "Kunde hat Angebot geöffnet", user: "System" },
  ]
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileText },
  "Gesendet": { color: "bg-info/10 text-info", icon: Send },
  "Angenommen": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Abgelehnt": { color: "bg-destructive/10 text-destructive", icon: Clock },
};

const QuoteDetail = () => {
  const { id } = useParams();
  const status = statusConfig[quoteData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{quoteData.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {quoteData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{quoteData.project}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Duplizieren
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Drucken
          </Button>
          <Button size="sm">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            In Auftrag umwandeln
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
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Positions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Positionen</CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Position hinzufügen
              </Button>
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
                  {quoteData.positions.map((pos) => (
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
                  <span>€{quoteData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MwSt. (19%)</span>
                  <span>€{quoteData.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gesamtbetrag (brutto)</span>
                  <span className="text-primary">€{quoteData.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Bemerkungen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{quoteData.notes}</p>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quoteData.history.map((entry, index) => (
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
          {/* Customer Info */}
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
                    {quoteData.customer.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{quoteData.customer.contact}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{quoteData.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{quoteData.customer.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Erstellt am</span>
                <span className="text-sm font-medium">{quoteData.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gültig bis</span>
                <span className="text-sm font-medium">{quoteData.validUntil}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Positionen</span>
                <span className="text-sm font-medium">{quoteData.positions.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nettobetrag</span>
                <span className="text-sm font-semibold">€{quoteData.subtotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;
