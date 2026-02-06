import { useState, useEffect } from "react";
import { Save, Info, RotateCcw, Receipt, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const STORAGE_KEY = "loomora_expense_rules";

// GAV Metallbau Schweiz 2024 - Spesenregelungen
export const DEFAULT_EXPENSE_RULES = {
  // Kilometerpauschale
  mileage: {
    rate: 0.70,
    unit: "CHF/km",
    description: "Kilometerentschädigung Privatfahrzeug",
    gavReference: "GAV Metallbau Art. 23",
  },
  // Verpflegung
  meals: {
    breakfast: 15.00,
    lunch: 32.00,
    dinner: 32.00,
    fullDay: 79.00,
    halfDay: 40.00,
    description: "Verpflegungspauschalen bei Auswärtsarbeit",
    gavReference: "GAV Metallbau Art. 24",
  },
  // Übernachtung
  accommodation: {
    maxPerNight: 150.00,
    requiresReceipt: true,
    description: "Übernachtung mit Beleg",
    gavReference: "GAV Metallbau Art. 25",
  },
  // Werkzeugentschädigung
  toolAllowance: {
    monthlyRate: 50.00,
    description: "Monatliche Werkzeugentschädigung",
    gavReference: "GAV Metallbau Art. 26",
  },
  // Validation settings
  validation: {
    warnOnExceed: true,
    blockOnExceed: false,
    tolerancePercent: 10, // Allow 10% over limit before warning
  },
};

export type ExpenseRules = typeof DEFAULT_EXPENSE_RULES;

// Helper to load rules from localStorage
export const loadExpenseRules = (): ExpenseRules => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading expense rules:", error);
  }
  return DEFAULT_EXPENSE_RULES;
};

// Helper to save rules to localStorage
const saveExpenseRules = (rules: ExpenseRules): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch (error) {
    console.error("Error saving expense rules:", error);
  }
};

// Validation helper - check if an expense item exceeds limits
export interface ExpenseValidationResult {
  isValid: boolean;
  isWarning: boolean;
  message?: string;
  limit?: number;
  actual?: number;
  exceedPercent?: number;
}

export const validateExpenseItem = (
  category: 'mileage' | 'meals' | 'accommodation' | 'other',
  amount: number,
  details?: { kilometers?: number; mealType?: 'breakfast' | 'lunch' | 'dinner' | 'fullDay' | 'halfDay'; nights?: number },
  rules: ExpenseRules = loadExpenseRules()
): ExpenseValidationResult => {
  const tolerance = rules.validation.tolerancePercent / 100;

  switch (category) {
    case 'mileage':
      if (details?.kilometers) {
        const maxAmount = details.kilometers * rules.mileage.rate;
        const maxWithTolerance = maxAmount * (1 + tolerance);
        if (amount > maxWithTolerance) {
          return {
            isValid: !rules.validation.blockOnExceed,
            isWarning: true,
            message: `Kilometerentschädigung über GAV-Limite (CHF ${rules.mileage.rate}/km)`,
            limit: maxAmount,
            actual: amount,
            exceedPercent: ((amount - maxAmount) / maxAmount) * 100,
          };
        }
      }
      break;

    case 'meals':
      if (details?.mealType) {
        const limit = rules.meals[details.mealType];
        const limitWithTolerance = limit * (1 + tolerance);
        if (amount > limitWithTolerance) {
          return {
            isValid: !rules.validation.blockOnExceed,
            isWarning: true,
            message: `Verpflegung über GAV-Pauschale (max. CHF ${limit.toFixed(2)})`,
            limit,
            actual: amount,
            exceedPercent: ((amount - limit) / limit) * 100,
          };
        }
      }
      break;

    case 'accommodation':
      if (details?.nights) {
        const maxAmount = details.nights * rules.accommodation.maxPerNight;
        const maxWithTolerance = maxAmount * (1 + tolerance);
        if (amount > maxWithTolerance) {
          return {
            isValid: !rules.validation.blockOnExceed,
            isWarning: true,
            message: `Übernachtung über GAV-Limite (max. CHF ${rules.accommodation.maxPerNight}/Nacht)`,
            limit: maxAmount,
            actual: amount,
            exceedPercent: ((amount - maxAmount) / maxAmount) * 100,
          };
        }
      }
      break;
  }

  return { isValid: true, isWarning: false };
};

