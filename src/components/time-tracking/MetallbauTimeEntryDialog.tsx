import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Building2, Wrench, AlertTriangle } from "lucide-react";
import {
  useTimeTypes,
  useActivityTypes,
  useProjectPhases,
  useMachines,
  useCreateMetallbauTimeEntry,
  TimeTypeCode,
  WorkLocation,
  SurchargeType,
} from "@/hooks/use-metallbau";
import { useProjects } from "@/hooks/use-projects";
import { useCostCenters } from "@/hooks/use-cost-centers";
import { format } from "date-fns";

interface MetallbauTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  onSuccess?: () => void;
}

const TIME_TYPE_LABELS: Record<TimeTypeCode, string> = {
  [TimeTypeCode.PROJECT]: 'Projektzeit',
  [TimeTypeCode.ORDER]: 'Auftragszeit',
  [TimeTypeCode.GENERAL]: 'Allgemeine Tätigkeit',
  [TimeTypeCode.ADMIN]: 'Administration',
  [TimeTypeCode.TRAINING]: 'Weiterbildung',
  [TimeTypeCode.ABSENCE]: 'Abwesenheit',
};

const SURCHARGE_LABELS: Record<SurchargeType, { label: string; hint: string }> = {
  [SurchargeType.MONTAGE]: { label: 'Montagezuschlag', hint: '+15%' },
  [SurchargeType.NACHT]: { label: 'Nachtarbeit', hint: '+25%' },
  [SurchargeType.SAMSTAG]: { label: 'Samstagsarbeit', hint: '+25%' },
  [SurchargeType.SONNTAG]: { label: 'Sonntagsarbeit', hint: '+50%' },
  [SurchargeType.FEIERTAG]: { label: 'Feiertagsarbeit', hint: '+100%' },
  [SurchargeType.HOEHE]: { label: 'Höhenzuschlag', hint: '+3 CHF/h' },
  [SurchargeType.SCHMUTZ]: { label: 'Schmutzzuschlag', hint: '+2 CHF/h' },
};

