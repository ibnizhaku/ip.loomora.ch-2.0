import { useState, useEffect } from "react";
import { Save, Users, Mail, Bell, Plus, Trash2, GripVertical, ArrowRight, Palmtree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const STORAGE_KEY = "loomora_absence_workflow";

export interface AbsenceApprovalStage {
  id: string;
  name: string;
  role: string;
  absenceTypes: string[]; // Which absence types require this stage
  minDays: number; // Only required if absence is >= minDays
  timeoutDays: number;
  escalateTo?: string;
}

export interface AbsenceNotificationSettings {
  onSubmission: boolean;
  onApproval: boolean;
  onRejection: boolean;
  onEscalation: boolean;
  reminderDays: number;
  emailRecipients: {
    employee: boolean;
    approver: boolean;
    hr: boolean;
    teamLead: boolean;
  };
}

export interface AbsenceWorkflowConfig {
  enabled: boolean;
  requireRejectionReason: boolean;
  stages: AbsenceApprovalStage[];
  notifications: AbsenceNotificationSettings;
}

export const DEFAULT_ABSENCE_WORKFLOW: AbsenceWorkflowConfig = {
  enabled: true,
  requireRejectionReason: true,
  stages: [
    {
      id: "1",
      name: "Teamleiter",
      role: "team_lead",
      absenceTypes: ["Ferien", "Fortbildung", "Sonderurlaub"],
      minDays: 0,
      timeoutDays: 2,
      escalateTo: "hr",
    },
    {
      id: "2",
      name: "HR / Personal",
      role: "hr",
      absenceTypes: ["Ferien", "Fortbildung", "Sonderurlaub", "Mutterschaft", "Vaterschaft"],
      minDays: 5,
      timeoutDays: 3,
    },
  ],
  notifications: {
    onSubmission: true,
    onApproval: true,
    onRejection: true,
    onEscalation: true,
    reminderDays: 1,
    emailRecipients: {
      employee: true,
      approver: true,
      hr: false,
      teamLead: true,
    },
  },
};

// Absence types that typically don't need approval (just confirmation)
export const AUTO_CONFIRMED_TYPES = ["Krankheit", "Unfall", "Militär"];

export const loadAbsenceWorkflowConfig = (): AbsenceWorkflowConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading absence workflow config:", error);
  }
  return DEFAULT_ABSENCE_WORKFLOW;
};

const saveAbsenceWorkflowConfig = (config: AbsenceWorkflowConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving absence workflow config:", error);
  }
};

export const getRequiredAbsenceStages = (
  absenceType: string,
  days: number,
  config: AbsenceWorkflowConfig = loadAbsenceWorkflowConfig()
): AbsenceApprovalStage[] => {
  if (!config.enabled) return [];
  
  // Auto-confirmed types don't need approval workflow
  if (AUTO_CONFIRMED_TYPES.includes(absenceType)) return [];
  
  return config.stages.filter(stage => {
    const typeMatches = stage.absenceTypes.includes(absenceType);
    const daysMatches = days >= stage.minDays;
    return typeMatches && daysMatches;
  });
};

const ROLE_OPTIONS = [
  { value: "team_lead", label: "Teamleiter" },
  { value: "hr", label: "HR / Personal" },
  { value: "management", label: "Geschäftsleitung" },
];

const ABSENCE_TYPE_OPTIONS = [
  "Ferien",
  "Fortbildung",
  "Sonderurlaub",
  "Mutterschaft",
  "Vaterschaft",
];

interface AbsenceWorkflowSettingsProps {
  onSave?: (config: AbsenceWorkflowConfig) => void;
}

