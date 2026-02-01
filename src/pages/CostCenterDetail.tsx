import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Target, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const costCenterData = {
  number: "1000",
  name: "Produktion",
  manager: "Thomas Müller",
  budget: 150000,
  actual: 142000,
  category: "production",
  status: "on-track" as const,
  monthlyData: [
    { month: "Januar", budget: 12500, actual: 11800, variance: 700 },
    { month: "Februar", budget: 12500, actual: 13200, variance: -700 },
    { month: "März", budget: 12500, actual: 12100, variance: 400 },
    { month: "April", budget: 12500, actual: 11500, variance: 1000 },
    { month: "Mai", budget: 12500, actual: 12800, variance: -300 },
    { month: "Juni", budget: 12500, actual: 11900, variance: 600 },
  ],
  expenses: [
    { id: "1", date: "31.01.2024", description: "Materialkosten", account: "4000", amount: 5200 },
    { id: "2", date: "28.01.2024", description: "Maschinenwartung", account: "6100", amount: 1800 },
    { id: "3", date: "25.01.2024", description: "Personalkosten", account: "5000", amount: 8500 },
    { id: "4", date: "20.01.2024", description: "Energiekosten", account: "6000", amount: 2100 },
    { id: "5", date: "15.01.2024", description: "Verbrauchsmaterial", account: "4000", amount: 950 },
  ],
};

const statusStyles = {
  "on-track": "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  "over-budget": "bg-destructive/10 text-destructive",
};

const statusLabels = {
  "on-track": "Im Plan",
  warning: "Achtung",
  "over-budget": "Überschritten",
};

export default function CostCenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const variance = costCenterData.budget - costCenterData.actual;
  const variancePercent = ((variance / costCenterData.budget) * 100).toFixed(1);
  const utilizationPercent = (costCenterData.actual / costCenterData.budget) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg text-muted-foreground">{costCenterData.number}</span>
            <h1 className="font-display text-3xl font-bold">{costCenterData.name}</h1>
            <Badge className={statusStyles[costCenterData.status]}>
              {statusLabels[costCenterData.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground">Verantwortlich: {costCenterData.manager}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Bericht erstellen
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">CHF {costCenterData.budget.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Ist-Kosten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">CHF {costCenterData.actual.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Abweichung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className={cn("text-2xl font-bold", variance >= 0 ? "text-success" : "text-destructive")}>
                {variance >= 0 ? "+" : ""}CHF {variance.toLocaleString()}
              </p>
              {variance >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{variancePercent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Auslastung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{utilizationPercent.toFixed(1)}%</p>
            <Progress value={Math.min(utilizationPercent, 100)} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monatliche Entwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Monat</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Ist</TableHead>
                  <TableHead className="text-right">Abweichung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costCenterData.monthlyData.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right font-mono">CHF {row.budget.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">CHF {row.actual.toLocaleString()}</TableCell>
                    <TableCell className={cn(
                      "text-right font-mono font-medium",
                      row.variance >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {row.variance >= 0 ? "+" : ""}CHF {row.variance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Letzte Buchungen</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Konto</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costCenterData.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="font-mono text-sm">{expense.account}</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      CHF {expense.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
