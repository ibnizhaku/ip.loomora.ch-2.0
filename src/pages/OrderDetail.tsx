import { useParams, Link } from "react-router-dom";
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
  MapPin
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

const orderData = {
  id: "AUF-2024-0089",
  status: "In Bearbeitung",
  progress: 65,
  customer: {
    name: "Digital Solutions AG",
    contact: "Thomas Müller",
    address: "Technikstraße 42, 80331 München"
  },
  quote: "ANG-2024-0035",
  createdAt: "20.01.2024",
  deliveryDate: "28.02.2024",
  positions: [
    { id: 1, description: "Webentwicklung Phase 1", quantity: 1, status: "Abgeschlossen", progress: 100 },
    { id: 2, description: "Webentwicklung Phase 2", quantity: 1, status: "In Arbeit", progress: 75 },
    { id: 3, description: "Mobile App Entwicklung", quantity: 1, status: "In Arbeit", progress: 40 },
    { id: 4, description: "API Integration", quantity: 1, status: "Geplant", progress: 0 },
    { id: 5, description: "Testing & Deployment", quantity: 1, status: "Geplant", progress: 0 },
  ],
  total: 45800,
  paid: 22900,
  milestones: [
    { name: "Projektstart", date: "20.01.2024", completed: true },
    { name: "Design-Freigabe", date: "27.01.2024", completed: true },
    { name: "Phase 1 Abschluss", date: "10.02.2024", completed: true },
    { name: "Phase 2 Abschluss", date: "20.02.2024", completed: false },
    { name: "Finale Abnahme", date: "28.02.2024", completed: false },
  ],
  deliveries: [
    { id: "LS-2024-0045", date: "10.02.2024", status: "Geliefert" },
  ]
};

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
  const status = statusConfig[orderData.status] || statusConfig["Neu"];
  const StatusIcon = status.icon;

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
          <Button variant="outline" size="sm">
            <Truck className="h-4 w-4 mr-2" />
            Lieferschein erstellen
          </Button>
          <Button variant="outline" size="sm">
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
              <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
              <DropdownMenuItem>Duplizieren</DropdownMenuItem>
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
                  <Link to="/customers/1" className="font-medium hover:text-primary">
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
                <span className="font-semibold">€{orderData.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bezahlt</span>
                <span className="font-medium text-success">€{orderData.paid.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Offen</span>
                <span className="font-medium text-warning">€{(orderData.total - orderData.paid).toLocaleString()}</span>
              </div>
              <Separator />
              <Progress value={(orderData.paid / orderData.total) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round((orderData.paid / orderData.total) * 100)}% bezahlt
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
                <Link to={`/quotes/${orderData.quote}`} className="font-medium hover:text-primary">
                  {orderData.quote}
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
    </div>
  );
};

export default OrderDetail;
