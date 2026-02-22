import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Target, TrendingUp, TrendingDown, BarChart3, PieChart, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCostCenter } from "@/hooks/use-cost-centers";

export default function CostCenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, isLoading, error } = useCostCenter(id || "");

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error || !raw) return <div className="flex flex-col items-center justify-center h-64 text-muted-foreground"><p>Kostenstelle nicht gefunden</p><Link to="/cost-centers" className="text-primary hover:underline mt-2">Zurück</Link></div>;

  const cc = raw as any;
  const budget = Number(cc.budget) || 0;
  const actual = Number(cc.actualCost) || 0;
  const variance = budget - actual;
  const variancePercent = budget > 0 ? ((variance / budget) * 100).toFixed(1) : "0";
  const utilizationPercent = budget > 0 ? (actual / budget) * 100 : 0;
  const status = variance >= 0 ? "on-track" : actual > budget * 1.1 ? "over-budget" : "warning";

  const statusStyles: Record<string, string> = {
    "on-track": "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    "over-budget": "bg-destructive/10 text-destructive",
  };
  const statusLabels: Record<string, string> = {
    "on-track": "Im Plan", warning: "Achtung", "over-budget": "Überschritten",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cost-centers")}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg text-muted-foreground">{cc.code}</span>
            <h1 className="font-display text-3xl font-bold">{cc.name}</h1>
            <Badge className={statusStyles[status]}>{statusLabels[status]}</Badge>
          </div>
          {cc.description && <p className="text-muted-foreground">{cc.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/cost-centers/${id}/edit`)}>
            <Edit className="h-4 w-4" />
            Bearbeiten
          </Button>
          <Button variant="outline" className="gap-2"><BarChart3 className="h-4 w-4" />Bericht erstellen</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4" />Budget</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">CHF {budget.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><PieChart className="h-4 w-4" />Ist-Kosten</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">CHF {actual.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Abweichung</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className={cn("text-2xl font-bold", variance >= 0 ? "text-success" : "text-destructive")}>
                {variance >= 0 ? "+" : ""}CHF {variance.toLocaleString()}
              </p>
              {variance >= 0 ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
            </div>
            <p className="text-sm text-muted-foreground">{variancePercent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Auslastung</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{utilizationPercent.toFixed(1)}%</p>
            <Progress value={Math.min(utilizationPercent, 100)} className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
