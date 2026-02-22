import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Target, TrendingUp, TrendingDown, AlertTriangle, Calendar, Edit, Download, BarChart3, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBudget, useBudgetComparison } from "@/hooks/use-budgets";

const statusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Entwurf", color: "bg-muted text-muted-foreground" },
  APPROVED: { label: "Genehmigt", color: "bg-info/10 text-info" },
  ACTIVE: { label: "Aktiv", color: "bg-success/10 text-success" },
  CLOSED: { label: "Abgeschlossen", color: "bg-muted text-muted-foreground" },
};

const formatCurrency = (amount: number) => new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(amount || 0);

export default function BudgetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, isLoading, error } = useBudget(id || "");
  const { data: comparison } = useBudgetComparison(id || "", true);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error || !raw) return <div className="flex flex-col items-center justify-center h-64 text-muted-foreground"><p>Budget nicht gefunden</p><Link to="/budgets" className="text-primary hover:underline mt-2">Zurück</Link></div>;

  const b = raw as any;
  const comp = comparison as any;
  const sc = statusMap[b.status] || statusMap.DRAFT;
  const totalBudget = Number(b.totalBudget) || 0;
  const usedBudget = comp?.totalActual || 0;
  const usagePercentage = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/budgets")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{b.name}</h1>
              <Badge className={sc.color} variant="secondary">{sc.label}</Badge>
            </div>
            <p className="text-muted-foreground">Periode {b.year} • {b.period}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/budgets/${id}/edit`)}><Edit className="h-4 w-4 mr-2" />Bearbeiten</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportieren</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Gesamtbudget</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Verbraucht</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(usedBudget)}</p>
            <p className="text-xs text-muted-foreground">{usagePercentage.toFixed(1)}% des Budgets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Verbleibend</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-success">{formatCurrency(totalBudget - usedBudget)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Auslastung</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{usagePercentage.toFixed(1)}%</p>
            <Progress value={Math.min(usagePercentage, 100)} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Budget Lines */}
      {(b.lines || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Budgetpositionen</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Konto</TableHead>
                  <TableHead>Bezeichnung</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(b.lines || []).map((line: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{line.accountCode || line.accountId}</TableCell>
                    <TableCell>{line.accountName || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(line.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Info sidebar */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />Informationen</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Startdatum</span><span>{b.startDate ? new Date(b.startDate).toLocaleDateString("de-CH") : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Enddatum</span><span>{b.endDate ? new Date(b.endDate).toLocaleDateString("de-CH") : "—"}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
