import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  Users,
  Eye,
  Star,
  Truck,
  RefreshCcw,
  Settings,
  Globe,
} from "lucide-react";

const shopOrders = [
  {
    id: "ORD-10234",
    customer: "Maria Schmidt",
    email: "m.schmidt@email.de",
    items: 3,
    total: 234.50,
    status: "processing",
    paymentStatus: "paid",
    date: "2024-01-19",
    shippingMethod: "DHL Express",
  },
  {
    id: "ORD-10233",
    customer: "Thomas Weber",
    email: "t.weber@email.de",
    items: 1,
    total: 89.99,
    status: "shipped",
    paymentStatus: "paid",
    date: "2024-01-18",
    shippingMethod: "DHL Standard",
  },
  {
    id: "ORD-10232",
    customer: "Lisa Müller",
    email: "l.mueller@email.de",
    items: 5,
    total: 445.00,
    status: "delivered",
    paymentStatus: "paid",
    date: "2024-01-17",
    shippingMethod: "DPD",
  },
  {
    id: "ORD-10231",
    customer: "Michael Fischer",
    email: "m.fischer@email.de",
    items: 2,
    total: 156.80,
    status: "pending",
    paymentStatus: "pending",
    date: "2024-01-19",
    shippingMethod: "DHL Standard",
  },
  {
    id: "ORD-10230",
    customer: "Sandra Bauer",
    email: "s.bauer@email.de",
    items: 1,
    total: 49.99,
    status: "cancelled",
    paymentStatus: "refunded",
    date: "2024-01-16",
    shippingMethod: "-",
  },
];

const topProducts = [
  { id: "1", name: "Premium Widget Pro", sales: 234, revenue: 23400, rating: 4.8, stock: 45 },
  { id: "2", name: "Smart Gadget X", sales: 189, revenue: 17010, rating: 4.6, stock: 23 },
  { id: "3", name: "Ultra Kit Bundle", sales: 156, revenue: 31200, rating: 4.9, stock: 12 },
  { id: "4", name: "Basic Starter Set", sales: 312, revenue: 9360, rating: 4.4, stock: 156 },
  { id: "5", name: "Pro Accessory Pack", sales: 98, revenue: 4900, rating: 4.7, stock: 78 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "processing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "shipped":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "refunded":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("");

  const totalRevenue = shopOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Online-Shop</h1>
          <p className="text-muted-foreground">
            E-Commerce-Bestellungen und Shop-Verwaltung
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Globe className="mr-2 h-4 w-4" />
            Shop öffnen
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umsatz (Monat)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% vs. Vormonat
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bestellungen</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Heute: 12 neue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <Progress value={32} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Warenkorbwert</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalRevenue / shopOrders.filter((o) => o.paymentStatus === "paid").length).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">
              +8.3% vs. Vormonat
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Bestellungen</TabsTrigger>
          <TabsTrigger value="products">Top-Produkte</TabsTrigger>
          <TabsTrigger value="customers">Kunden</TabsTrigger>
          <TabsTrigger value="analytics">Analytik</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Bestellung suchen..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Neu: 2</Badge>
              <Badge variant="outline">In Bearbeitung: 1</Badge>
              <Badge variant="outline">Versendet: 1</Badge>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bestellung</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Zahlung</TableHead>
                  <TableHead>Versand</TableHead>
                  <TableHead className="text-right">Artikel</TableHead>
                  <TableHead className="text-right">Summe</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shopOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)} variant="secondary">
                        {order.status === "pending" && "Ausstehend"}
                        {order.status === "processing" && "In Bearbeitung"}
                        {order.status === "shipped" && "Versendet"}
                        {order.status === "delivered" && "Zugestellt"}
                        {order.status === "cancelled" && "Storniert"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentColor(order.paymentStatus)} variant="secondary">
                        {order.paymentStatus === "paid" && "Bezahlt"}
                        {order.paymentStatus === "pending" && "Ausstehend"}
                        {order.paymentStatus === "refunded" && "Erstattet"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span className="text-sm">{order.shippingMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{order.items}</TableCell>
                    <TableCell className="text-right font-medium">
                      {order.total.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bestseller</CardTitle>
              <CardDescription>Die meistverkauften Produkte diesen Monat</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produkt</TableHead>
                    <TableHead className="text-right">Verkäufe</TableHead>
                    <TableHead className="text-right">Umsatz</TableHead>
                    <TableHead className="text-right">Bewertung</TableHead>
                    <TableHead className="text-right">Bestand</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-bold">
                            #{index + 1}
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{product.sales}</TableCell>
                      <TableCell className="text-right font-medium">
                        {product.revenue.toLocaleString("de-DE")} €
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          {product.rating}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={product.stock < 20 ? "destructive" : "secondary"}>
                          {product.stock} Stk.
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Neue Kunden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">128</div>
                <p className="text-sm text-muted-foreground">Diesen Monat</p>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wiederkehrende Kunden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">34%</div>
                <p className="text-sm text-muted-foreground">Retention Rate</p>
                <Progress value={34} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Lifetime Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">245 €</div>
                <p className="text-sm text-muted-foreground">Ø CLV</p>
                <Progress value={60} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Traffic-Quellen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { source: "Organische Suche", percentage: 42, visits: 12500 },
                  { source: "Direkt", percentage: 28, visits: 8400 },
                  { source: "Social Media", percentage: 18, visits: 5400 },
                  { source: "E-Mail", percentage: 8, visits: 2400 },
                  { source: "Referrals", percentage: 4, visits: 1200 },
                ].map((item) => (
                  <div key={item.source} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.source}</span>
                      <span className="text-muted-foreground">
                        {item.visits.toLocaleString("de-DE")} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { stage: "Besucher", count: 30000, percentage: 100 },
                  { stage: "Produktansichten", count: 15000, percentage: 50 },
                  { stage: "In Warenkorb", count: 3000, percentage: 10 },
                  { stage: "Checkout gestartet", count: 1500, percentage: 5 },
                  { stage: "Kauf abgeschlossen", count: 960, percentage: 3.2 },
                ].map((item) => (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.stage}</span>
                      <span className="text-muted-foreground">
                        {item.count.toLocaleString("de-DE")} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
