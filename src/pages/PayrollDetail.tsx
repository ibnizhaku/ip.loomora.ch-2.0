import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

export default function PayrollDetail() {
  const { id } = useParams();

  const { data: payroll, isLoading, error } = useQuery({
    queryKey: ["/payroll", id],
    queryFn: () => api.get<any>(`/payroll/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !payroll) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Lohnabrechnung nicht gefunden</p>
        <Link to="/payroll" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const employee = payroll.employee;
  const grossSalary = Number(payroll.grossSalary || payroll.gross || 0);
  const netSalary = Number(payroll.netSalary || payroll.net || 0);
  const deductions = grossSalary - netSalary;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/payroll">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">
              Lohnabrechnung {payroll.number || payroll.id}
            </h1>
            <Badge variant="outline">{payroll.status || "Entwurf"}</Badge>
          </div>
          <p className="text-muted-foreground">
            {payroll.period || formatDate(payroll.periodStart)} — {formatDate(payroll.periodEnd)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gehaltsübersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bruttolohn</span>
                <span className="font-medium">CHF {grossSalary.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-destructive">
                <span>Abzüge</span>
                <span>-CHF {deductions.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Nettolohn</span>
                <span>CHF {netSalary.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          {payroll.deductions && payroll.deductions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Abzüge im Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {payroll.deductions.map((d: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{d.name || d.type}</span>
                    <span>CHF {Number(d.amount || 0).toLocaleString("de-CH", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mitarbeiter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {employee ? (
                <>
                  <Link to={`/hr/${employee.id}`} className="font-medium hover:text-primary">
                    {employee.firstName} {employee.lastName}
                  </Link>
                  <p className="text-sm text-muted-foreground">{employee.position || ""}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Kein Mitarbeiter zugeordnet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Auszahlungsdatum</span>
                <span className="font-medium">{formatDate(payroll.paymentDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">{payroll.status || "Entwurf"}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
