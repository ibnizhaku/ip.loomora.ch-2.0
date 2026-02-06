import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Factory, Clock, Users, CheckCircle2, AlertCircle, Play, Pause, Package, MoreHorizontal, Timer, Pencil, Trash2, Printer, FileText, AlertTriangle, Ban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CapacityDialog } from "@/components/production/CapacityDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const initialProduktionData = {
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

const initialArbeitsgänge = [
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

const mitarbeiterListe = [
  { id: "1", kürzel: "TM", name: "Thomas Meier" },
  { id: "2", kürzel: "AS", name: "Anna Schmidt" },
  { id: "3", kürzel: "MK", name: "Michael König" },
  { id: "4", kürzel: "LW", name: "Lisa Weber" },
  { id: "5", kürzel: "PB", name: "Peter Brunner" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  "offen": { label: "Offen", color: "bg-muted text-muted-foreground", icon: Clock },
  "in-arbeit": { label: "In Arbeit", color: "bg-info/10 text-info", icon: Play },
  "pausiert": { label: "Pausiert", color: "bg-warning/10 text-warning", icon: Pause },
  "erledigt": { label: "Erledigt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  "problem": { label: "Problem", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const orderStatusConfig: Record<string, { label: string; color: string }> = {
  "geplant": { label: "Geplant", color: "bg-muted text-muted-foreground" },
  "in-arbeit": { label: "In Arbeit", color: "bg-info/10 text-info" },
  "pausiert": { label: "Pausiert", color: "bg-warning/10 text-warning" },
  "abgeschlossen": { label: "Abgeschlossen", color: "bg-success/10 text-success" },
  "storniert": { label: "Storniert", color: "bg-destructive/10 text-destructive" },
};

const prioritätColors: Record<string, string> = {
  hoch: "bg-destructive/10 text-destructive",
  mittel: "bg-warning/10 text-warning",
  niedrig: "bg-muted text-muted-foreground",
};

export default function ProductionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [produktionData, setProduktionData] = useState(initialProduktionData);
  const [arbeitsgänge, setArbeitsgänge] = useState(initialArbeitsgänge);
  
  // Dialog states
  const [timeTrackingOpen, setTimeTrackingOpen] = useState(false);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [completeOperationOpen, setCompleteOperationOpen] = useState(false);
  const [reportProblemOpen, setReportProblemOpen] = useState(false);
  
  // Form states
  const [selectedOperation, setSelectedOperation] = useState<string>("");
  const [timeHours, setTimeHours] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [timeDate, setTimeDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeNotes, setTimeNotes] = useState("");
  const [newStatus, setNewStatus] = useState(produktionData.status);
  const [problemDescription, setProblemDescription] = useState("");
  const [selectedOperationForComplete, setSelectedOperationForComplete] = useState<string>("");
  
  // Edit form states
  const [editName, setEditName] = useState(produktionData.bezeichnung);
  const [editPriority, setEditPriority] = useState(produktionData.priorität);
  const [editDeadline, setEditDeadline] = useState("2024-02-15");

  const erledigteGänge = arbeitsgänge.filter(a => a.status === "erledigt").length;
  const StatusIcon = statusConfig[produktionData.status].icon;

  // Zeit erfassen handler
  const handleTimeTracking = () => {
    if (!selectedOperation || (!timeHours && !timeMinutes)) {
      toast.error("Bitte Arbeitsgang und Zeit auswählen");
      return;
    }
    
    const totalHours = (parseFloat(timeHours || "0")) + (parseFloat(timeMinutes || "0") / 60);
    
    // Update operation hours
    setArbeitsgänge(prev => prev.map(ag => {
      if (ag.id.toString() === selectedOperation) {
        const newIst = ag.ist + totalHours;
        return {
          ...ag,
          ist: parseFloat(newIst.toFixed(2)),
          status: ag.status === "offen" ? "in-arbeit" : ag.status,
          mitarbeiter: selectedEmployee ? mitarbeiterListe.find(m => m.id === selectedEmployee)?.kürzel || ag.mitarbeiter : ag.mitarbeiter,
        };
      }
      return ag;
    }));
    
    // Update total hours
    setProduktionData(prev => ({
      ...prev,
      istStunden: parseFloat((prev.istStunden + totalHours).toFixed(2)),
    }));
    
    const operationName = arbeitsgänge.find(ag => ag.id.toString() === selectedOperation)?.name;
    toast.success(`${totalHours.toFixed(2)} Std. auf "${operationName}" erfasst`);
    
    // Reset form
    setSelectedOperation("");
    setTimeHours("");
    setTimeMinutes("");
    setSelectedEmployee("");
    setTimeNotes("");
    setTimeTrackingOpen(false);
  };

  // Status ändern handler
  const handleStatusChange = () => {
    setProduktionData(prev => ({ ...prev, status: newStatus }));
    toast.success(`Status geändert zu "${orderStatusConfig[newStatus]?.label || newStatus}"`);
    setStatusChangeOpen(false);
  };

  // Auftrag bearbeiten handler
  const handleEdit = () => {
    setProduktionData(prev => ({
      ...prev,
      bezeichnung: editName,
      priorität: editPriority,
      liefertermin: new Date(editDeadline).toLocaleDateString("de-CH"),
    }));
    toast.success("Werkstattauftrag aktualisiert");
    setEditOpen(false);
  };

  // Auftrag löschen handler
  const handleDelete = () => {
    toast.success("Werkstattauftrag gelöscht");
    navigate("/production");
  };

  // Arbeitsgang abschliessen handler
  const handleCompleteOperation = () => {
    if (!selectedOperationForComplete) {
      toast.error("Bitte Arbeitsgang auswählen");
      return;
    }
    
    setArbeitsgänge(prev => prev.map(ag => {
      if (ag.id.toString() === selectedOperationForComplete) {
        return { ...ag, status: "erledigt" };
      }
      return ag;
    }));
    
    const operationName = arbeitsgänge.find(ag => ag.id.toString() === selectedOperationForComplete)?.name;
    toast.success(`"${operationName}" als erledigt markiert`);
    
    // Update progress
    const newErledigte = arbeitsgänge.filter(a => a.status === "erledigt").length + 1;
    setProduktionData(prev => ({
      ...prev,
      fortschritt: Math.round((newErledigte / arbeitsgänge.length) * 100),
    }));
    
    setSelectedOperationForComplete("");
    setCompleteOperationOpen(false);
  };

  // Problem melden handler
  const handleReportProblem = () => {
    if (!problemDescription) {
      toast.error("Bitte Problem beschreiben");
      return;
    }
    
    setProduktionData(prev => ({ ...prev, status: "problem" }));
    toast.warning("Problem gemeldet - Auftrag auf 'Problem' gesetzt");
    setProblemDescription("");
    setReportProblemOpen(false);
  };

  // Drucken handler
  const handlePrint = () => {
    toast.info("Werkstattauftrag wird gedruckt...");
    window.print();
  };

  // Auftrag abschliessen
  const handleCompleteOrder = () => {
    const offeneGänge = arbeitsgänge.filter(a => a.status !== "erledigt");
    if (offeneGänge.length > 0) {
      toast.error(`${offeneGänge.length} Arbeitsgänge sind noch nicht abgeschlossen`);
      return;
    }
    
    setProduktionData(prev => ({ ...prev, status: "abgeschlossen", fortschritt: 100 }));
    toast.success("Werkstattauftrag abgeschlossen");
  };

  // Pausieren/Fortsetzen
  const handleTogglePause = () => {
    if (produktionData.status === "pausiert") {
      setProduktionData(prev => ({ ...prev, status: "in-arbeit" }));
      toast.success("Auftrag fortgesetzt");
    } else {
      setProduktionData(prev => ({ ...prev, status: "pausiert" }));
      toast.info("Auftrag pausiert");
    }
  };

  const openOperations = arbeitsgänge.filter(ag => ag.status !== "erledigt");
  const inProgressOperations = arbeitsgänge.filter(ag => ag.status === "in-arbeit" || ag.status === "offen");

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
            <Badge className={statusConfig[produktionData.status]?.color || orderStatusConfig[produktionData.status]?.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[produktionData.status]?.label || orderStatusConfig[produktionData.status]?.label}
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
          <Button variant="outline" onClick={handleTogglePause}>
            {produktionData.status === "pausiert" ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Fortsetzen
              </>
            ) : (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pausieren
              </>
            )}
          </Button>
          <Button onClick={handleCompleteOrder} disabled={produktionData.status === "abgeschlossen"}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Abschliessen
          </Button>
          
          {/* 3-Punkt-Menü */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuItem onClick={() => setTimeTrackingOpen(true)}>
                <Timer className="mr-2 h-4 w-4" />
                Zeit erfassen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCompleteOperationOpen(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Arbeitsgang abschliessen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusChangeOpen(true)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Status ändern
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReportProblemOpen(true)}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Problem melden
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Drucken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("PDF wird generiert...")}>
                <FileText className="mr-2 h-4 w-4" />
                PDF exportieren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Arbeitsgänge</CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={() => setTimeTrackingOpen(true)}>
              <Timer className="mr-2 h-4 w-4" />
              Zeit erfassen
            </Button>
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

      {/* Zeit erfassen Dialog */}
      <Dialog open={timeTrackingOpen} onOpenChange={setTimeTrackingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Zeit erfassen
            </DialogTitle>
            <DialogDescription>
              Arbeitszeit direkt auf einen Arbeitsgang buchen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Arbeitsgang *</Label>
              <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                <SelectTrigger>
                  <SelectValue placeholder="Arbeitsgang auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {inProgressOperations.map(ag => (
                    <SelectItem key={ag.id} value={ag.id.toString()}>
                      {ag.id}. {ag.name} ({ag.ist}/{ag.geplant} Std.)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stunden</Label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="0"
                  value={timeHours}
                  onChange={(e) => setTimeHours(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Minuten</Label>
                <Select value={timeMinutes} onValueChange={setTimeMinutes}>
                  <SelectTrigger>
                    <SelectValue placeholder="0" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="0">0 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Mitarbeiter</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Mitarbeiter auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {mitarbeiterListe.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.kürzel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Datum</Label>
              <Input
                type="date"
                value={timeDate}
                onChange={(e) => setTimeDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Bemerkungen</Label>
              <Textarea
                placeholder="Optionale Notizen zur Arbeit..."
                value={timeNotes}
                onChange={(e) => setTimeNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimeTrackingOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleTimeTracking}>
              <Timer className="mr-2 h-4 w-4" />
              Zeit buchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status ändern Dialog */}
      <Dialog open={statusChangeOpen} onOpenChange={setStatusChangeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Status ändern</DialogTitle>
            <DialogDescription>
              Neuen Status für den Werkstattauftrag festlegen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label>Neuer Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="geplant">Geplant</SelectItem>
                <SelectItem value="in-arbeit">In Arbeit</SelectItem>
                <SelectItem value="pausiert">Pausiert</SelectItem>
                <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                <SelectItem value="storniert">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChangeOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleStatusChange}>
              Status ändern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Arbeitsgang abschliessen Dialog */}
      <Dialog open={completeOperationOpen} onOpenChange={setCompleteOperationOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Arbeitsgang abschliessen</DialogTitle>
            <DialogDescription>
              Arbeitsgang als erledigt markieren
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label>Arbeitsgang</Label>
            <Select value={selectedOperationForComplete} onValueChange={setSelectedOperationForComplete}>
              <SelectTrigger>
                <SelectValue placeholder="Arbeitsgang auswählen" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {openOperations.map(ag => (
                  <SelectItem key={ag.id} value={ag.id.toString()}>
                    {ag.id}. {ag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteOperationOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCompleteOperation}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Abschliessen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bearbeiten Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Werkstattauftrag bearbeiten</DialogTitle>
            <DialogDescription>
              Stammdaten des Auftrags anpassen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bezeichnung</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Priorität</Label>
              <Select value={editPriority} onValueChange={setEditPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="hoch">Hoch</SelectItem>
                  <SelectItem value="mittel">Mittel</SelectItem>
                  <SelectItem value="niedrig">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Liefertermin</Label>
              <Input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleEdit}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Problem melden Dialog */}
      <Dialog open={reportProblemOpen} onOpenChange={setReportProblemOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Problem melden
            </DialogTitle>
            <DialogDescription>
              Problem dokumentieren und Auftrag auf Problemstatus setzen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label>Problembeschreibung *</Label>
            <Textarea
              placeholder="Was ist das Problem? Beschreiben Sie die Situation..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportProblemOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleReportProblem}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Problem melden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Löschen AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Werkstattauftrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Werkstattauftrag "{produktionData.id}" wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
