import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateQualityChecklist } from "@/hooks/use-quality-control";

interface CheckPoint {
  id: string;
  name: string;
  category: string;
  targetValue: string;
  weight: number;
}

export default function QualityChecklistCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateQualityChecklist();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [checkPoints, setCheckPoints] = useState<CheckPoint[]>([
    { id: crypto.randomUUID(), name: "", category: "", targetValue: "", weight: 10 },
  ]);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addCheckPoint = () => {
    setCheckPoints([
      ...checkPoints,
      { id: crypto.randomUUID(), name: "", category: "", targetValue: "", weight: 10 },
    ]);
  };

  const removeCheckPoint = (id: string) => {
    if (checkPoints.length > 1) {
      setCheckPoints(checkPoints.filter((cp) => cp.id !== id));
    }
  };

  const updateCheckPoint = (id: string, field: keyof CheckPoint, value: string | number) => {
    setCheckPoints(
      checkPoints.map((cp) => (cp.id === id ? { ...cp, [field]: value } : cp))
    );
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
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

  const handleSave = async () => {
    if (!name) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }
    if (checkPoints.some((cp) => !cp.name)) {
      toast.error("Bitte füllen Sie alle Prüfpunkte aus");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name,
        description: description || undefined,
        type: type || undefined,
        category: category || undefined,
        items: checkPoints.map((cp, index) => ({
          name: cp.name,
          description: cp.targetValue || undefined,
          required: true,
          sortOrder: index,
        })),
      } as any);
      toast.success("Checklisten-Vorlage erstellt");
      navigate("/quality/checklists");
    } catch {
      toast.error("Fehler beim Erstellen der Vorlage");
    }
  };

  const totalWeight = checkPoints.reduce((sum, cp) => sum + cp.weight, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/quality/checklists")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neue Checklisten-Vorlage</h1>
          <p className="text-muted-foreground">Prüfvorlage für Qualitätskontrollen erstellen</p>
        </div>
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
                placeholder="z.B. Schweissnaht-Prüfung EN 1090"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Input
                placeholder="z.B. Schweissen, Oberfläche..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Prüfungstyp</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOMING">Wareneingang</SelectItem>
                  <SelectItem value="IN_PROCESS">Fertigungsbegleitend</SelectItem>
                  <SelectItem value="FINAL">Endkontrolle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                placeholder="Optionale Beschreibung..."
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
                      placeholder="z.B. Sichtprüfung VT"
                      value={cp.name}
                      onChange={(e) => updateCheckPoint(cp.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Soll-Wert</Label>
                    <Input
                      placeholder="z.B. Klasse C"
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
        <Button onClick={handleSave} disabled={createMutation.isPending}>
          {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Vorlage speichern
        </Button>
      </div>
    </div>
  );
}
