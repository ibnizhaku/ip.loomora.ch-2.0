import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Check, Clock, Download, Edit, Send, Calculator, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useVatReturn } from "@/hooks/use-vat-returns";

const statusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Entwurf", color: "bg-muted text-muted-foreground" },
  CALCULATED: { label: "Berechnet", color: "bg-info/10 text-info" },
  SUBMITTED: { label: "Eingereicht", color: "bg-success/10 text-success" },
  ACCEPTED: { label: "Akzeptiert", color: "bg-success/10 text-success" },
  REJECTED: { label: "Abgelehnt", color: "bg-destructive/10 text-destructive" },
};

const formatCurrency = (amount: number) => new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(amount || 0);
function formatDate(d?: string | null) { if (!d) return "—"; try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; } }

export default function VatReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, isLoading, error } = useVatReturn(id || "");

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error || !raw) return <div className="flex flex-col items-center justify-center h-64 text-muted-foreground"><p>MwSt-Abrechnung nicht gefunden</p><Link to="/vat-returns" className="text-primary hover:underline mt-2">Zurück</Link></div>;

  const v = raw as any;
  const sc = statusMap[v.status] || statusMap.DRAFT;
  const netVat = Number(v.netVat) || (Number(v.outputVat || 0) - Number(v.inputVat || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/vat-returns")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">MwSt-Abrechnung {v.period} {v.year}</h1>
              <Badge className={sc.color} variant="secondary">{sc.label}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Bearbeiten</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />PDF Export</Button>
          {v.status === "DRAFT" && (
            <Button onClick={() => toast.info("Wird an ESTV gesendet...")}><Send className="h-4 w-4 mr-2" />An ESTV senden</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Umsatz</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(v.totalRevenue || 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Geschuldete MwSt</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(v.outputVat || 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Vorsteuer</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-success">-{formatCurrency(v.inputVat || 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{netVat > 0 ? "Zu zahlen" : "Guthaben"}</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netVat > 0 ? "text-destructive" : "text-success"}`}>{formatCurrency(Math.abs(netVat))}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Lines */}
          {(v.lines || []).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Positionen</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ziff.</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead className="text-right">Betrag</TableHead>
                      {v.lines.some((l: any) => l.taxAmount != null) && <TableHead className="text-right">Steuer</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(v.lines || []).map((line: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{line.code}</TableCell>
                        <TableCell>{line.description}</TableCell>
                        <TableCell className="text-right">{formatCurrency(line.amount)}</TableCell>
                        {line.taxAmount != null && <TableCell className="text-right">{formatCurrency(line.taxAmount)}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader><CardTitle>Zusammenfassung</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Steuerbarer Umsatz</TableCell>
                    <TableCell className="text-right">{formatCurrency(v.taxableRevenue || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Geschuldete MwSt</TableCell>
                    <TableCell className="text-right">{formatCurrency(v.outputVat || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Vorsteuer</TableCell>
                    <TableCell className="text-right text-success">-{formatCurrency(v.inputVat || 0)}</TableCell>
                  </TableRow>
                  <TableRow className="text-lg font-bold">
                    <TableCell>{netVat > 0 ? "Zu bezahlender Betrag" : "Guthaben"}</TableCell>
                    <TableCell className={`text-right ${netVat > 0 ? "text-destructive" : "text-success"}`}>{formatCurrency(Math.abs(netVat))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />Abrechnungsperiode</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Von</span><span>{formatDate(v.startDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Bis</span><span>{formatDate(v.endDate)}</span></div>
              {v.submissionDate && (
                <><Separator /><div className="flex justify-between"><span className="text-muted-foreground">Eingereicht</span><span>{formatDate(v.submissionDate)}</span></div></>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Schweizer MwSt-Sätze 2024</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Normalsatz</span><Badge variant="outline">8.1%</Badge></div>
              <div className="flex justify-between"><span>Reduzierter Satz</span><Badge variant="outline">2.6%</Badge></div>
              <div className="flex justify-between"><span>Sondersatz Beherbergung</span><Badge variant="outline">3.8%</Badge></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
