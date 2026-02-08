import { useState, useRef, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface CheckPoint {
  id: string;
  name: string;
  targetValue: string;
  weight: number;
}


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
  
  const { data: apiData } = useQuery({
    queryKey: ["/quality", id],
    queryFn: () => api.get<any>(`/quality/${id}`),
    enabled: !!id,
  });
  
  const template = apiData?.data || null;
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [norm, setNorm] = useState("");
  const [execClass, setExecClass] = useState("");
  const [description, setDescription] = useState("");
  const [checkPoints, setCheckPoints] = useState<CheckPoint[]>([]);
  
  useEffect(() => {
    if (template) {
      setName(template.name || "");
      setCategory(template.category || "");
      setNorm(template.norm || "");
      setExecClass(template.execClass || "");
      setDescription(template.description || "");
      setCheckPoints(template.checkPoints || []);
    }
  }, [template]);
  
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
    toast.success(`Vorlage "${template?.id || id}" gelöscht`);
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
            <h1 className="font-display text-2xl font-bold">{template?.id || id}</h1>
            {template?.category && (
              <Badge variant="outline">{categoryLabels[template.category] || template.category}</Badge>
            )}
            {template?.norm && (
              <Badge variant="secondary">{normLabels[template.norm] || template.norm}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">{template?.name || ""}</p>
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
                  Möchten Sie die Vorlage "{template?.name || ""}" wirklich löschen? 
                  Diese Aktion kann nicht rückgängig gemacht werden.
                  {template?.usageCount !== undefined && ` Die Vorlage wurde ${template.usageCount}x verwendet.`}
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
            <p className="text-2xl font-bold">{template?.usageCount || 0}</p>
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
            <p className="text-2xl font-bold">{template?.lastUsed || "-"}</p>
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