export default function AbsenceWorkflowSettings({ onSave }: AbsenceWorkflowSettingsProps) {
  const [config, setConfig] = useState<AbsenceWorkflowConfig>(DEFAULT_ABSENCE_WORKFLOW);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedConfig = loadAbsenceWorkflowConfig();
    setConfig(savedConfig);
  }, []);

  const updateStage = (index: number, field: keyof AbsenceApprovalStage, value: string | number | string[]) => {
    setConfig(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...stage, [field]: value } : stage
      ),
    }));
    setHasChanges(true);
  };

  const addStage = () => {
    const newStage: AbsenceApprovalStage = {
      id: String(Date.now()),
      name: "Neue Stufe",
      role: "management",
      absenceTypes: ["Ferien"],
      minDays: 10,
      timeoutDays: 3,
    };
    setConfig(prev => ({
      ...prev,
      stages: [...prev.stages, newStage],
    }));
    setHasChanges(true);
  };

  const removeStage = (index: number) => {
    if (config.stages.length <= 1) {
      toast.error("Mindestens eine Genehmigungsstufe erforderlich");
      return;
    }
    setConfig(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const updateNotification = (field: keyof AbsenceNotificationSettings, value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }));
    setHasChanges(true);
  };

  const updateEmailRecipient = (field: keyof AbsenceNotificationSettings["emailRecipients"], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        emailRecipients: { ...prev.notifications.emailRecipients, [field]: value },
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveAbsenceWorkflowConfig(config);
      onSave?.(config);
      setHasChanges(false);
      toast.success("Abwesenheits-Workflow gespeichert", {
        description: "Der Genehmigungsprozess wurde aktualisiert.",
      });
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Palmtree className="h-5 w-5" />
          Abwesenheits-Workflow
        </h2>
        <p className="text-sm text-muted-foreground">
          Genehmigungsprozess für Ferien und andere Abwesenheiten
        </p>
      </div>

      <Separator />

      {/* Enable/Disable Workflow */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mehrstufige Genehmigung aktivieren</p>
              <p className="text-sm text-muted-foreground">
                Abwesenheitsanträge durchlaufen die definierten Freigabestufen
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => {
                setConfig(prev => ({ ...prev, enabled: checked }));
                setHasChanges(true);
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ablehnungsgrund erforderlich</p>
              <p className="text-sm text-muted-foreground">
                Bei Ablehnung muss eine Begründung eingegeben werden
              </p>
            </div>
            <Switch
              checked={config.requireRejectionReason}
              onCheckedChange={(checked) => {
                setConfig(prev => ({ ...prev, requireRejectionReason: checked }));
                setHasChanges(true);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-confirmed info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <p className="text-sm">
            <span className="font-medium">Automatisch bestätigt:</span>{" "}
            <span className="text-muted-foreground">
              Krankheit, Unfall und Militär werden ohne Genehmigungsworkflow direkt bestätigt 
              (Arztzeugnis/SUVA-Meldung erforderlich).
            </span>
          </p>
        </CardContent>
      </Card>

      {config.enabled && (
        <>
          {/* Approval Stages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Genehmigungsstufen</CardTitle>
              <CardDescription>
                Definieren Sie die Freigabestufen nach Abwesenheitsart und Dauer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Visual workflow */}
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 overflow-x-auto">
                <Badge variant="outline" className="whitespace-nowrap">Antrag</Badge>
                {config.stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Badge 
                      className="whitespace-nowrap"
                      variant={index === 0 ? "default" : "secondary"}
                    >
                      {stage.name}
                      {stage.minDays > 0 && (
                        <span className="ml-1 text-xs opacity-75">
                          (ab {stage.minDays} Tage)
                        </span>
                      )}
                    </Badge>
                  </div>
                ))}
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Badge variant="outline" className="bg-success/10 text-success whitespace-nowrap">
                  Genehmigt
                </Badge>
              </div>

              {/* Stage configuration */}
              <div className="space-y-4">
                {config.stages.map((stage, index) => (
                  <div 
                    key={stage.id} 
                    className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                      <span className="font-medium text-foreground">{index + 1}.</span>
                    </div>
                    
                    <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <Label>Stufenname</Label>
                        <Input
                          value={stage.name}
                          onChange={(e) => updateStage(index, "name", e.target.value)}
                          placeholder="z.B. Teamleiter"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Zuständige Rolle</Label>
                        <Select
                          value={stage.role}
                          onValueChange={(value) => updateStage(index, "role", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Ab Anzahl Tage</Label>
                        <Input
                          type="number"
                          min="0"
                          value={stage.minDays}
                          onChange={(e) => updateStage(index, "minDays", parseInt(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          {index === 0 ? "Immer erforderlich" : "Nur bei längeren Abwesenheiten"}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Timeout (Tage)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="14"
                          value={stage.timeoutDays}
                          onChange={(e) => updateStage(index, "timeoutDays", parseInt(e.target.value) || 2)}
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive mt-2"
                      onClick={() => removeStage(index)}
                      disabled={config.stages.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={addStage} className="gap-2">
                <Plus className="h-4 w-4" />
                Stufe hinzufügen
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                E-Mail-Benachrichtigungen
              </CardTitle>
              <CardDescription>
                Automatische Benachrichtigungen bei Workflow-Ereignissen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Bei Antragstellung</span>
                  </div>
                  <Switch
                    checked={config.notifications.onSubmission}
                    onCheckedChange={(checked) => updateNotification("onSubmission", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-success" />
                    <span>Bei Genehmigung</span>
                  </div>
                  <Switch
                    checked={config.notifications.onApproval}
                    onCheckedChange={(checked) => updateNotification("onApproval", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-destructive" />
                    <span>Bei Ablehnung</span>
                  </div>
                  <Switch
                    checked={config.notifications.onRejection}
                    onCheckedChange={(checked) => updateNotification("onRejection", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-warning" />
                    <span>Bei Eskalation</span>
                  </div>
                  <Switch
                    checked={config.notifications.onEscalation}
                    onCheckedChange={(checked) => updateNotification("onEscalation", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>E-Mail-Empfänger</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.notifications.emailRecipients.employee}
                      onCheckedChange={(checked) => updateEmailRecipient("employee", checked)}
                    />
                    <span className="text-sm">Mitarbeiter/in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.notifications.emailRecipients.approver}
                      onCheckedChange={(checked) => updateEmailRecipient("approver", checked)}
                    />
                    <span className="text-sm">Aktuelle Genehmiger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.notifications.emailRecipients.teamLead}
                      onCheckedChange={(checked) => updateEmailRecipient("teamLead", checked)}
                    />
                    <span className="text-sm">Teamleiter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.notifications.emailRecipients.hr}
                      onCheckedChange={(checked) => updateEmailRecipient("hr", checked)}
                    />
                    <span className="text-sm">HR / Personal</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-2 pt-4">
        {hasChanges && (
          <Badge variant="outline" className="text-warning">
            Ungespeicherte Änderungen
          </Badge>
        )}
        <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? "Speichern..." : "Workflow speichern"}
        </Button>
      </div>
    </div>
  );
}
