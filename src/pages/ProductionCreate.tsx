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
import { useCreateProductionOrder } from "@/hooks/use-production-orders";
import { useBoms } from "@/hooks/use-bom";
import { useProjects } from "@/hooks/use-projects";

export default function ProductionCreate() {
  const navigate = useNavigate();
  const createOrder = useCreateProductionOrder();
  const { data: bomsData } = useBoms({ pageSize: 100 });
  const { data: projectsData } = useProjects({ pageSize: 100 });
  const apiBOMs = (bomsData as any)?.data || [];
  const apiProjects = (projectsData as any)?.data || [];

  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [bomId, setBomId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
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
    if (!plannedStart) {
      toast.error("Bitte geben Sie ein Startdatum ein");
      return;
    }

    const extraInfo = [
      workstation && `Arbeitsplatz: ${workstation}`,
      team && `Team: ${team}`,
      plannedHours && `Geplante Stunden: ${plannedHours}`,
    ].filter(Boolean).join('\n');
    const fullNotes = [notes, extraInfo].filter(Boolean).join('\n---\n') || undefined;

    createOrder.mutate(
      {
        name,
        projectId: projectId || undefined,
        bomId: bomId || undefined,
        priority,
        plannedStartDate: plannedStart,
        plannedEndDate: plannedEnd || undefined,
        notes: fullNotes,
      } as any,
      {
        onSuccess: (data: any) => {
          toast.success("Werkstattauftrag erstellt");
          navigate(data?.id ? `/production/${data.id}` : "/production");
        },
        onError: () => toast.error("Fehler beim Erstellen des Auftrags"),
      }
    );
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
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiProjects.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.number} - {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stückliste (optional)</Label>
                <Select value={bomId} onValueChange={setBomId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stückliste wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiBOMs.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priorität</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Niedrig</SelectItem>
                  <SelectItem value="MEDIUM">Normal</SelectItem>
                  <SelectItem value="HIGH">Hoch</SelectItem>
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
        <Button className="gap-2" onClick={handleSave} disabled={createOrder.isPending}>
          <Save className="h-4 w-4" />
          {createOrder.isPending ? "Wird erstellt..." : "Auftrag erstellen"}
        </Button>
      </div>
    </div>
  );
}
