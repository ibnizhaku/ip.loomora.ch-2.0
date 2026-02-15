import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, FileText, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ChecklistDialog } from "@/components/quality/ChecklistDialog";
import { PhotoUploadDialog } from "@/components/quality/PhotoUploadDialog";
import { useQualityCheck } from "@/hooks/use-quality-control";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  bestanden: { label: "Bestanden", color: "bg-success/10 text-success", icon: CheckCircle2 },
  "mit-mängeln": { label: "Mit Mängeln", color: "bg-warning/10 text-warning", icon: AlertTriangle },
  "nicht-bestanden": { label: "Nicht bestanden", color: "bg-destructive/10 text-destructive", icon: XCircle },
  offen: { label: "Offen", color: "bg-muted text-muted-foreground", icon: ClipboardCheck },
  PENDING: { label: "Offen", color: "bg-muted text-muted-foreground", icon: ClipboardCheck },
  IN_PROGRESS: { label: "In Prüfung", color: "bg-info/10 text-info", icon: ClipboardCheck },
  PASSED: { label: "Bestanden", color: "bg-success/10 text-success", icon: CheckCircle2 },
  FAILED: { label: "Nicht bestanden", color: "bg-destructive/10 text-destructive", icon: XCircle },
  CONDITIONAL: { label: "Mit Mängeln", color: "bg-warning/10 text-warning", icon: AlertTriangle },
};

export default function QualityCheckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: apiCheck, isLoading } = useQualityCheck(id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!apiCheck) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/quality"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Prüfung nicht gefunden</h1>
            <p className="text-muted-foreground">Die angeforderte QS-Prüfung existiert nicht.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/quality")}>Zurück</Button>
      </div>
    );
  }

  const check = apiCheck as any;

  const qcData = {
    id: check.number || check.id,
    werkauftrag: check.productionOrderId || "",
    projekt: check.checklist?.name || "",
    projektNr: check.productionOrderId || "",
    prüfer: check.inspector ? `${check.inspector.firstName} ${check.inspector.lastName}` : "",
    datum: check.completedDate ? new Date(check.completedDate).toLocaleDateString("de-CH") : check.createdAt ? new Date(check.createdAt).toLocaleDateString("de-CH") : "",
    status: check.status || "PENDING",
    gesamtbewertung: check.results ? Math.round((check.results.filter((r: any) => r.passed).length / Math.max(check.results.length, 1)) * 100) : 0,
    prüfnorm: check.type || "",
    ausführungsklasse: "",
  };

  const prüfpunkte = (check.results || []).map((r: any, idx: number) => ({
    id: idx + 1,
    kategorie: "",
    punkt: r.checklistItemId || `Prüfpunkt ${idx + 1}`,
    soll: "",
    ist: r.value || "",
    gewicht: 0,
    status: r.passed ? "ok" : "mangel",
  }));

  const mängel = (check.results || [])
    .filter((r: any) => !r.passed && r.notes)
    .map((r: any, idx: number) => ({
      id: idx + 1,
      beschreibung: r.notes || "",
      schwere: "leicht",
      massnahme: "",
      frist: "",
    }));

  const okCount = prüfpunkte.filter((p: any) => p.status === "ok").length;
  const statusKey = qcData.status;
  const StatusIcon = (statusConfig[statusKey] || statusConfig["offen"]).icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/quality">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{qcData.id}</h1>
            <Badge className={statusConfig[statusKey]?.color || "bg-muted text-muted-foreground"}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[statusKey]?.label || statusKey}
            </Badge>
            <Badge variant="outline">{qcData.ausführungsklasse}</Badge>
          </div>
          <p className="text-muted-foreground">{qcData.projekt}</p>
        </div>
        <div className="flex gap-2">
          <ChecklistDialog 
            prüfungId={qcData.id} 
            prüfungName={qcData.projekt} 
          />
          <PhotoUploadDialog 
            prüfungId={qcData.id} 
            prüfungName={qcData.projekt} 
          />
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Prüfbericht
          </Button>
          <Button onClick={() => navigate("/quality/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Prüfung
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtbewertung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress value={qcData.gesamtbewertung} className="flex-1 h-3" />
              <span className="text-2xl font-bold">{qcData.gesamtbewertung}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prüfpunkte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{okCount} / {prüfpunkte.length}</p>
            <p className="text-sm text-muted-foreground">bestanden</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prüfnorm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{qcData.prüfnorm}</p>
            <p className="text-sm text-muted-foreground">Ausführungsklasse {qcData.ausführungsklasse}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prüfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{qcData.prüfer}</p>
                <p className="text-xs text-muted-foreground">{qcData.datum}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referenz */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Werkauftrag:</span>
              <Link to={`/production/${qcData.werkauftrag}`} className="ml-2 text-primary hover:underline">
                {qcData.werkauftrag}
              </Link>
            </div>
            <div>
              <span className="text-muted-foreground">Projekt:</span>
              <Link to={`/projects/${qcData.projektNr}`} className="ml-2 text-primary hover:underline">
                {qcData.projektNr}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prüfpunkte */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Prüfpunkte ({qcData.prüfnorm})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Nr.</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Prüfpunkt</TableHead>
                <TableHead>Soll-Wert</TableHead>
                <TableHead>Ist-Wert</TableHead>
                <TableHead className="text-center">Gewicht</TableHead>
                <TableHead>Ergebnis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prüfpunkte.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell className="text-muted-foreground">{p.kategorie}</TableCell>
                  <TableCell>{p.punkt}</TableCell>
                  <TableCell className="font-mono text-sm">{p.soll}</TableCell>
                  <TableCell className="font-mono text-sm">{p.ist}</TableCell>
                  <TableCell className="text-center">{p.gewicht}%</TableCell>
                  <TableCell>
                    {p.status === "ok" ? (
                      <Badge className="bg-success/10 text-success">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        OK
                      </Badge>
                    ) : (
                      <Badge className="bg-warning/10 text-warning">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Mangel
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mängel */}
      {mängel.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle>Festgestellte Mängel</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Schwere</TableHead>
                  <TableHead>Massnahme</TableHead>
                  <TableHead>Frist</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mängel.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.beschreibung}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.schwere}</Badge>
                    </TableCell>
                    <TableCell>{m.massnahme}</TableCell>
                    <TableCell>{m.frist}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
