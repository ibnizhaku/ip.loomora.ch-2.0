import { useState } from "react";
import { Info, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_SOCIAL_INSURANCE_RATES, SocialInsuranceRates } from "@/components/settings/SocialInsuranceSettings";

export interface EmployeeSocialInsurance {
  rates: SocialInsuranceRates;
  overrides: Partial<Record<keyof SocialInsuranceRates, boolean>>;
}

interface SocialInsuranceEditorProps {
  value: EmployeeSocialInsurance;
  onChange: (value: EmployeeSocialInsurance) => void;
  companyRates?: SocialInsuranceRates;
  isEditMode: boolean;
}

export default function SocialInsuranceEditor({
  value,
  onChange,
  companyRates = DEFAULT_SOCIAL_INSURANCE_RATES,
  isEditMode
}: SocialInsuranceEditorProps) {
  const [showOverrideInfo, setShowOverrideInfo] = useState(false);

  const toggleOverride = (key: keyof SocialInsuranceRates) => {
    const newOverrides = { ...value.overrides };
    const newRates = { ...value.rates };
    
    if (newOverrides[key]) {
      // Reset to company default
      newRates[key] = { ...companyRates[key] };
      delete newOverrides[key];
    } else {
      // Enable override
      newOverrides[key] = true;
    }
    
    onChange({ rates: newRates, overrides: newOverrides });
  };

  const updateRate = (
    key: keyof SocialInsuranceRates,
    field: 'employer' | 'employee',
    inputValue: string
  ) => {
    const numValue = parseFloat(inputValue) || 0;
    const newRates = {
      ...value.rates,
      [key]: {
        ...value.rates[key],
        [field]: numValue
      }
    };
    onChange({ ...value, rates: newRates });
  };

  const resetToCompanyDefaults = () => {
    onChange({
      rates: { ...companyRates },
      overrides: {}
    });
  };

  const hasOverrides = Object.keys(value.overrides).length > 0;
  const totalEmployer = Object.values(value.rates).reduce((sum, r) => sum + r.employer, 0);
  const totalEmployee = Object.values(value.rates).reduce((sum, r) => sum + r.employee, 0);

  // Read-only view
  if (!isEditMode) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Versicherung</TableHead>
            <TableHead className="text-right">AG-Anteil %</TableHead>
            <TableHead className="text-right">AN-Anteil %</TableHead>
            <TableHead>Bemessungsgrundlage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(Object.keys(value.rates) as Array<keyof SocialInsuranceRates>).map((key) => (
            <TableRow key={key}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {value.rates[key].description}
                  {value.overrides[key] && (
                    <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                      Individuell
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {value.rates[key].employer > 0 ? `${value.rates[key].employer}%` : "-"}
              </TableCell>
              <TableCell className="text-right">
                {value.rates[key].employee > 0 ? `${value.rates[key].employee}%` : "-"}
              </TableCell>
              <TableCell className="text-muted-foreground">{value.rates[key].basis}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/50">
            <TableCell className="font-bold">Total Abzüge</TableCell>
            <TableCell className="text-right font-bold">{totalEmployer.toFixed(2)}%</TableCell>
            <TableCell className="text-right font-bold">{totalEmployee.toFixed(2)}%</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  // Edit mode view
  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <Card className="bg-info/5 border-info/20">
        <CardContent className="flex items-start gap-3 pt-4">
          <Info className="h-5 w-5 text-info mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-info">Individuelle Sozialversicherungssätze</p>
            <p className="text-muted-foreground mt-1">
              Aktivieren Sie den Schalter bei einer Versicherung, um vom Firmenstandard abzuweichen.
              Dies ist nützlich für unterschiedliche BVG-Stufen, UVG-Risikoklassen oder spezielle Vereinbarungen.
            </p>
          </div>
        </CardContent>
      </Card>

      {hasOverrides && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/30">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="font-medium">
              {Object.keys(value.overrides).length} individuelle Abweichung(en) aktiv
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={resetToCompanyDefaults} className="gap-2">
            <RotateCcw className="h-3 w-3" />
            Alle zurücksetzen
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Individuell</TableHead>
            <TableHead>Versicherung</TableHead>
            <TableHead className="w-[100px]">AG %</TableHead>
            <TableHead className="w-[100px]">AN %</TableHead>
            <TableHead>Basis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(Object.keys(value.rates) as Array<keyof SocialInsuranceRates>).map((key) => {
            const isOverridden = value.overrides[key];
            const companyRate = companyRates[key];
            const currentRate = value.rates[key];
            
            return (
              <TableRow key={key} className={isOverridden ? "bg-warning/5" : ""}>
                <TableCell>
                  <Switch
                    checked={isOverridden}
                    onCheckedChange={() => toggleOverride(key)}
                  />
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">
                        <span className={isOverridden ? "font-medium" : ""}>
                          {currentRate.description}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Firmenstandard: AG {companyRate.employer}% / AN {companyRate.employee}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={currentRate.employer}
                    onChange={(e) => updateRate(key, 'employer', e.target.value)}
                    disabled={!isOverridden}
                    className={`w-20 text-right ${!isOverridden ? 'opacity-50' : ''}`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={currentRate.employee}
                    onChange={(e) => updateRate(key, 'employee', e.target.value)}
                    disabled={!isOverridden}
                    className={`w-20 text-right ${!isOverridden ? 'opacity-50' : ''}`}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {currentRate.basis}
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow className="bg-muted/50 font-bold">
            <TableCell></TableCell>
            <TableCell>Total Abzüge</TableCell>
            <TableCell className="text-right pr-4">{totalEmployer.toFixed(2)}%</TableCell>
            <TableCell className="text-right pr-4">{totalEmployee.toFixed(2)}%</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
