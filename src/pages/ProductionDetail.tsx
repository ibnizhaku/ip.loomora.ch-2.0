import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Factory, Clock, Users, CheckCircle2, AlertCircle, Play, Pause, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CapacityDialog } from "@/components/production/CapacityDialog";

const produktionData = {
  id: "WA-2024-0156",
  bezeichnung: "Stahlkonstruktion Hallendach",
  stückliste: "STL-2024-0042",
  projekt: "Industriehalle Müller AG",
  projektNr: "PRJ-2024-0015",
  status: "in-arbeit",
  priorität: "hoch",
  startDatum: "22.01.2024",
  liefertermin: "15.02.2024",
  fortschritt: 65,
  geplanteStunden: 70,
  istStunden: 48.5,
};

const arbeitsgänge = [
  { id: 1, name: "Zuschnitt / Sägen", status: "erledigt", geplant: 8, ist: 7.5, mitarbeiter: "TM", maschine: "Bandsäge Bomar" },
  { id: 2, name: "CNC-Bohren", status: "erledigt", geplant: 6, ist: 5.5, mitarbeiter: "AS", maschine: "Ficep Endeavour" },
  { id: 3, name: "Schweissen HEA-Träger", status: "erledigt", geplant: 12, ist: 14, mitarbeiter: "MK", maschine: "MAG Fronius" },
  { id: 4, name: "Schweissen Verbindungen", status: "in-arbeit", geplant: 12, ist: 8.5, mitarbeiter: "MK", maschine: "MAG Fronius" },
  { id: 5, name: "Schlossern / Zusammenbau", status: "in-arbeit", geplant: 16, ist: 13, mitarbeiter: "LW", maschine: "-" },
  { id: 6, name: "Sandstrahlen", status: "offen", geplant: 4, ist: 0, mitarbeiter: "-", maschine: "Strahlkabine" },
  { id: 7, name: "Grundierung", status: "offen", geplant: 6, ist: 0, mitarbeiter: "-", maschine: "Spritzkabine" },
  { id: 8, name: "Qualitätskontrolle", status: "offen", geplant: 4, ist: 0, mitarbeiter: "-", maschine: "-" },
];

const materialverbrauch = [
  { artikel: "HEA 200 Träger S355", geplant: 96, verbraucht: 94, einheit: "lfm", status: "ok" },
  { artikel: "IPE 180 Pfetten S235", geplant: 144, verbraucht: 144, einheit: "lfm", status: "ok" },
  { artikel: "Rohr 100x100x5 S355", geplant: 48, verbraucht: 52, einheit: "lfm", status: "überschritten" },
  { artikel: "HV-Schrauben M16x60", geplant: 480, verbraucht: 456, einheit: "Stk", status: "ok" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  "offen": { label: "Offen", color: "bg-muted text-muted-foreground", icon: Clock },
  "in-arbeit": { label: "In Arbeit", color: "bg-info/10 text-info", icon: Play },
  "pausiert": { label: "Pausiert", color: "bg-warning/10 text-warning", icon: Pause },
  "erledigt": { label: "Erledigt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  "problem": { label: "Problem", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const prioritätColors: Record<string, string> = {
  hoch: "bg-destructive/10 text-destructive",
  mittel: "bg-warning/10 text-warning",
  niedrig: "bg-muted text-muted-foreground",
};

export default function ProductionDetail() {
  const { id } = useParams();

  const erledigteGänge = arbeitsgänge.filter(a => a.status === "erledigt").length;
  const StatusIcon = statusConfig[produktionData.status].icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/production">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{produktionData.id}</h1>
            <Badge className={statusConfig[produktionData.status].color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[produktionData.status].label}
            </Badge>
            <Badge className={prioritätColors[produktionData.priorität]}>
              Priorität: {produktionData.priorität.charAt(0).toUpperCase() + produktionData.priorität.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">{produktionData.bezeichnung}</p>
        </div>
        <div className="flex gap-2">
          <CapacityDialog 
            produktionId={produktionData.id} 
            bezeichnung={produktionData.bezeichnung} 
          />
          <Button variant="outline">
            <Pause className="mr-2 h-4 w-4" />
            Pausieren
          </Button>
          <Button>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Abschliessen
          </Button>
        </div>
      </div>

      {/* Progress & Info */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtfortschritt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={produktionData.fortschritt} className="flex-1 h-3" />
              <span className="text-2xl font-bold">{produktionData.fortschritt}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {erledigteGänge} von {arbeitsgänge.length} Arbeitsgängen abgeschlossen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zeitaufwand</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{produktionData.istStunden} / {produktionData.geplanteStunden} Std.</p>
            <p className="text-sm text-muted-foreground">
              {produktionData.istStunden <= produktionData.geplanteStunden * 0.9 ? (
                <span className="text-success">Im Zeitplan</span>
              ) : (
                <span className="text-warning">Knapp im Plan</span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Liefertermin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{produktionData.liefertermin}</p>
            <p className="text-sm text-muted-foreground">Start: {produktionData.startDatum}</p>
          </CardContent>
        </Card>
      </div>

      {/* Referenzen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Verknüpfungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Projekt:</span>
              <Link to={`/projects/${produktionData.projektNr}`} className="ml-2 text-primary hover:underline">
                {produktionData.projekt}
              </Link>
            </div>
            <div>
              <span className="text-muted-foreground">Stückliste:</span>
              <Link to={`/bom/${produktionData.stückliste}`} className="ml-2 text-primary hover:underline">
                {produktionData.stückliste}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arbeitsgänge */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Arbeitsgänge</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Nr.</TableHead>
                <TableHead>Arbeitsgang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Maschine/Arbeitsplatz</TableHead>
                <TableHead>Mitarbeiter</TableHead>
                <TableHead className="text-right">Plan Std.</TableHead>
                <TableHead className="text-right">Ist Std.</TableHead>
                <TableHead className="text-right">Diff.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {arbeitsgänge.map((ag) => {
                const AgIcon = statusConfig[ag.status].icon;
                const diff = ag.ist - ag.geplant;
                return (
                  <TableRow key={ag.id}>
                    <TableCell className="font-medium">{ag.id}</TableCell>
                    <TableCell>{ag.name}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[ag.status].color}>
                        <AgIcon className="mr-1 h-3 w-3" />
                        {statusConfig[ag.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ag.maschine}</TableCell>
                    <TableCell>
                      {ag.mitarbeiter !== "-" ? (
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">{ag.mitarbeiter}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{ag.geplant}</TableCell>
                    <TableCell className="text-right">{ag.ist > 0 ? ag.ist : "-"}</TableCell>
                    <TableCell className="text-right">
                      {ag.ist > 0 && (
                        <span className={diff > 0 ? "text-destructive" : "text-success"}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Materialverbrauch */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Materialverbrauch</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artikel</TableHead>
                <TableHead className="text-center">Einheit</TableHead>
                <TableHead className="text-right">Geplant</TableHead>
                <TableHead className="text-right">Verbraucht</TableHead>
                <TableHead className="text-right">Differenz</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialverbrauch.map((m, i) => {
                const diff = m.verbraucht - m.geplant;
                return (
                  <TableRow key={i}>
                    <TableCell>{m.artikel}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{m.einheit}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{m.geplant}</TableCell>
                    <TableCell className="text-right">{m.verbraucht}</TableCell>
                    <TableCell className="text-right">
                      <span className={diff > 0 ? "text-destructive" : diff < 0 ? "text-success" : ""}>
                        {diff > 0 ? "+" : ""}{diff}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={m.status === "ok" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                        {m.status === "ok" ? "OK" : "Überschritten"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
