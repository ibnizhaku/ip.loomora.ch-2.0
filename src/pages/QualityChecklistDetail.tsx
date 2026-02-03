import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2, GripVertical, Plus, Copy, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface CheckPoint {
  id: string;
  name: string;
  targetValue: string;
  weight: number;
}

// Mock data for existing templates
const templatesData: Record<string, {
  id: string;
  name: string;
  category: string;
  norm: string;
  execClass: string;
  description: string;
  usageCount: number;
  lastUsed: string;
  checkPoints: CheckPoint[];
}> = {
  "TPL-001": {
    id: "TPL-001",
    name: "Schweissnaht-Prüfung EN 1090",
    category: "schweissen",
    norm: "en1090-2",
    execClass: "exc2",
    description: "Standardprüfung für Schweissnähte nach SN EN 1090-2",
    usageCount: 45,
    lastUsed: "29.01.2024",
    checkPoints: [
      { id: "1", name: "Sichtprüfung VT", targetValue: "Klasse C", weight: 20 },
      { id: "2", name: "Nahtvorbereitung", targetValue: "ISO 9692-1", weight: 15 },
      { id: "3", name: "Nahtdicke a-Mass", targetValue: "a=5mm min", weight: 20 },
      { id: "4", name: "Nahtlänge", targetValue: "±2mm", weight: 15 },
      { id: "5", name: "Einbrandtiefe", targetValue: "≥3mm", weight: 15 },
      { id: "6", name: "Porenfreiheit", targetValue: "Klasse C", weight: 15 },
    ],
  },
  "TPL-002": {
    id: "TPL-002",
    name: "Massgenauigkeit Stahlbau",
    category: "massgenauigkeit",
    norm: "en1090-2",
    execClass: "exc2",
    description: "Prüfung der Massgenauigkeit für Stahlbauteile",
    usageCount: 38,
    lastUsed: "28.01.2024",
    checkPoints: [
      { id: "1", name: "Längenmasse", targetValue: "±2mm", weight: 25 },
      { id: "2", name: "Winkelmasse", targetValue: "±1°", weight: 20 },
      { id: "3", name: "Ebenheit", targetValue: "≤3mm/m", weight: 20 },
      { id: "4", name: "Lochabstände", targetValue: "±1mm", weight: 20 },
      { id: "5", name: "Diagonalen", targetValue: "±3mm", weight: 15 },
    ],
  },
  "TPL-003": {
    id: "TPL-003",
    name: "Oberflächenbehandlung C3",
    category: "oberflaeche",
    norm: "iso12944",
    execClass: "",
    description: "Korrosionsschutzprüfung nach ISO 12944 für Kategorie C3",
    usageCount: 32,
    lastUsed: "27.01.2024",
    checkPoints: [
      { id: "1", name: "Oberflächenvorbereitung", targetValue: "Sa 2½", weight: 25 },
      { id: "2", name: "Grundierung", targetValue: "≥40μm", weight: 20 },
      { id: "3", name: "Zwischenbeschichtung", targetValue: "≥40μm", weight: 20 },
      { id: "4", name: "Deckbeschichtung", targetValue: "≥40μm", weight: 20 },
      { id: "5", name: "Gesamtschichtdicke", targetValue: "≥120μm", weight: 15 },
    ],
  },
  "TPL-004": {
    id: "TPL-004",
    name: "Schraubverbindungen",
    category: "verbindungen",
    norm: "en1090-2",
    execClass: "exc2",
    description: "Prüfung von Schraubverbindungen im Stahlbau",
    usageCount: 28,
    lastUsed: "25.01.2024",
    checkPoints: [
      { id: "1", name: "Schraubenqualität", targetValue: "8.8 / 10.9", weight: 25 },
      { id: "2", name: "Anzugsmoment", targetValue: "M.A.", weight: 30 },
      { id: "3", name: "Unterlegscheiben", targetValue: "vorhanden", weight: 20 },
      { id: "4", name: "Korrosionsschutz", targetValue: "feuerverzinkt", weight: 25 },
    ],
  },
  "TPL-005": {
    id: "TPL-005",
    name: "Eingangsprüfung Material",
    category: "wareneingang",
    norm: "iso9001",
    execClass: "",
    description: "Wareneingangskontrolle für Rohmaterial",
    usageCount: 52,
    lastUsed: "24.01.2024",
    checkPoints: [
      { id: "1", name: "Werkstoffzeugnis", targetValue: "3.1", weight: 20 },
      { id: "2", name: "Materialkennzeichnung", targetValue: "vorhanden", weight: 15 },
      { id: "3", name: "Abmessungen", targetValue: "lt. Bestellung", weight: 20 },
      { id: "4", name: "Oberflächenzustand", targetValue: "i.O.", weight: 15 },
      { id: "5", name: "Menge", targetValue: "lt. Lieferschein", weight: 15 },
      { id: "6", name: "Verpackung", targetValue: "unbeschädigt", weight: 15 },
    ],
  },
};

const categoryLabels: Record<string, string> = {
  schweissen: "Schweissen",
  massgenauigkeit: "Massgenauigkeit",
  oberflaeche: "Oberfläche",
  verbindungen: "Verbindungen",
  wareneingang: "Wareneingang",
  endkontrolle: "Endkontrolle",
};

