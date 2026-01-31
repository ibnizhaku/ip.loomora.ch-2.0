import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Download,
  FileText,
  MapPin,
  Tag,
  TrendingDown,
  Wrench,
  AlertTriangle,
} from "lucide-react";

const assetData = {
  id: "ANL-2024-0015",
  name: "CNC-Fräsmaschine DMG MORI",
  category: "Maschinen",
  type: "Produktionsanlage",
  status: "active" as const,
  serialNumber: "DMG-2024-CH-45892",
  manufacturer: "DMG MORI",
  model: "CMX 600 V",
  location: "Werkstatt Halle 2",
  responsiblePerson: "Thomas Meier",
  costCenter: "KST-200 Produktion",
  bookingAccount: "1500 Maschinen",
  acquisition: {
    date: "2024-01-05",
    supplier: "DMG MORI Schweiz AG",
    invoiceNumber: "ER-2024-0012",
    purchasePrice: 185000.00,
    additionalCosts: 5500.00, // Installation, Transport
    totalCost: 190500.00,
  },
  depreciation: {
    method: "linear",
    years: 8,
    startDate: "2024-01-01",
    monthlyAmount: 1984.38,
    yearlyAmount: 23812.50,
    accumulatedDepreciation: 1984.38,
    residualValue: 0,
    bookValue: 188515.62,
  },
  insurance: {
    company: "Helvetia",
    policyNumber: "POL-2024-45678",
    insuredValue: 200000.00,
    premium: 1200.00,
    validUntil: "2025-01-31",
  },
  maintenance: {
    lastService: "2024-01-15",
    nextService: "2024-07-15",
    serviceInterval: "6 Monate",
    serviceProvider: "DMG MORI Service",
  },
  depreciationSchedule: [
    { year: 2024, opening: 190500.00, depreciation: 23812.50, closing: 166687.50 },
    { year: 2025, opening: 166687.50, depreciation: 23812.50, closing: 142875.00 },
    { year: 2026, opening: 142875.00, depreciation: 23812.50, closing: 119062.50 },
    { year: 2027, opening: 119062.50, depreciation: 23812.50, closing: 95250.00 },
    { year: 2028, opening: 95250.00, depreciation: 23812.50, closing: 71437.50 },
    { year: 2029, opening: 71437.50, depreciation: 23812.50, closing: 47625.00 },
    { year: 2030, opening: 47625.00, depreciation: 23812.50, closing: 23812.50 },
    { year: 2031, opening: 23812.50, depreciation: 23812.50, closing: 0 },
  ],
  documents: [
    { name: "Rechnung DMG MORI", type: "invoice", date: "2024-01-05" },
    { name: "Garantieschein", type: "warranty", date: "2024-01-05" },
    { name: "Bedienungsanleitung", type: "manual", date: "2024-01-05" },
    { name: "Serviceprotokoll", type: "service", date: "2024-01-15" },
  ],
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return { label: "In Betrieb", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "maintenance":
      return { label: "In Wartung", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
    case "disposed":
      return { label: "Ausgeschieden", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
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

export default function FixedAssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const statusConfig = getStatusConfig(assetData.status);
  const depreciationProgress = ((assetData.acquisition.totalCost - assetData.depreciation.bookValue) / assetData.acquisition.totalCost) * 100;
  const yearsRemaining = assetData.depreciation.years - Math.ceil(depreciationProgress / (100 / assetData.depreciation.years));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/fixed-assets")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{assetData.name}</h1>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {assetData.id} • {assetData.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Anlagekarte
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Anschaffungswert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(assetData.acquisition.totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buchwert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(assetData.depreciation.bookValue)}</p>
            <p className="text-xs text-muted-foreground">
              {(100 - depreciationProgress).toFixed(1)}% Restwert
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jährl. AfA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{formatCurrency(assetData.depreciation.yearlyAmount)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Restnutzungsdauer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{yearsRemaining} Jahre</p>
            <p className="text-xs text-muted-foreground">
              von {assetData.depreciation.years} Jahren
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abschreibungsfortschritt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Abschreibungsfortschritt
          </CardTitle>
          <CardDescription>
            Lineare Abschreibung über {assetData.depreciation.years} Jahre
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Abgeschrieben: {depreciationProgress.toFixed(1)}%</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(assetData.depreciation.accumulatedDepreciation)} von {formatCurrency(assetData.acquisition.totalCost)}
              </span>
            </div>
            <Progress value={depreciationProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Abschreibungsplan */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abschreibungsplan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jahr</TableHead>
                    <TableHead className="text-right">Anfangswert</TableHead>
                    <TableHead className="text-right">AfA</TableHead>
                    <TableHead className="text-right">Endwert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetData.depreciationSchedule.map((row, index) => (
                    <TableRow key={row.year} className={index === 0 ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">
                        {row.year}
                        {index === 0 && <Badge variant="outline" className="ml-2">Aktuell</Badge>}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(row.opening)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCurrency(row.depreciation)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.closing)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Dokumente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dokumente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assetData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.date).toLocaleDateString("de-CH")}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stammdaten */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Stammdaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Seriennummer</p>
                <p className="font-medium font-mono">{assetData.serialNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hersteller / Modell</p>
                <p className="font-medium">{assetData.manufacturer} {assetData.model}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Standort</p>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <p className="font-medium">{assetData.location}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Verantwortlich</p>
                <p className="font-medium">{assetData.responsiblePerson}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Kostenstelle</p>
                <p className="font-medium">{assetData.costCenter}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Buchungskonto</p>
                <p className="font-medium">{assetData.bookingAccount}</p>
              </div>
            </CardContent>
          </Card>

          {/* Wartung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Wartung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Letzte Wartung</p>
                <p className="font-medium">
                  {new Date(assetData.maintenance.lastService).toLocaleDateString("de-CH")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Nächste Wartung</p>
                <p className="font-medium">
                  {new Date(assetData.maintenance.nextService).toLocaleDateString("de-CH")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Intervall</p>
                <p className="font-medium">{assetData.maintenance.serviceInterval}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Servicepartner</p>
                <p className="font-medium">{assetData.maintenance.serviceProvider}</p>
              </div>
            </CardContent>
          </Card>

          {/* Versicherung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Versicherung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Versicherer</p>
                <p className="font-medium">{assetData.insurance.company}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Versicherungswert</p>
                <p className="font-medium">{formatCurrency(assetData.insurance.insuredValue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jahresprämie</p>
                <p className="font-medium">{formatCurrency(assetData.insurance.premium)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gültig bis</p>
                <p className="font-medium">
                  {new Date(assetData.insurance.validUntil).toLocaleDateString("de-CH")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