export function MetallbauTimeEntryDialog({
  open,
  onOpenChange,
  defaultDate,
  onSuccess,
}: MetallbauTimeEntryDialogProps) {
  const [timeTypeCode, setTimeTypeCode] = useState<TimeTypeCode>(TimeTypeCode.PROJECT);
  const [activityTypeId, setActivityTypeId] = useState<string>("");
  const [costCenterId, setCostCenterId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [projectPhaseId, setProjectPhaseId] = useState<string>("");
  const [workLocation, setWorkLocation] = useState<WorkLocation | "">("");
  const [machineId, setMachineId] = useState<string>("");
  const [date, setDate] = useState(defaultDate || format(new Date(), "yyyy-MM-dd"));
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSurcharges, setSelectedSurcharges] = useState<SurchargeType[]>([]);
  const [baseHourlyRate, setBaseHourlyRate] = useState("");

  // Queries
  const { data: timeTypes } = useTimeTypes();
  const { data: activityTypes } = useActivityTypes();
  const { data: projectsData } = useProjects();
  const { data: costCentersData } = useCostCenters();
  const { data: projectPhases } = useProjectPhases(projectId);
  const { data: machinesData } = useMachines({ status: 'ACTIVE' as any });
  
  const createTimeEntry = useCreateMetallbauTimeEntry();

  const projects = projectsData?.data || [];
  const costCenters = costCentersData?.data || [];
  const machines = machinesData?.data || [];

  // Get current time type config
  const currentTimeType = timeTypes?.find(t => t.code === timeTypeCode);
  const isProjectRelevant = currentTimeType?.isProjectRelevant ?? false;

  // Reset project when time type changes to non-project-relevant
  useEffect(() => {
    if (!isProjectRelevant) {
      setProjectId("");
      setProjectPhaseId("");
    }
  }, [isProjectRelevant]);

  // Reset phase when project changes
  useEffect(() => {
    setProjectPhaseId("");
  }, [projectId]);

  // Auto-add Montagezuschlag when Baustelle selected
  useEffect(() => {
    if (workLocation === WorkLocation.BAUSTELLE && !selectedSurcharges.includes(SurchargeType.MONTAGE)) {
      setSelectedSurcharges(prev => [...prev, SurchargeType.MONTAGE]);
    }
  }, [workLocation, selectedSurcharges]);

  const handleSurchargeToggle = (surcharge: SurchargeType) => {
    setSelectedSurcharges(prev =>
      prev.includes(surcharge)
        ? prev.filter(s => s !== surcharge)
        : [...prev, surcharge]
    );
  };

  const handleSubmit = async () => {
    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    
    if (totalMinutes < 1) {
      toast.error("Bitte gültige Zeit eingeben (mindestens 1 Minute)");
      return;
    }

    if (!costCenterId) {
      toast.error("Bitte Kostenstelle auswählen");
      return;
    }

    if (isProjectRelevant && !projectId) {
      toast.error("Bitte Projekt auswählen (erforderlich für diesen Zeittyp)");
      return;
    }

    try {
      await createTimeEntry.mutateAsync({
        date,
        duration: totalMinutes,
        timeTypeCode,
        activityTypeId: activityTypeId || undefined,
        costCenterId,
        projectId: isProjectRelevant ? projectId : undefined,
        projectPhaseId: projectPhaseId || undefined,
        workLocation: workLocation as WorkLocation || undefined,
        machineId: machineId || undefined,
        baseHourlyRate: baseHourlyRate ? parseFloat(baseHourlyRate) : undefined,
        description: description || undefined,
        surcharges: selectedSurcharges.length > 0 ? selectedSurcharges : undefined,
      });

      toast.success("Zeiteintrag erstellt", {
        description: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min - ${TIME_TYPE_LABELS[timeTypeCode]}`,
      });

      // Reset form
      setHours("");
      setMinutes("");
      setDescription("");
      setSelectedSurcharges([]);
      setBaseHourlyRate("");
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Fehler beim Erstellen", {
        description: error?.message || "Bitte versuchen Sie es erneut",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Zeit erfassen (Metallbau)
          </DialogTitle>
          <DialogDescription>
            Duale Zeiterfassung mit automatischer Projektkostenbuchung
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Zeittyp - Kernauswahl */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Zeittyp *</Label>
            <Select value={timeTypeCode} onValueChange={(v) => setTimeTypeCode(v as TimeTypeCode)}>
              <SelectTrigger>
                <SelectValue placeholder="Zeittyp wählen" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIME_TYPE_LABELS).map(([code, label]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center gap-2">
                      {label}
                      {(code === TimeTypeCode.PROJECT || code === TimeTypeCode.ORDER) && (
                        <Badge variant="outline" className="text-xs">
                          Projektwirksam
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isProjectRelevant && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Diese Zeit wird automatisch auf das Projekt gebucht
              </p>
            )}
          </div>

          {/* Datum und Zeit */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Datum *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Stunden</Label>
              <Input
                type="number"
                placeholder="0"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Minuten</Label>
              <Input
                type="number"
                placeholder="0"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>
          </div>

          {/* Kostenstelle - immer erforderlich */}
          <div className="space-y-2">
            <Label>Kostenstelle *</Label>
            <Select value={costCenterId} onValueChange={setCostCenterId}>
              <SelectTrigger>
                <SelectValue placeholder="Kostenstelle wählen" />
              </SelectTrigger>
              <SelectContent>
                {costCenters.map((cc: any) => (
                  <SelectItem key={cc.id} value={cc.id}>
                    {cc.number} - {cc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Projekt - nur wenn projektwirksam */}
          {isProjectRelevant && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Projektzuordnung
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Projekt *</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Projekt wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.filter((p: any) => p.status !== 'completed' && p.status !== 'cancelled').map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.number} - {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Projektphase</Label>
                  <Select value={projectPhaseId} onValueChange={setProjectPhaseId} disabled={!projectId}>
                    <SelectTrigger>
                      <SelectValue placeholder={projectId ? "Phase wählen" : "Erst Projekt wählen"} />
                    </SelectTrigger>
                    <SelectContent>
                      {projectPhases?.map((phase) => (
                        <SelectItem key={phase.id} value={phase.id}>
                          {phase.name} ({phase.phaseType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Arbeitsort & Tätigkeit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Arbeitsort</Label>
              <Select value={workLocation} onValueChange={(v) => setWorkLocation(v as WorkLocation)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WorkLocation.WERKSTATT}>Werkstatt</SelectItem>
                  <SelectItem value={WorkLocation.BAUSTELLE}>Baustelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tätigkeit</Label>
              <Select value={activityTypeId} onValueChange={setActivityTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes?.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Maschine */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maschine (optional)
            </Label>
            <Select value={machineId} onValueChange={setMachineId}>
              <SelectTrigger>
                <SelectValue placeholder="Keine Maschine" />
              </SelectTrigger>
              <SelectContent>
                {machines.map((machine) => (
                  <SelectItem key={machine.id} value={machine.id}>
                    {machine.name} ({machine.machineType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zuschläge */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Zuschläge (GAV Metallbau)</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SURCHARGE_LABELS).map(([key, { label, hint }]) => (
                <div
                  key={key}
                  className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSurchargeToggle(key as SurchargeType)}
                >
                  <Checkbox
                    checked={selectedSurcharges.includes(key as SurchargeType)}
                    onCheckedChange={() => handleSurchargeToggle(key as SurchargeType)}
                  />
                  <div className="flex-1 text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground ml-1">({hint})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stundensatz Override */}
          <div className="space-y-2">
            <Label>Stundensatz (CHF, optional)</Label>
            <Input
              type="number"
              placeholder="Standard aus Mitarbeiterprofil"
              min="0"
              step="0.01"
              value={baseHourlyRate}
              onChange={(e) => setBaseHourlyRate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leer lassen für automatische Ermittlung aus Qualifikation/Projekt
            </p>
          </div>

          {/* Beschreibung */}
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea
              placeholder="Beschreiben Sie die durchgeführte Arbeit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={createTimeEntry.isPending}>
            {createTimeEntry.isPending ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
