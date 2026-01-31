import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Edit,
  Download,
  BarChart3,
} from "lucide-react";

const budgetData = {
  id: "BDG-2024-001",
  name: "Betriebsbudget 2024",
  period: "2024",
  type: "annual" as const,
  status: "active" as const,
  department: "Gesamtunternehmen",
  costCenter: "Alle",
  currency: "CHF",
  totalBudget: 2500000,
  usedBudget: 625000,
  remainingBudget: 1875000,
  forecast: 2450000,
  categories: [
    { name: "Personal", budgeted: 1200000, actual: 305000, forecast: 1220000 },
    { name: "Material", budgeted: 600000, actual: 152000, forecast: 580000 },
    { name: "Betriebskosten", budgeted: 350000, actual: 88000, forecast: 360000 },
    { name: "Marketing", budgeted: 150000, actual: 35000, forecast: 145000 },
    { name: "IT & Software", budgeted: 100000, actual: 25000, forecast: 95000 },
    { name: "Sonstiges", budgeted: 100000, actual: 20000, forecast: 50000 },
  ],
  monthlyTrend: [
    { month: "Jan", budgeted: 208333, actual: 195000 },
    { month: "Feb", budgeted: 208333, actual: 210000 },
    { month: "Mär", budgeted: 208333, actual: 220000 },
  ],
  alerts: [
    { category: "Betriebskosten", message: "3% über Budget", severity: "warning" },
  ],
  createdAt: "2023-11-15",
  approvedBy: "Peter Müller",
  approvedAt: "2023-12-01",
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return { label: "Aktiv", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "draft":
      return { label: "Entwurf", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    case "closed":
      return { label: "Abgeschlossen", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-800" };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function BudgetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const statusConfig = getStatusConfig(budgetData.status);
  const usagePercentage = (budgetData.usedBudget / budgetData.totalBudget) * 100;
  const expectedPercentage = (new Date().getMonth() / 12) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/budgets")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{budgetData.name}</h1>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {budgetData.department} • Periode {budgetData.period}
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
            Exportieren
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtbudget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(budgetData.totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verbraucht</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(budgetData.usedBudget)}</p>
            <p className="text-xs text-muted-foreground">{usagePercentage.toFixed(1)}% des Budgets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verbleibend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(budgetData.remainingBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prognose</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {budgetData.forecast <= budgetData.totalBudget ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
              <p className={`text-2xl font-bold ${budgetData.forecast <= budgetData.totalBudget ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(budgetData.forecast)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budgetfortschritt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budgetfortschritt
          </CardTitle>
          <CardDescription>
            Erwarteter Verbrauch nach {new Date().getMonth() + 1} Monaten: {expectedPercentage.toFixed(0)}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Verbraucht: {usagePercentage.toFixed(1)}%</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(budgetData.usedBudget)} von {formatCurrency(budgetData.totalBudget)}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-3" />
          </div>
          {usagePercentage > expectedPercentage && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 dark:text-yellow-300">
                Budget liegt {(usagePercentage - expectedPercentage).toFixed(1)}% über dem erwarteten Verbrauch
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kategorien */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Budgetkategorien
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategorie</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Ist</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead className="text-right">Prognose</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetData.categories.map((cat) => {
                    const percentage = (cat.actual / cat.budgeted) * 100;
                    const expectedPct = expectedPercentage;
                    const status = percentage > expectedPct + 5 ? "warning" : percentage > expectedPct + 10 ? "critical" : "ok";
                    return (
                      <TableRow key={cat.name}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(cat.budgeted)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(cat.actual)}</TableCell>
                        <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                        <TableCell className={`text-right ${cat.forecast > cat.budgeted ? "text-red-600" : ""}`}>
                          {formatCurrency(cat.forecast)}
                        </TableCell>
                        <TableCell>
                          {status === "ok" && <Badge variant="outline" className="text-green-600">Im Plan</Badge>}
                          {status === "warning" && <Badge variant="outline" className="text-yellow-600">Achtung</Badge>}
                          {status === "critical" && <Badge variant="destructive">Kritisch</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Warnungen */}
          {budgetData.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Warnungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {budgetData.alerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="font-medium text-sm">{alert.category}</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">{alert.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Informationen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Periode</p>
                <p className="font-medium">{budgetData.period}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Typ</p>
                <p className="font-medium">Jahresbudget</p>
              </div>
              <div>
                <p className="text-muted-foreground">Kostenstelle</p>
                <p className="font-medium">{budgetData.costCenter}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Genehmigt von</p>
                <p className="font-medium">{budgetData.approvedBy}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Genehmigt am</p>
                <p className="font-medium">{new Date(budgetData.approvedAt).toLocaleDateString("de-CH")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Aktionen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/cost-centers")}>
                <Target className="h-4 w-4 mr-2" />
                Kostenstellen
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/reports")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Budget-Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
