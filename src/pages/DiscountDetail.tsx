import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Copy,
  Trash2,
  Tag,
  Percent,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
} from "lucide-react";

const discountData = {
  id: "RAB-2024-0015",
  name: "Frühling-Aktion 2024",
  code: "SPRING24",
  type: "percentage" as const, // percentage, fixed, freeShipping
  value: 15, // 15%
  status: "active" as const,
  priority: 1,
  validFrom: "2024-03-01",
  validUntil: "2024-03-31",
  conditions: {
    minOrderValue: 200.00,
    maxDiscount: 150.00,
    usageLimit: 500,
    usageLimitPerCustomer: 2,
    newCustomersOnly: false,
    combinable: false,
  },
  applicableTo: {
    type: "categories", // all, categories, products
    categories: ["Geländer", "Tore", "Zäune"],
    products: [],
  },
  stats: {
    usageCount: 127,
    totalDiscountGiven: 8540.50,
    averageOrderValue: 425.80,
    revenue: 54056.60,
  },
  recentUsage: [
    { date: "2024-03-15", customer: "Meier AG", order: "AUF-2024-0156", discount: 67.35 },
    { date: "2024-03-14", customer: "Weber GmbH", order: "AUF-2024-0152", discount: 82.50 },
    { date: "2024-03-14", customer: "Schmidt & Co", order: "AUF-2024-0151", discount: 45.00 },
    { date: "2024-03-13", customer: "Brunner Hans", order: "AUF-2024-0148", discount: 112.80 },
  ],
  createdAt: "2024-02-15",
  createdBy: "Anna Müller",
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return { label: "Aktiv", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "scheduled":
      return { label: "Geplant", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" };
    case "expired":
      return { label: "Abgelaufen", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    case "paused":
      return { label: "Pausiert", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-800" };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(amount);
};

export default function DiscountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const statusConfig = getStatusConfig(discountData.status);
  const usagePercentage = (discountData.stats.usageCount / discountData.conditions.usageLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/discounts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{discountData.name}</h1>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono">
              Code: {discountData.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Duplizieren
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button variant="outline" className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rabattwert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{discountData.value}%</p>
            </div>
            <p className="text-xs text-muted-foreground">Max. {formatCurrency(discountData.conditions.maxDiscount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verwendungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{discountData.stats.usageCount}</p>
            <p className="text-xs text-muted-foreground">
              von {discountData.conditions.usageLimit} ({usagePercentage.toFixed(0)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gewährter Rabatt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(discountData.stats.totalDiscountGiven)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Generierter Umsatz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-2xl font-bold">{formatCurrency(discountData.stats.revenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hauptbereich */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bedingungen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Bedingungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Mindestbestellwert</p>
                  <p className="text-lg font-semibold">{formatCurrency(discountData.conditions.minOrderValue)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Maximaler Rabatt</p>
                  <p className="text-lg font-semibold">{formatCurrency(discountData.conditions.maxDiscount)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Nutzungslimit gesamt</p>
                  <p className="text-lg font-semibold">{discountData.conditions.usageLimit}x</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Pro Kunde</p>
                  <p className="text-lg font-semibold">{discountData.conditions.usageLimitPerCustomer}x</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Nur für Neukunden</span>
                  <Switch checked={discountData.conditions.newCustomersOnly} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <span>Mit anderen Rabatten kombinierbar</span>
                  <Switch checked={discountData.conditions.combinable} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gültigkeit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gültig für
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Produktkategorien</p>
                  <div className="flex flex-wrap gap-2">
                    {discountData.applicableTo.categories.map((cat) => (
                      <Badge key={cat} variant="secondary">{cat}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Letzte Verwendungen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Letzte Verwendungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Auftrag</TableHead>
                    <TableHead className="text-right">Rabatt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountData.recentUsage.map((usage, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(usage.date).toLocaleDateString("de-CH")}</TableCell>
                      <TableCell>{typeof usage.customer === 'object' ? usage.customer?.name || usage.customer?.companyName : usage.customer}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{usage.order}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        -{formatCurrency(usage.discount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Aktivierung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Rabatt aktiv</span>
                <Switch checked={discountData.status === "active"} />
              </div>
            </CardContent>
          </Card>

          {/* Gültigkeitszeitraum */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Gültigkeitszeitraum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Von</span>
                <span>{new Date(discountData.validFrom).toLocaleDateString("de-CH")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bis</span>
                <span>{new Date(discountData.validUntil).toLocaleDateString("de-CH")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statistiken */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ø Bestellwert</span>
                <span className="font-medium">{formatCurrency(discountData.stats.averageOrderValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversion</span>
                <span className="font-medium">--</span>
              </div>
            </CardContent>
          </Card>

          {/* Metadaten */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Erstellt von</p>
                <p className="font-medium">{discountData.createdBy}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Erstellt am</p>
                <p className="font-medium">{new Date(discountData.createdAt).toLocaleDateString("de-CH")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Priorität</p>
                <p className="font-medium">{discountData.priority}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
