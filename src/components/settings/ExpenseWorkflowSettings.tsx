import { useState, useEffect } from "react";
import { Save, Users, Mail, Bell, Plus, Trash2, GripVertical, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const STORAGE_KEY = "loomora_expense_workflow";

export interface ApprovalStage {
  id: string;
  name: string;
  role: string;
  threshold: number; // Amount threshold - this stage only required if amount exceeds
  autoApprove: boolean; // Auto-approve if under threshold
  timeoutDays: number; // Days until escalation
  escalateTo?: string; // Role to escalate to
}

export interface NotificationSettings {
  onSubmission: boolean;
  onApproval: boolean;
  onRejection: boolean;
  onEscalation: boolean;
  reminderDays: number;
  emailRecipients: {
    submitter: boolean;
    approver: boolean;
    hr: boolean;
    finance: boolean;
  };
}

export interface ExpenseWorkflowConfig {
  enabled: boolean;
  stages: ApprovalStage[];
  notifications: NotificationSettings;
}

export const DEFAULT_WORKFLOW_CONFIG: ExpenseWorkflowConfig = {
  enabled: true,
  stages: [
    {
      id: "1",
      name: "Teamleiter",
      role: "team_lead",
      threshold: 0,
      autoApprove: false,
      timeoutDays: 3,
      escalateTo: "hr",
    },
    {
      id: "2",
      name: "HR / Personal",
      role: "hr",
      threshold: 500,
      autoApprove: true,
      timeoutDays: 5,
      escalateTo: "finance",
    },
    {
      id: "3",
      name: "Buchhaltung",
      role: "finance",
      threshold: 1000,
      autoApprove: true,
      timeoutDays: 7,
    },
  ],
  notifications: {
    onSubmission: true,
    onApproval: true,
    onRejection: true,
    onEscalation: true,
    reminderDays: 2,
    emailRecipients: {
      submitter: true,
      approver: true,
      hr: false,
      finance: false,
    },
  },
};

// Helper to load workflow config from localStorage
export const loadWorkflowConfig = (): ExpenseWorkflowConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading workflow config:", error);
  }
  return DEFAULT_WORKFLOW_CONFIG;
};

// Helper to save workflow config to localStorage
const saveWorkflowConfig = (config: ExpenseWorkflowConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving workflow config:", error);
  }
};

// Get current approval stage for an expense
export const getCurrentApprovalStage = (
  amount: number,
  currentStageIndex: number,
  config: ExpenseWorkflowConfig = loadWorkflowConfig()
): { stage: ApprovalStage; isLast: boolean; autoApproved: boolean } | null => {
  if (!config.enabled || config.stages.length === 0) {
    return null;
  }

  const stage = config.stages[currentStageIndex];
  if (!stage) return null;

  const isLast = currentStageIndex === config.stages.length - 1;
  const autoApproved = stage.autoApprove && amount < stage.threshold;

  return { stage, isLast, autoApproved };
};

// Get all required stages for a given amount
export const getRequiredStages = (
  amount: number,
  config: ExpenseWorkflowConfig = loadWorkflowConfig()
): ApprovalStage[] => {
  if (!config.enabled) return [];
  
  return config.stages.filter((stage, index) => {
    // First stage is always required
    if (index === 0) return true;
    // Other stages only if amount exceeds their threshold
    return amount >= stage.threshold;
  });
};

const ROLE_OPTIONS = [
  { value: "team_lead", label: "Teamleiter" },
  { value: "hr", label: "HR / Personal" },
  { value: "finance", label: "Buchhaltung" },
  { value: "management", label: "Geschäftsleitung" },
  { value: "cfo", label: "CFO" },
];

interface ExpenseWorkflowSettingsProps {
  onSave?: (config: ExpenseWorkflowConfig) => void;
}