const normLabels: Record<string, string> = {
  "en1090-2": "SN EN 1090-2",
  iso12944: "ISO 12944",
  iso9001: "ISO 9001",
  iso3834: "ISO 3834",
};

export default function QualityChecklistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const template = templatesData[id || ""] || templatesData["TPL-001"];
  
  const [name, setName] = useState(template.name);
  const [category, setCategory] = useState(template.category);
  const [norm, setNorm] = useState(template.norm);
  const [execClass, setExecClass] = useState(template.execClass);
  const [description, setDescription] = useState(template.description);
  const [checkPoints, setCheckPoints] = useState<CheckPoint[]>(template.checkPoints);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addCheckPoint = () => {
    setCheckPoints([
      ...checkPoints,
      { id: crypto.randomUUID(), name: "", targetValue: "", weight: 10 },
    ]);
  };

  const removeCheckPoint = (cpId: string) => {
    if (checkPoints.length > 1) {
      setCheckPoints(checkPoints.filter((cp) => cp.id !== cpId));
    }
  };

  const updateCheckPoint = (cpId: string, field: keyof CheckPoint, value: string | number) => {
    setCheckPoints(
      checkPoints.map((cp) => (cp.id === cpId ? { ...cp, [field]: value } : cp))
    );
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newCheckPoints = [...checkPoints];
      const draggedItem = newCheckPoints[dragItem.current];
      newCheckPoints.splice(dragItem.current, 1);
      newCheckPoints.splice(dragOverItem.current, 0, draggedItem);
      setCheckPoints(newCheckPoints);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSave = () => {
    if (!name) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }
    if (checkPoints.some((cp) => !cp.name)) {
      toast.error("Bitte füllen Sie alle Prüfpunkte aus");
      return;
    }
    toast.success("Checklisten-Vorlage gespeichert");
    navigate("/quality/checklists");
  };

  const handleDuplicate = () => {
    toast.success(`Vorlage "${name}" dupliziert`);
    navigate("/quality/checklists");
  };

  const handleDelete = () => {
    toast.success(`Vorlage "${template.id}" gelöscht`);
    navigate("/quality/checklists");
  };

  const totalWeight = checkPoints.reduce((sum, cp) => sum + cp.weight, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/quality/checklists")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{template.id}</h1>
            <Badge variant="outline">{categoryLabels[template.category] || template.category}</Badge>
            {template.norm && (
              <Badge variant="secondary">{normLabels[template.norm] || template.norm}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">{template.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplizieren
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Vorlage löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchten Sie die Vorlage "{template.name}" wirklich löschen? 
                  Diese Aktion kann nicht rückgängig gemacht werden.
                  Die Vorlage wurde {template.usageCount}x verwendet.
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verwendungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{template.usageCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prüfpunkte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{checkPoints.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zuletzt verwendet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{template.lastUsed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grunddaten */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Grunddaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Vorlagenname *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="schweissen">Schweissen</SelectItem>
                  <SelectItem value="massgenauigkeit">Massgenauigkeit</SelectItem>
                  <SelectItem value="oberflaeche">Oberfläche</SelectItem>
                  <SelectItem value="verbindungen">Verbindungen</SelectItem>
                  <SelectItem value="wareneingang">Wareneingang</SelectItem>
                  <SelectItem value="endkontrolle">Endkontrolle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prüfnorm</Label>
              <Select value={norm} onValueChange={setNorm}>
                <SelectTrigger>
                  <SelectValue placeholder="Norm wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en1090-2">SN EN 1090-2</SelectItem>
                  <SelectItem value="iso12944">ISO 12944</SelectItem>
                  <SelectItem value="iso9001">ISO 9001</SelectItem>
                  <SelectItem value="iso3834">ISO 3834</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ausführungsklasse</Label>
              <Select value={execClass} onValueChange={setExecClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Klasse wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exc1">EXC1</SelectItem>
                  <SelectItem value="exc2">EXC2</SelectItem>
                  <SelectItem value="exc3">EXC3</SelectItem>
                  <SelectItem value="exc4">EXC4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prüfpunkte */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Prüfpunkte ({checkPoints.length})
              {totalWeight !== 100 && (
                <span className="ml-2 text-sm font-normal text-warning">
                  Gewichtung: {totalWeight}% (sollte 100% sein)
                </span>
              )}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addCheckPoint}>
              <Plus className="mr-2 h-4 w-4" />
              Prüfpunkt
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkPoints.map((cp, index) => (
              <div
                key={cp.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 transition-opacity hover:border-primary/30"
              >
                <div 
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground transition-colors"
                  title="Zum Umsortieren ziehen"
                >
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1 grid gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs">Prüfpunkt *</Label>
                    <Input
                      value={cp.name}
                      onChange={(e) => updateCheckPoint(cp.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Soll-Wert</Label>
                    <Input
                      value={cp.targetValue}
                      onChange={(e) => updateCheckPoint(cp.id, "targetValue", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gewicht (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={cp.weight}
                      onChange={(e) =>
                        updateCheckPoint(cp.id, "weight", parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeCheckPoint(cp.id)}
                  disabled={checkPoints.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/quality/checklists")}>
          Abbrechen
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Änderungen speichern
        </Button>
      </div>
    </div>
  );
}