// Check entire expense report for GAV compliance
export const validateExpenseReport = (
  items: Array<{
    category: 'transport' | 'accommodation' | 'meals' | 'other';
    amount: number;
    kilometers?: number;
    nights?: number;
  }>,
  rules: ExpenseRules = loadExpenseRules()
): { isCompliant: boolean; warnings: ExpenseValidationResult[]; totalExcess: number } => {
  const warnings: ExpenseValidationResult[] = [];
  let totalExcess = 0;

  items.forEach(item => {
    let result: ExpenseValidationResult;
    
    if (item.category === 'transport' && item.kilometers) {
      result = validateExpenseItem('mileage', item.amount, { kilometers: item.kilometers }, rules);
    } else if (item.category === 'accommodation' && item.nights) {
      result = validateExpenseItem('accommodation', item.amount, { nights: item.nights }, rules);
    } else if (item.category === 'meals') {
      // Assume full day for simplicity - in real app would track meal type
      result = validateExpenseItem('meals', item.amount, { mealType: 'fullDay' }, rules);
    } else {
      result = { isValid: true, isWarning: false };
    }

    if (result.isWarning) {
      warnings.push(result);
      if (result.limit && result.actual) {
        totalExcess += result.actual - result.limit;
      }
    }
  });

  return {
    isCompliant: warnings.length === 0,
    warnings,
    totalExcess,
  };
};

interface ExpenseRulesSettingsProps {
  onSave?: (rules: ExpenseRules) => void;
}

