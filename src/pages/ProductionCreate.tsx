import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Factory, Calendar, Clock, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProductionCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [bomNumber, setBomNumber] = useState("");
  const [priority, setPriority] = useState("normal");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [plannedHours, setPlannedHours] = useState("");
  const [workstation, setWorkstation] = useState("");
  const [team, setTeam] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!name) {
      toast.error("Bitte geben Sie eine Bezeichnung ein");
      return;
    }
    if (!plannedStart || !plannedEnd) {
      toast.error("Bitte geben Sie Start- und Enddatum ein");
      return;
    }
    toast.success("Werkstattauftrag erstellt");
    navigate("/production");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neuer Werkstattauftrag</h1>
          <p className="text-muted-foreground">Produktionsauftrag anlegen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Auftragsdaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bezeichnung *</Label>
              <Input
                placeholder="z.B. Metalltreppe 3-geschossig"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Projekt (optional)</Label>
                <Input
                  placeholder="PRJ-2024-XXX"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Stückliste (optional)</Label>
                <Input
                  placeholder="STL-2024-XXX"
                  value={bomNumber}
                  onChange={(e) => setBomNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priorität</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="urgent">Dringend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Planung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Geplanter Start *</Label>
                <Input
                  type="date"
                  value={plannedStart}
                  onChange={(e) => setPlannedStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Geplantes Ende *</Label>
                <Input
                  type="date"
                  value={plannedEnd}
                  onChange={(e) => setPlannedEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Geplante Stunden
              </Label>
              <Input
                type="number"
                placeholder="z.B. 40"
                value={plannedHours}
                onChange={(e) => setPlannedHours(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Ressourcen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Arbeitsplatz</Label>
              <Select value={workstation} onValueChange={setWorkstation}>
                <SelectTrigger>
                  <SelectValue placeholder="Arbeitsplatz wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="schweisserei-1">Schweisserei 1</SelectItem>
                  <SelectItem value="schweisserei-2">Schweisserei 2</SelectItem>
                  <SelectItem value="montage">Montage</SelectItem>
                  <SelectItem value="lackiererei">Lackiererei</SelectItem>
                  <SelectItem value="cnc">CNC-Bearbeitung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team / Mitarbeiter
              </Label>
              <Input
                placeholder="z.B. M. Steiner, A. Meier"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Kommagetrennte Namen</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bemerkungen</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Zusätzliche Hinweise zum Auftrag..."
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Abbrechen
        </Button>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Auftrag erstellen
        </Button>
      </div>
    </div>
  );
}
