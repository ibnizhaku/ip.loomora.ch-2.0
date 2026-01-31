import { useParams, Link } from "react-router-dom";
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
  FileText
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

const deliveryNoteData = {
  id: "LS-2024-0089",
  status: "Geliefert",
  customer: {
    name: "Weber Elektronik GmbH",
    contact: "Klaus Weber",
    deliveryAddress: "Industriepark 25, 70565 Stuttgart",
    billingAddress: "Hauptstraße 10, 70173 Stuttgart"
  },
  order: "AUF-2024-0082",
  createdAt: "25.01.2024",
  deliveredAt: "26.01.2024",
  deliveredBy: "DHL Express",
  trackingNumber: "JJD000390007712345678",
  positions: [
    { id: 1, articleNo: "ART-001", description: "Server-Rack 42HE", quantity: 2, delivered: 2 },
    { id: 2, articleNo: "ART-045", description: "Netzwerk-Switch 48-Port", quantity: 5, delivered: 5 },
    { id: 3, articleNo: "ART-089", description: "Patchkabel Cat6 (5m)", quantity: 50, delivered: 50 },
    { id: 4, articleNo: "ART-102", description: "USV 3000VA", quantity: 2, delivered: 2 },
    { id: 5, articleNo: "ART-156", description: "Serverschrank-Zubehör Set", quantity: 2, delivered: 2 },
  ],
  signature: {
    name: "K. Weber",
    date: "26.01.2024 14:32"
  },
  notes: "Lieferung erfolgte am Hintereingang laut Kundenanweisung. Alle Artikel wurden auf Vollständigkeit geprüft.",
  timeline: [
    { date: "25.01.2024 09:15", action: "Lieferschein erstellt", user: "System" },
    { date: "25.01.2024 11:30", action: "Ware verpackt", user: "Lager" },
    { date: "25.01.2024 14:00", action: "An Versanddienstleister übergeben", user: "Lager" },
    { date: "26.01.2024 08:45", action: "In Zustellung", user: "DHL" },
    { date: "26.01.2024 14:32", action: "Zugestellt - Empfang bestätigt", user: "K. Weber" },
  ]
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileText },
  "In Vorbereitung": { color: "bg-info/10 text-info", icon: Package },
  "Versendet": { color: "bg-warning/10 text-warning", icon: Truck },
  "Geliefert": { color: "bg-success/10 text-success", icon: CheckCircle2 },
};

const DeliveryNoteDetail = () => {
  const { id } = useParams();
  const status = statusConfig[deliveryNoteData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/delivery-notes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
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
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Rechnung erstellen
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
              <DropdownMenuItem>Sendungsverfolgung öffnen</DropdownMenuItem>
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
                  <Link to="/customers/1" className="font-medium hover:text-primary">
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sendungsnummer</span>
                <span className="font-mono text-xs">{deliveryNoteData.trackingNumber.slice(0, 15)}...</span>
              </div>
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auftrag</span>
                <Link to={`/orders/${deliveryNoteData.order}`} className="font-medium hover:text-primary">
                  {deliveryNoteData.order}
                </Link>
              </div>
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
    </div>
  );
};

export default DeliveryNoteDetail;