export default function ExpenseRulesSettings({ onSave }: ExpenseRulesSettingsProps) {
  const [rules, setRules] = useState<ExpenseRules>(DEFAULT_EXPENSE_RULES);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved rules on mount
  useEffect(() => {
    const savedRules = loadExpenseRules();
    setRules(savedRules);
  }, []);

  const updateMileage = (field: keyof typeof rules.mileage, value: number | string) => {
    setRules(prev => ({
      ...prev,
      mileage: { ...prev.mileage, [field]: value }
    }));
    setHasChanges(true);
  };

  const updateMeals = (field: keyof typeof rules.meals, value: number | string) => {
    setRules(prev => ({
      ...prev,
      meals: { ...prev.meals, [field]: value }
    }));
    setHasChanges(true);
  };

  const updateAccommodation = (field: keyof typeof rules.accommodation, value: number | boolean | string) => {
    setRules(prev => ({
      ...prev,
      accommodation: { ...prev.accommodation, [field]: value }
    }));
    setHasChanges(true);
  };

  const updateToolAllowance = (field: keyof typeof rules.toolAllowance, value: number | string) => {
    setRules(prev => ({
      ...prev,
      toolAllowance: { ...prev.toolAllowance, [field]: value }
    }));
    setHasChanges(true);
  };

  const updateValidation = (field: keyof typeof rules.validation, value: boolean | number) => {
    setRules(prev => ({
      ...prev,
      validation: { ...prev.validation, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveExpenseRules(rules);
      onSave?.(rules);
      setHasChanges(false);
      toast.success("Spesenregelungen gespeichert", {
        description: "Die neuen Limiten werden bei der Prüfung angewendet."
      });
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setRules(DEFAULT_EXPENSE_RULES);
    setHasChanges(true);
    toast.info("GAV Metallbau 2024 Standardsätze wiederhergestellt");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Spesenregelungen
        </h2>
        <p className="text-sm text-muted-foreground">
          Firmenweite Spesenansätze basierend auf GAV Metallbau Schweiz
        </p>
      </div>

      <Separator />

      {/* Info Banner */}
      <Card className="bg-info/5 border-info/20">
        <CardContent className="flex items-start gap-3 pt-4">
          <Info className="h-5 w-5 text-info mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-info">GAV Metallbau Schweiz 2024</p>
            <p className="text-muted-foreground mt-1">
              Die Spesenansätze entsprechen den Vorgaben des Gesamtarbeitsvertrags für das Schweizerische Metallbaugewerbe.
              Bei Überschreitungen werden Warnungen angezeigt und optional die Einreichung blockiert.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Kilometerpauschale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kilometerpauschale</CardTitle>
          <CardDescription>{rules.mileage.gavReference}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mileageRate">Ansatz pro Kilometer (CHF)</Label>
              <Input
                id="mileageRate"
                type="number"
                step="0.01"
                min="0"
                value={rules.mileage.rate}
                onChange={(e) => updateMileage('rate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-end">
              <p className="text-sm text-muted-foreground pb-2">
                {rules.mileage.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verpflegungspauschalen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verpflegungspauschalen</CardTitle>
          <CardDescription>{rules.meals.gavReference}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="breakfast">Frühstück (CHF)</Label>
              <Input
                id="breakfast"
                type="number"
                step="0.50"
                min="0"
                value={rules.meals.breakfast}
                onChange={(e) => updateMeals('breakfast', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lunch">Mittagessen (CHF)</Label>
              <Input
                id="lunch"
                type="number"
                step="0.50"
                min="0"
                value={rules.meals.lunch}
                onChange={(e) => updateMeals('lunch', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dinner">Abendessen (CHF)</Label>
              <Input
                id="dinner"
                type="number"
                step="0.50"
                min="0"
                value={rules.meals.dinner}
                onChange={(e) => updateMeals('dinner', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullDay">Ganztag (CHF)</Label>
              <Input
                id="fullDay"
                type="number"
                step="0.50"
                min="0"
                value={rules.meals.fullDay}
                onChange={(e) => updateMeals('fullDay', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="halfDay">Halbtag (CHF)</Label>
              <Input
                id="halfDay"
                type="number"
                step="0.50"
                min="0"
                value={rules.meals.halfDay}
                onChange={(e) => updateMeals('halfDay', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Übernachtung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Übernachtung</CardTitle>
          <CardDescription>{rules.accommodation.gavReference}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxPerNight">Maximalbetrag pro Nacht (CHF)</Label>
              <Input
                id="maxPerNight"
                type="number"
                step="5"
                min="0"
                value={rules.accommodation.maxPerNight}
                onChange={(e) => updateAccommodation('maxPerNight', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <Switch
                id="requiresReceipt"
                checked={rules.accommodation.requiresReceipt}
                onCheckedChange={(checked) => updateAccommodation('requiresReceipt', checked)}
              />
              <Label htmlFor="requiresReceipt">Beleg erforderlich</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Werkzeugentschädigung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Werkzeugentschädigung</CardTitle>
          <CardDescription>{rules.toolAllowance.gavReference}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="toolMonthly">Monatlicher Ansatz (CHF)</Label>
              <Input
                id="toolMonthly"
                type="number"
                step="5"
                min="0"
                value={rules.toolAllowance.monthlyRate}
                onChange={(e) => updateToolAllowance('monthlyRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validierungseinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Validierung & Warnungen
          </CardTitle>
          <CardDescription>
            Wie soll das System bei Überschreitungen reagieren?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="font-medium">Warnungen anzeigen</p>
              <p className="text-sm text-muted-foreground">
                Bei Überschreitung der GAV-Limiten eine Warnung anzeigen
              </p>
            </div>
            <Switch
              checked={rules.validation.warnOnExceed}
              onCheckedChange={(checked) => updateValidation('warnOnExceed', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="font-medium">Einreichung blockieren</p>
              <p className="text-sm text-muted-foreground">
                Spesenabrechnungen mit Überschreitungen können nicht eingereicht werden
              </p>
            </div>
            <Switch
              checked={rules.validation.blockOnExceed}
              onCheckedChange={(checked) => updateValidation('blockOnExceed', checked)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tolerance">Toleranzgrenze (%)</Label>
            <Input
              id="tolerance"
              type="number"
              min="0"
              max="50"
              value={rules.validation.tolerancePercent}
              onChange={(e) => updateValidation('tolerancePercent', parseInt(e.target.value) || 0)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Kleine Überschreitungen innerhalb dieser Toleranz lösen keine Warnungen aus
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          GAV 2024 Standard
        </Button>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-warning">
              Ungespeicherte Änderungen
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Speichern..." : "Einstellungen speichern"}
          </Button>
        </div>
      </div>
    </div>
  );
}
