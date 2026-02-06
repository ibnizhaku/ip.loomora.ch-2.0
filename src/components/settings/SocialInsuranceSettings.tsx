import { useState } from "react";
import { Save, Info, RotateCcw, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// Default Swiss social insurance rates for 2024
export const DEFAULT_SOCIAL_INSURANCE_RATES = {
  ahvIvEo: { employer: 5.3, employee: 5.3, basis: "Bruttolohn", description: "AHV/IV/EO" },
  alv: { employer: 1.1, employee: 1.1, basis: "bis CHF 148'200", description: "ALV" },
  alv2: { employer: 0.5, employee: 0.5, basis: "ab CHF 148'200", description: "ALV 2 (Solidaritätsbeitrag)" },
  bvg: { employer: 7.0, employee: 7.0, basis: "Koordinierter Lohn", description: "BVG (Pensionskasse)" },
  uvgBu: { employer: 0.67, employee: 0, basis: "Bruttolohn", description: "UVG (Berufsunfall)" },
  uvgNbu: { employer: 0, employee: 1.28, basis: "Bruttolohn", description: "UVG (Nichtberufsunfall)" },
  ktg: { employer: 0.5, employee: 0.5, basis: "Bruttolohn", description: "KTG (Krankentaggeld)" },
  fak: { employer: 1.2, employee: 0, basis: "Bruttolohn", description: "FAK (Familienausgleichskasse)" },
};

export type SocialInsuranceRates = typeof DEFAULT_SOCIAL_INSURANCE_RATES;

interface SocialInsuranceSettingsProps {
  initialRates?: SocialInsuranceRates;
  onSave?: (rates: SocialInsuranceRates) => void;
}

export default function SocialInsuranceSettings({ 
  initialRates = DEFAULT_SOCIAL_INSURANCE_RATES,
  onSave 
}: SocialInsuranceSettingsProps) {
  const [rates, setRates] = useState<SocialInsuranceRates>(initialRates);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateRate = (
    key: keyof SocialInsuranceRates, 
    field: 'employer' | 'employee' | 'basis', 
    value: string | number
  ) => {
    setRates(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        [field]: field === 'basis' ? value : parseFloat(value as string) || 0 
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      onSave?.(rates);
      setHasChanges(false);
      toast.success("Sozialversicherungssätze gespeichert", {
        description: "Die neuen Sätze werden für alle zukünftigen Berechnungen verwendet."
      });
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setRates(DEFAULT_SOCIAL_INSURANCE_RATES);
    setHasChanges(true);
    toast.info("Standardsätze 2024 wiederhergestellt");
  };

  const totalEmployer = Object.values(rates).reduce((sum, r) => sum + r.employer, 0);
  const totalEmployee = Object.values(rates).reduce((sum, r) => sum + r.employee, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Sozialversicherungen
        </h2>
        <p className="text-sm text-muted-foreground">
          Firmenweite Standardsätze für Schweizer Sozialversicherungen
        </p>
      </div>

      <Separator />

      {/* Info Banner */}
      <Card className="bg-info/5 border-info/20">
        <CardContent className="flex items-start gap-3 pt-4">
          <Info className="h-5 w-5 text-info mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-info">Schweizer Sozialversicherungen 2024</p>
            <p className="text-muted-foreground mt-1">
              Diese Sätze werden als Standard für alle neuen Arbeitsverträge verwendet. 
              Pro Mitarbeiter können individuelle Abweichungen (z.B. BVG-Stufe, UVG-Klasse) 
              direkt im Arbeitsvertrag definiert werden.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Beitragssätze</CardTitle>
          <CardDescription>
            Arbeitgeber- und Arbeitnehmeranteile in Prozent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Versicherung</TableHead>
                <TableHead className="w-[120px]">AG-Anteil %</TableHead>
                <TableHead className="w-[120px]">AN-Anteil %</TableHead>
                <TableHead>Bemessungsgrundlage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Object.keys(rates) as Array<keyof SocialInsuranceRates>).map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="font-medium text-left">
                          {rates[key].description}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">
                            {key === 'ahvIvEo' && "Alters- und Hinterlassenenversicherung, Invalidenversicherung, Erwerbsersatzordnung"}
                            {key === 'alv' && "Arbeitslosenversicherung bis zur Höchstgrenze"}
                            {key === 'alv2' && "Solidaritätsbeitrag für Löhne über der ALV-Grenze"}
                            {key === 'bvg' && "Berufliche Vorsorge (Pensionskasse) - Satz abhängig von Alter/Stufe"}
                            {key === 'uvgBu' && "Unfallversicherung für Berufsunfälle - vom Arbeitgeber getragen"}
                            {key === 'uvgNbu' && "Unfallversicherung für Nichtberufsunfälle - vom Arbeitnehmer getragen"}
                            {key === 'ktg' && "Krankentaggeldversicherung - freiwillig, empfohlen"}
                            {key === 'fak' && "Familienausgleichskasse - Finanzierung Kinderzulagen"}
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
                      value={rates[key].employer}
                      onChange={(e) => updateRate(key, 'employer', e.target.value)}
                      className="w-20 text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={rates[key].employee}
                      onChange={(e) => updateRate(key, 'employee', e.target.value)}
                      className="w-20 text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={rates[key].basis}
                      onChange={(e) => updateRate(key, 'basis', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Total Abzüge</TableCell>
                <TableCell className="text-right pr-6">{totalEmployer.toFixed(2)}%</TableCell>
                <TableCell className="text-right pr-6">{totalEmployee.toFixed(2)}%</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grenzwerte & Parameter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="alvMax">ALV-Höchstgrenze (CHF/Jahr)</Label>
              <Input id="alvMax" type="number" defaultValue="148200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bvgKoord">BVG-Koordinationsabzug (CHF)</Label>
              <Input id="bvgKoord" type="number" defaultValue="25725" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bvgMin">BVG-Eintrittsschwelle (CHF)</Label>
              <Input id="bvgMin" type="number" defaultValue="22050" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uvgMax">UVG-Höchstgrenze (CHF/Jahr)</Label>
              <Input id="uvgMax" type="number" defaultValue="148200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ktgWarte">KTG-Wartefrist (Tage)</Label>
              <Input id="ktgWarte" type="number" defaultValue="30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ktgDauer">KTG-Leistungsdauer (Tage)</Label>
              <Input id="ktgDauer" type="number" defaultValue="730" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BVG Age-based rates info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">BVG-Altersgutschriften (Referenz)</CardTitle>
          <CardDescription>
            Gesetzliche Mindestbeiträge nach Alter - effektiver Satz abhängig von Pensionskasse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground">25-34 Jahre</p>
              <p className="text-lg font-bold">7%</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground">35-44 Jahre</p>
              <p className="text-lg font-bold">10%</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground">45-54 Jahre</p>
              <p className="text-lg font-bold">15%</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground">55-65 Jahre</p>
              <p className="text-lg font-bold">18%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Standardsätze 2024
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
