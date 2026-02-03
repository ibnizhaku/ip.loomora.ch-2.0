import { useState } from "react";
import { Calendar, Clock, Users, Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CapacityDialogProps {
  produktionId: string;
  bezeichnung: string;
}

const maschinenKapazität = [
  { id: 1, name: "Bandsäge Bomar", auslastung: 75, verfügbar: "14:00-18:00", status: "belegt" },
  { id: 2, name: "Ficep Endeavour (CNC)", auslastung: 90, verfügbar: "morgen 08:00", status: "belegt" },
  { id: 3, name: "MAG Fronius Schweissanlage", auslastung: 60, verfügbar: "sofort", status: "frei" },
  { id: 4, name: "Strahlkabine", auslastung: 20, verfügbar: "sofort", status: "frei" },
  { id: 5, name: "Spritzkabine", auslastung: 0, verfügbar: "sofort", status: "frei" },
];

const mitarbeiterKapazität = [
  { kürzel: "TM", name: "Thomas Meier", rolle: "Zuschnitt", auslastung: 80, verfügbar: "15:00" },
  { kürzel: "AS", name: "Andreas Schmid", rolle: "CNC-Operator", auslastung: 95, verfügbar: "morgen" },
  { kürzel: "MK", name: "Martin Keller", rolle: "Schweisser", auslastung: 70, verfügbar: "14:00" },
  { kürzel: "LW", name: "Lukas Weber", rolle: "Schlosser", auslastung: 85, verfügbar: "16:00" },
];

const zeitfenster = [
  { tag: "Heute", datum: "03.02.2026", slots: [
    { zeit: "08:00-12:00", status: "belegt", auftrag: "WA-2024-0156" },
    { zeit: "13:00-17:00", status: "teilweise", auftrag: "WA-2024-0156" },
  ]},
  { tag: "Morgen", datum: "04.02.2026", slots: [
    { zeit: "08:00-12:00", status: "frei", auftrag: null },
    { zeit: "13:00-17:00", status: "frei", auftrag: null },
  ]},
  { tag: "Übermorgen", datum: "05.02.2026", slots: [
    { zeit: "08:00-12:00", status: "geplant", auftrag: "WA-2024-0158" },
    { zeit: "13:00-17:00", status: "frei", auftrag: null },
  ]},
];

export function CapacityDialog({ produktionId, bezeichnung }: CapacityDialogProps) {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "frei": return "bg-success/10 text-success";
      case "belegt": return "bg-destructive/10 text-destructive";
      case "teilweise": return "bg-warning/10 text-warning";
      case "geplant": return "bg-info/10 text-info";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAuslastungColor = (auslastung: number) => {
    if (auslastung >= 90) return "text-destructive";
    if (auslastung >= 70) return "text-warning";
    return "text-success";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Kapazität
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Kapazitätsplanung - {produktionId}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{bezeichnung}</p>
        </DialogHeader>

        <Tabs defaultValue="maschinen" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="maschinen">
              <Wrench className="mr-2 h-4 w-4" />
              Maschinen
            </TabsTrigger>
            <TabsTrigger value="mitarbeiter">
              <Users className="mr-2 h-4 w-4" />
              Mitarbeiter
            </TabsTrigger>
            <TabsTrigger value="zeitfenster">
              <Clock className="mr-2 h-4 w-4" />
              Zeitfenster
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maschinen" className="space-y-4 mt-4">
            <div className="grid gap-3 md:grid-cols-2">
              {maschinenKapazität.map((maschine) => (
                <Card key={maschine.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{maschine.name}</CardTitle>
                      <Badge className={getStatusColor(maschine.status)}>
                        {maschine.status === "frei" ? "Verfügbar" : "Belegt"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Auslastung</span>
                        <span className={getAuslastungColor(maschine.auslastung)}>
                          {maschine.auslastung}%
                        </span>
                      </div>
                      <Progress value={maschine.auslastung} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Nächste Verfügbarkeit: {maschine.verfügbar}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mitarbeiter" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Auslastung</TableHead>
                  <TableHead>Nächste Verfügbarkeit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mitarbeiterKapazität.map((ma) => (
                  <TableRow key={ma.kürzel}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {ma.kürzel}
                        </div>
                        <span>{ma.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ma.rolle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={ma.auslastung} className="h-2 w-20" />
                        <span className={getAuslastungColor(ma.auslastung)}>{ma.auslastung}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{ma.verfügbar}</TableCell>
                    <TableCell>
                      {ma.auslastung >= 90 ? (
                        <Badge className="bg-destructive/10 text-destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Überlastet
                        </Badge>
                      ) : ma.auslastung >= 70 ? (
                        <Badge className="bg-warning/10 text-warning">Ausgelastet</Badge>
                      ) : (
                        <Badge className="bg-success/10 text-success">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Verfügbar
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="zeitfenster" className="mt-4">
            <div className="space-y-4">
              {zeitfenster.map((tag) => (
                <Card key={tag.datum}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {tag.tag} - {tag.datum}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-2">
                      {tag.slots.map((slot, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border ${
                            slot.status === "frei" ? "border-success/30 bg-success/5" :
                            slot.status === "belegt" ? "border-destructive/30 bg-destructive/5" :
                            slot.status === "teilweise" ? "border-warning/30 bg-warning/5" :
                            "border-info/30 bg-info/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{slot.zeit}</span>
                            <Badge className={getStatusColor(slot.status)}>
                              {slot.status === "frei" ? "Frei" :
                               slot.status === "belegt" ? "Belegt" :
                               slot.status === "teilweise" ? "Teilweise" : "Geplant"}
                            </Badge>
                          </div>
                          {slot.auftrag && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Auftrag: {slot.auftrag}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Schliessen
          </Button>
          <Button>
            Kapazität reservieren
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
