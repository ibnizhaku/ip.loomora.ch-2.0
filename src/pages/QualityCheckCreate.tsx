import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, ClipboardCheck, Plus, X, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const availableChecklists = [
  {
    id: "TPL-001",
    name: "Schweissnaht-Prüfung EN 1090",
    category: "Schweissen",
    points: 8,
  },
  {
    id: "TPL-002",
    name: "Massgenauigkeit Stahlbau",
    category: "Massgenauigkeit",
    points: 6,
  },
  {
    id: "TPL-003",
    name: "Oberflächenbehandlung C3",
    category: "Oberfläche",
    points: 5,
  },
  {
    id: "TPL-004",
    name: "Schraubverbindungen",
    category: "Verbindungen",
    points: 4,
  },
  {
    id: "TPL-005",
    name: "Eingangsprüfung Material",
    category: "Wareneingang",
    points: 7,
  },
];

const categoryColors: Record<string, string> = {
  "Schweissen": "bg-orange-500/10 text-orange-600",
  "Massgenauigkeit": "bg-blue-500/10 text-blue-600",
  "Oberfläche": "bg-green-500/10 text-green-600",
  "Verbindungen": "bg-purple-500/10 text-purple-600",
  "Wareneingang": "bg-amber-500/10 text-amber-600",
};

export default function QualityCheckCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [productionOrder, setProductionOrder] = useState("");
  const [checkType, setCheckType] = useState("");
  const [inspector, setInspector] = useState("");
  const [plannedDate, setPlannedDate] = useState("");
  const [criteria, setCriteria] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);

  const handleSave = () => {
    if (!name || !productionOrder || !checkType) {
      toast.error("Bitte füllen Sie die Pflichtfelder aus");
      return;
    }
    toast.success("QS-Prüfung erstellt");
    navigate("/quality");
  };

  const toggleChecklist = (id: string) => {
    setSelectedChecklists((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const removeChecklist = (id: string) => {
    setSelectedChecklists((prev) => prev.filter((c) => c !== id));
  };

  const selectedChecklistData = availableChecklists.filter((c) =>
    selectedChecklists.includes(c.id)
  );
  const totalPoints = selectedChecklistData.reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neue QS-Prüfung</h1>
          <p className="text-muted-foreground">Qualitätsprüfung anlegen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Prüfungsdaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Prüfungsname *</Label>
              <Input 
                placeholder="z.B. Endkontrolle Baugruppe A" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Produktionsauftrag *</Label>
              <Select value={productionOrder} onValueChange={setProductionOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Auftrag wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PA-2024-001">PA-2024-001 - Gehäuse Typ A</SelectItem>
                  <SelectItem value="PA-2024-002">PA-2024-002 - Motorblock V8</SelectItem>
                  <SelectItem value="PA-2024-003">PA-2024-003 - Steuereinheit</SelectItem>
                  <SelectItem value="PA-2024-004">PA-2024-004 - Antriebswelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prüfungsart *</Label>
              <Select value={checkType} onValueChange={setCheckType}>
                <SelectTrigger>
                  <SelectValue placeholder="Art wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">Wareneingangsprüfung</SelectItem>
                  <SelectItem value="process">Fertigungsbegleitend</SelectItem>
                  <SelectItem value="final">Endkontrolle</SelectItem>
                  <SelectItem value="random">Stichprobe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Geplantes Datum</Label>
              <Input 
                type="date" 
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prüfer & Kriterien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Prüfer</Label>
              <Select value={inspector} onValueChange={setInspector}>
                <SelectTrigger>
                  <SelectValue placeholder="Prüfer wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mueller">Thomas Müller</SelectItem>
                  <SelectItem value="schmidt">Anna Schmidt</SelectItem>
                  <SelectItem value="weber">Michael Weber</SelectItem>
                  <SelectItem value="fischer">Lisa Fischer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prüfkriterien</Label>
              <Textarea 
                placeholder="z.B. Maßhaltigkeit, Oberflächenqualität, Funktionstest..."
                rows={4}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bemerkungen</Label>
              <Textarea 
                placeholder="Zusätzliche Hinweise zur Prüfung..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checklisten-Auswahl */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Checklisten
            {selectedChecklists.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedChecklists.length} ausgewählt • {totalPoints} Prüfpunkte
              </Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/quality/checklists">
              Vorlagen verwalten
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Ausgewählte Checklisten */}
          {selectedChecklistData.length > 0 && (
            <div className="mb-4 space-y-2">
              <Label className="text-sm text-muted-foreground">Ausgewählte Checklisten:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedChecklistData.map((checklist) => (
                  <Badge
                    key={checklist.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {checklist.name}
                    <span className="text-muted-foreground">({checklist.points} Punkte)</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-destructive/20"
                      onClick={() => removeChecklist(checklist.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Verfügbare Checklisten */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {availableChecklists.map((checklist) => {
              const isSelected = selectedChecklists.includes(checklist.id);
              return (
                <div
                  key={checklist.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "hover:border-primary/30"
                  }`}
                  onClick={() => toggleChecklist(checklist.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleChecklist(checklist.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{checklist.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${categoryColors[checklist.category] || ""}`}
                      >
                        {checklist.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {checklist.points} Punkte
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {availableChecklists.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>Keine Checklisten-Vorlagen vorhanden</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/quality/checklists/new">Erste Vorlage erstellen</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Prüfung anlegen
        </Button>
      </div>
    </div>
  );
}
