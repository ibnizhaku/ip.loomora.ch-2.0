import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ChecklistDialog } from "@/components/quality/ChecklistDialog";
import { PhotoUploadDialog } from "@/components/quality/PhotoUploadDialog";

const qcData = {
  id: "QC-2024-0178",
  werkauftrag: "WA-2024-0156",
  projekt: "Stahlkonstruktion Hallendach",
  projektNr: "PRJ-2024-0015",
  prüfer: "Andreas Steiner",
  datum: "29.01.2024",
  status: "bestanden",
  gesamtbewertung: 92,
  prüfnorm: "SN EN 1090-2",
  ausführungsklasse: "EXC2",
};

const prüfpunkte = [
  { id: 1, kategorie: "Massgenauigkeit", punkt: "Längenmasse", soll: "±2mm", ist: "+1.2mm", gewicht: 15, status: "ok" },
  { id: 2, kategorie: "Massgenauigkeit", punkt: "Winkelmasse", soll: "±1°", ist: "+0.3°", gewicht: 10, status: "ok" },
  { id: 3, kategorie: "Schweissnähte", punkt: "Sichtprüfung VT", soll: "Klasse C", ist: "Klasse C", gewicht: 20, status: "ok" },
  { id: 4, kategorie: "Schweissnähte", punkt: "Nahtvorbereitung", soll: "ISO 9692-1", ist: "konform", gewicht: 10, status: "ok" },
  { id: 5, kategorie: "Schweissnähte", punkt: "Nahtdicke a-Mass", soll: "a=5mm min", ist: "a=5.2mm", gewicht: 15, status: "ok" },
  { id: 6, kategorie: "Oberfläche", punkt: "Korrosionsschutz", soll: "C3 mittel", ist: "C3 mittel", gewicht: 10, status: "ok" },
  { id: 7, kategorie: "Oberfläche", punkt: "Schichtdicke", soll: "≥80μm", ist: "72μm", gewicht: 10, status: "mangel" },
  { id: 8, kategorie: "Verbindungen", punkt: "Schraubenanzug", soll: "M.A. Drehmoment", ist: "konform", gewicht: 10, status: "ok" },
];

const mängel = [
  { id: 1, beschreibung: "Schichtdicke Grundierung unterschritten an 2 Stellen", schwere: "leicht", massnahme: "Nachbeschichtung erforderlich", frist: "31.01.2024" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  bestanden: { label: "Bestanden", color: "bg-success/10 text-success", icon: CheckCircle2 },
  "mit-mängeln": { label: "Mit Mängeln", color: "bg-warning/10 text-warning", icon: AlertTriangle },
  "nicht-bestanden": { label: "Nicht bestanden", color: "bg-destructive/10 text-destructive", icon: XCircle },
  offen: { label: "Offen", color: "bg-muted text-muted-foreground", icon: ClipboardCheck },
};

export default function QualityCheckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const okCount = prüfpunkte.filter(p => p.status === "ok").length;
  const StatusIcon = statusConfig[qcData.status].icon;

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
            <Badge className={statusConfig[qcData.status].color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[qcData.status].label}
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
          <Button onClick={() => navigate("/quality-control/new")}>
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