export default function ExpenseWorkflowSettings({ onSave }: ExpenseWorkflowSettingsProps) {
  const [config, setConfig] = useState<ExpenseWorkflowConfig>(DEFAULT_WORKFLOW_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedConfig = loadWorkflowConfig();
    setConfig(savedConfig);
  }, []);

  const updateStage = (index: number, field: keyof ApprovalStage, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...stage, [field]: value } : stage
      ),
    }));
    setHasChanges(true);
  };

  const addStage = () => {
    const newStage: ApprovalStage = {
      id: String(Date.now()),
      name: "Neue Stufe",
      role: "management",
      threshold: (config.stages[config.stages.length - 1]?.threshold || 0) + 500,
      autoApprove: true,
      timeoutDays: 5,
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

  const updateNotification = (field: keyof NotificationSettings, value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }));
    setHasChanges(true);
  };

  const updateEmailRecipient = (field: keyof NotificationSettings["emailRecipients"], value: boolean) => {
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
      saveWorkflowConfig(config);
      onSave?.(config);
      setHasChanges(false);
      toast.success("Workflow-Einstellungen gespeichert", {
        description: "Der Genehmigungsprozess wurde aktualisiert.",
      });
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCHF = (amount: number) => {
    return amount.toLocaleString("de-CH", { minimumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Genehmigungsworkflow
        </h2>
        <p className="text-sm text-muted-foreground">
          Mehrstufiger Freigabeprozess für Spesenabrechnungen
        </p>
      </div>

      <Separator />

      {/* Enable/Disable Workflow */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="font-medium">Mehrstufige Genehmigung aktivieren</p>
            <p className="text-sm text-muted-foreground">
              Spesen durchlaufen die definierten Freigabestufen
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => {
              setConfig(prev => ({ ...prev, enabled: checked }));
              setHasChanges(true);
            }}
          />
        </CardContent>
      </Card>

      {config.enabled && (
        <>
          {/* Approval Stages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Genehmigungsstufen</CardTitle>
              <CardDescription>
                Definieren Sie die Freigabestufen basierend auf Betragschwellenwerten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Visual workflow representation */}
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 overflow-x-auto">
                <Badge variant="outline" className="whitespace-nowrap">Einreichung</Badge>
                {config.stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Badge 
                      className="whitespace-nowrap"
                      variant={index === 0 ? "default" : "secondary"}
                    >
                      {stage.name}
                      {stage.threshold > 0 && (
                        <span className="ml-1 text-xs opacity-75">
                          (&gt; CHF {formatCHF(stage.threshold)})
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
                        <Label>Schwellenwert (CHF)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="100"
                          value={stage.threshold}
                          onChange={(e) => updateStage(index, "threshold", parseFloat(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          {index === 0 ? "Immer erforderlich" : "Nur bei Betrag darüber"}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Timeout (Tage)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={stage.timeoutDays}
                          onChange={(e) => updateStage(index, "timeoutDays", parseInt(e.target.value) || 3)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Eskalation nach {stage.timeoutDays} Tagen
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={stage.autoApprove}
                          onCheckedChange={(checked) => updateStage(index, "autoApprove", checked)}
                          disabled={index === 0}
                        />
                        <Label className="text-xs">Auto-Freigabe unter Schwelle</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeStage(index)}
                        disabled={config.stages.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                    <span>Bei Einreichung</span>
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
                <Label>Erinnerungs-Intervall</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max="14"
                    value={config.notifications.reminderDays}
                    onChange={(e) => updateNotification("reminderDays", parseInt(e.target.value) || 2)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    Tage nach Einreichung wird eine Erinnerung gesendet
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>E-Mail-Empfänger</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.notifications.emailRecipients.submitter}
                      onCheckedChange={(checked) => updateEmailRecipient("submitter", checked)}
                    />
                    <span className="text-sm">Einreichende Person</span>
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
                      checked={config.notifications.emailRecipients.hr}
                      onCheckedChange={(checked) => updateEmailRecipient("hr", checked)}
                    />
                    <span className="text-sm">HR / Personalabteilung</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.notifications.emailRecipients.finance}
                      onCheckedChange={(checked) => updateEmailRecipient("finance", checked)}
                    />
                    <span className="text-sm">Buchhaltung</span>
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
