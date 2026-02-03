import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Package,
  Euro,
  FileText,
  Clock,
  Star,
  TrendingUp,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const supplierData = {
  id: "LF-001",
  name: "TechParts International GmbH",
  status: "Aktiv",
  rating: 4.5,
  category: "Elektronik & Hardware",
  contact: {
    name: "Peter Schmidt",
    position: "Key Account Manager",
    email: "p.schmidt@techparts.de",
    phone: "+49 221 9876543"
  },
  address: {
    street: "Industriestraße 100",
    city: "50999 Köln",
    country: "Deutschland"
  },
  website: "www.techparts-international.de",
  taxId: "DE987654321",
  paymentTerms: "30 Tage netto",
  stats: {
    totalOrders: 156,
    totalVolume: 287500,
    avgDeliveryTime: 3.2,
    onTimeRate: 94,
    qualityRate: 98
  },
  recentOrders: [
    { id: "EK-2024-0045", date: "28.01.2024", items: 12, total: 4580, status: "Geliefert" },
    { id: "EK-2024-0038", date: "15.01.2024", items: 8, total: 2890, status: "Geliefert" },
    { id: "EK-2024-0029", date: "05.01.2024", items: 25, total: 8750, status: "Geliefert" },
    { id: "EK-2023-0198", date: "20.12.2023", items: 15, total: 5200, status: "Geliefert" },
  ],
  products: [
    { articleNo: "TP-001", name: "Serverschrank 42HE", price: 899, stock: "Verfügbar" },
    { articleNo: "TP-045", name: "Netzwerk-Switch 48-Port", price: 459, stock: "Verfügbar" },
    { articleNo: "TP-089", name: "USV 3000VA", price: 1250, stock: "Begrenzt" },
    { articleNo: "TP-102", name: "Server-Netzteil 750W", price: 189, stock: "Verfügbar" },
    { articleNo: "TP-156", name: "SSD 1TB Enterprise", price: 159, stock: "Nicht verfügbar" },
  ],
  notes: [
    { date: "25.01.2024", text: "Rahmenvertrag bis 2025 verlängert", user: "Max Keller" },
    { date: "10.01.2024", text: "5% Rabatt auf Großbestellungen verhandelt", user: "Anna Schmidt" },
  ]
};

const stockColors: Record<string, string> = {
  "Verfügbar": "bg-success/10 text-success",
  "Begrenzt": "bg-warning/10 text-warning",
  "Nicht verfügbar": "bg-destructive/10 text-destructive",
};

const SupplierDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/suppliers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold">{supplierData.name}</h1>
                <Badge className="bg-success/10 text-success">{supplierData.status}</Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{supplierData.category}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span>{supplierData.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Bestellung erstellen
          </Button>
          <Button size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Kontaktieren
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{supplierData.stats.totalOrders}</div>
            <p className="text-sm text-muted-foreground">Bestellungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">CHF {supplierData.stats.totalVolume.toLocaleString('de-CH')}</div>
            <p className="text-sm text-muted-foreground">Gesamtvolumen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{supplierData.stats.avgDeliveryTime} Tage</div>
            <p className="text-sm text-muted-foreground">Ø Lieferzeit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{supplierData.stats.onTimeRate}%</div>
            <p className="text-sm text-muted-foreground">Pünktlichkeit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{supplierData.stats.qualityRate}%</div>
            <p className="text-sm text-muted-foreground">Qualitätsrate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="products">Produkte</TabsTrigger>
          <TabsTrigger value="orders">Bestellungen</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contact Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Kontaktinformationen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Ansprechpartner</p>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{supplierData.contact.name}</p>
                          <p className="text-sm text-muted-foreground">{supplierData.contact.position}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{supplierData.contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{supplierData.contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{supplierData.website}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Adresse</p>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p>{supplierData.address.street}</p>
                          <p>{supplierData.address.city}</p>
                          <p>{supplierData.address.country}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">USt-IdNr.</span>
                        <span>{supplierData.taxId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zahlungsziel</span>
                        <span>{supplierData.paymentTerms}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Leistungsbewertung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pünktlichkeit</span>
                    <span className="font-medium">{supplierData.stats.onTimeRate}%</span>
                  </div>
                  <Progress value={supplierData.stats.onTimeRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Qualität</span>
                    <span className="font-medium">{supplierData.stats.qualityRate}%</span>
                  </div>
                  <Progress value={supplierData.stats.qualityRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Kommunikation</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Preis-Leistung</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notizen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supplierData.notes.map((note, index) => (
                  <div key={index} className="flex gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{note.text}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{note.date}</span>
                        <span>•</span>
                        <span>{note.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Produkte & Preisliste</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Art.-Nr.</TableHead>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead className="text-right">Preis</TableHead>
                    <TableHead>Verfügbarkeit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierData.products.map((product) => (
                    <TableRow key={product.articleNo}>
                      <TableCell className="font-mono">{product.articleNo}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">CHF {product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={stockColors[product.stock]}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Bestellhistorie</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bestellnummer</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="text-right">Positionen</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierData.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link to={`/purchase-orders/${order.id}`} className="font-medium hover:text-primary">
                          {order.id}
                        </Link>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="text-right">{order.items}</TableCell>
                      <TableCell className="text-right">CHF {order.total.toLocaleString('de-CH')}</TableCell>
                      <TableCell>
                        <Badge className="bg-success/10 text-success">{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Dokumente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Keine Dokumente vorhanden.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierDetail;
