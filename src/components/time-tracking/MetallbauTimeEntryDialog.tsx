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
import { Clock, Building2, Wrench, AlertTriangle, Info } from "lucide-react";
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

// ============================================
// METALLBAU-SPEZIFISCHE LABELS
// ============================================

const TIME_TYPE_LABELS: Record<TimeTypeCode, { label: string; description: string }> = {
  [TimeTypeCode.PROJECT]: { 
    label: 'Projektarbeit', 
    description: 'Direkte Arbeit an Kundenaufträgen' 
  },
  [TimeTypeCode.ORDER]: { 
    label: 'Auftragsarbeit', 
    description: 'Spezifische Bestellungsarbeit' 
  },
  [TimeTypeCode.GENERAL]: { 
    label: 'Werkstattzeit', 
    description: 'Rüsten, Aufräumen, Instandhaltung' 
  },
  [TimeTypeCode.ADMIN]: { 
    label: 'Bürozeit', 
    description: 'Verwaltung, Offerten, Planung' 
  },
  [TimeTypeCode.TRAINING]: { 
    label: 'Qualifikation', 
    description: 'Weiterbildung, Lehrlingsbetreuung' 
  },
  [TimeTypeCode.ABSENCE]: { 
    label: 'Abwesenheit', 
    description: 'Ferien, Krankheit, Militär' 
  },
};

const SURCHARGE_LABELS: Record<SurchargeType, { label: string; hint: string }> = {
  [SurchargeType.MONTAGE]: { label: 'Baustellenzuschlag', hint: '+15%' },
  [SurchargeType.NACHT]: { label: 'Nachtarbeit', hint: '+25%' },
  [SurchargeType.SAMSTAG]: { label: 'Samstagsarbeit', hint: '+25%' },
  [SurchargeType.SONNTAG]: { label: 'Sonntagsarbeit', hint: '+50%' },
  [SurchargeType.FEIERTAG]: { label: 'Feiertagsarbeit', hint: '+100%' },
  [SurchargeType.HOEHE]: { label: 'Höhenarbeit (>5m)', hint: '+CHF 2.50/h' },
  [SurchargeType.SCHMUTZ]: { label: 'Schmutzarbeit', hint: '+CHF 1.50/h' },
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

  // Auto-add Baustellenzuschlag when Baustelle selected
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
      toast.error("Bitte Auftrag/Projekt auswählen (erforderlich für diesen Zeittyp)");
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

      toast.success("Betriebszeit erfasst", {
        description: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min - ${TIME_TYPE_LABELS[timeTypeCode].label}`,
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
      toast.error("Fehler beim Erfassen", {
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
            Betriebszeit erfassen
          </DialogTitle>
          <DialogDescription>
            Was hast du heute im Betrieb gemacht?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Zeittyp - Kernauswahl */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Was hast du gemacht? *</Label>
            <Select value={timeTypeCode} onValueChange={(v) => setTimeTypeCode(v as TimeTypeCode)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Art der Tätigkeit wählen" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIME_TYPE_LABELS).map(([code, { label, description }]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        {label}
                        {(code === TimeTypeCode.PROJECT || code === TimeTypeCode.ORDER) && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                            Auftragswirksam
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isProjectRelevant && (
              <p className="text-xs text-primary flex items-center gap-1 bg-primary/5 p-2 rounded">
                <Info className="h-3 w-3" />
                Diese Zeit wird automatisch auf den Auftrag gebucht (Projektkosten)
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

          {/* Projekt/Auftrag - nur wenn projektwirksam */}
          {isProjectRelevant && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Auftragszuordnung
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Auftrag / Projekt *</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auftrag wählen" />
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
                  <Label>Fertigungsphase</Label>
                  <Select value={projectPhaseId} onValueChange={setProjectPhaseId} disabled={!projectId}>
                    <SelectTrigger>
                      <SelectValue placeholder={projectId ? "Phase wählen" : "Erst Auftrag wählen"} />
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
                  <SelectValue placeholder="Wo gearbeitet?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WorkLocation.WERKSTATT}>
                    <div className="flex flex-col items-start">
                      <span>Werkstatt</span>
                      <span className="text-xs text-muted-foreground">Ohne Zuschlag</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={WorkLocation.BAUSTELLE}>
                    <div className="flex flex-col items-start">
                      <span>Baustelle / Montage</span>
                      <span className="text-xs text-muted-foreground">+15% Baustellenzuschlag</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tätigkeit</Label>
              <Select value={activityTypeId} onValueChange={setActivityTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Art der Arbeit" />
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
            <p className="text-xs text-muted-foreground">
              Maschinenstunden werden separat auf den Auftrag gebucht
            </p>
          </div>

          {/* Zuschläge */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Zuschläge (GAV Metallbau Schweiz)</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SURCHARGE_LABELS).map(([key, { label, hint }]) => (
                <div
                  key={key}
                  className={`flex items-center space-x-2 p-3 rounded border cursor-pointer transition-colors ${
                    selectedSurcharges.includes(key as SurchargeType)
                      ? 'bg-primary/10 border-primary/30'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleSurchargeToggle(key as SurchargeType)}
                >
                  <Checkbox
                    checked={selectedSurcharges.includes(key as SurchargeType)}
                    onCheckedChange={() => handleSurchargeToggle(key as SurchargeType)}
                  />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-primary ml-2 font-semibold">{hint}</span>
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
              placeholder="Standard aus GAV-Lohnklasse"
              min="0"
              step="0.01"
              value={baseHourlyRate}
              onChange={(e) => setBaseHourlyRate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leer lassen für automatische Ermittlung aus Lohnklasse/Qualifikation
            </p>
          </div>

          {/* Beschreibung */}
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea
              placeholder="Was wurde gemacht? (z.B. Geländer geschweisst, Treppe montiert...)"
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
            {createTimeEntry.isPending ? "Wird gespeichert..." : "Betriebszeit speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
