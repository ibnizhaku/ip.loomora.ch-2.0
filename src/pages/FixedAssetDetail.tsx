import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Download,
  FileText,
  MapPin,
  Tag,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { useFixedAsset, useDepreciationSchedule } from "@/hooks/use-fixed-assets";

const categoryLabels: Record<string, string> = {
  BUILDINGS: "Immobilien",
  MACHINERY: "Maschinen & Geräte",
  VEHICLES: "Fahrzeuge",
  FURNITURE: "Büromöbel",
  IT_EQUIPMENT: "IT & EDV",
  SOFTWARE: "Software",
  TOOLS: "Werkzeuge",
  OTHER: "Sonstige",
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return { label: "In Betrieb", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "FULLY_DEPRECIATED":
      return { label: "Voll abgeschrieben", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" };
    case "MAINTENANCE":
      return { label: "In Wartung", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
    case "DISPOSED":
      return { label: "Ausgeschieden", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    case "SOLD":
      return { label: "Verkauft", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" };
    default:
      return { label: status || "—", color: "bg-gray-100 text-gray-800" };
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
  const { data: asset, isLoading: assetLoading, error: assetError } = useFixedAsset(id || "");
  const { data: scheduleData } = useDepreciationSchedule(id || "");

  if (assetLoading || !asset) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (assetError) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/fixed-assets")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-destructive">Anlagegut konnte nicht geladen werden.</p>
      </div>
    );
  }

  const a = asset as any;
  const totalCost = Number(a.acquisitionCost ?? 0);
  const bookValue = Number(a.bookValue ?? a.currentBookValue ?? 0);
  const totalDepreciation = Number(a.totalDepreciation ?? 0);
  const depreciationProgress = totalCost > 0 ? (totalDepreciation / totalCost) * 100 : 0;
  const yearlyAmount = totalCost > 0 && a.usefulLife > 0 ? (totalCost - Number(a.residualValue ?? 0)) / a.usefulLife : 0;
  const yearsRemaining = Number(a.remainingLife ?? 0);
  const statusConfig = getStatusConfig(a.status || "ACTIVE");
  const schedule = (scheduleData as any)?.schedule ?? [];

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
              <h1 className="text-3xl font-bold tracking-tight">{a.name}</h1>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {a.number} • {categoryLabels[a.category] || a.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/fixed-assets/${id}/edit`)}>
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
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buchwert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(bookValue)}</p>
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
              <p className="text-2xl font-bold">{formatCurrency(yearlyAmount)}</p>
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
              von {a.usefulLife ?? 0} Jahren
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
            {a.depreciationMethod === "LINEAR" ? "Lineare" : "Degressive"} Abschreibung über {a.usefulLife ?? 0} Jahre
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Abgeschrieben: {depreciationProgress.toFixed(1)}%</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(totalDepreciation)} von {formatCurrency(totalCost)}
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
                  {schedule.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Kein Abschreibungsplan vorhanden
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedule.map((row: any, index: number) => (
                      <TableRow key={row.year} className={row.status === "COMPLETED" ? "bg-muted/30" : ""}>
                        <TableCell className="font-medium">
                          {row.year}
                          {row.status === "PENDING" && <Badge variant="outline" className="ml-2">Offen</Badge>}
                          {row.status === "COMPLETED" && <Badge variant="secondary" className="ml-2">Erledigt</Badge>}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(row.bookValueStart ?? 0)}</TableCell>
                        <TableCell className="text-right text-red-600">-{formatCurrency(row.depreciation ?? 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.bookValueEnd ?? 0)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Beschreibung */}
          {a.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Beschreibung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{a.description}</p>
              </CardContent>
            </Card>
          )}
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
              {a.serialNumber && (
                <div>
                  <p className="text-muted-foreground">Seriennummer</p>
                  <p className="font-medium font-mono">{a.serialNumber}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Anschaffungsdatum</p>
                <p className="font-medium">
                  {a.acquisitionDate
                    ? new Date(a.acquisitionDate).toLocaleDateString("de-CH")
                    : "—"}
                </p>
              </div>
              {a.location && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground">Standort</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <p className="font-medium">{a.location}</p>
                    </div>
                  </div>
                </>
              )}
              {a.costCenter && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground">Kostenstelle</p>
                    <p className="font-medium">
                      {a.costCenter?.number} {a.costCenter?.name}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
