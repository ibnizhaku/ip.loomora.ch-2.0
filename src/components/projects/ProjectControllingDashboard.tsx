import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Wrench, 
  Package, 
  Users,
  Building2,
  Target,
  Wallet,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { useProjectControlling, CostType, ProjectPhaseType } from "@/hooks/use-metallbau";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectControllingDashboardProps {
  projectId: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(amount);
};

// Metallbau-spezifische Phasen-Labels
const PHASE_TYPE_LABELS: Record<ProjectPhaseType, string> = {
  [ProjectPhaseType.PLANUNG]: 'Planung & Konstruktion',
  [ProjectPhaseType.FERTIGUNG]: 'Werkstattfertigung',
  [ProjectPhaseType.MONTAGE]: 'Baustellenmontage',
  [ProjectPhaseType.ABSCHLUSS]: 'Abnahme & Abschluss',
};

// Metallbau-spezifische Kostenart-Labels
const COST_TYPE_CONFIG: Record<CostType, { label: string; icon: React.ElementType; color: string; hint: string }> = {
  [CostType.LABOR]: { 
    label: 'Lohnkosten', 
    icon: Users, 
    color: 'text-blue-500',
    hint: 'Erfasste Betriebszeit × Stundensatz + Zuschläge'
  },
  [CostType.MACHINE]: { 
    label: 'Maschinenkosten', 
    icon: Wrench, 
    color: 'text-orange-500',
    hint: 'Maschinenstunden × Maschinensatz'
  },
  [CostType.MATERIAL]: { 
    label: 'Materialkosten', 
    icon: Package, 
    color: 'text-green-500',
    hint: 'Materialentnahmen aus Lager'
  },
  [CostType.EXTERNAL]: { 
    label: 'Fremdleistungen', 
    icon: Building2, 
    color: 'text-purple-500',
    hint: 'Externe Dienstleister, Subunternehmer'
  },
  [CostType.OVERHEAD]: { 
    label: 'Gemeinkosten-Umlage', 
    icon: BarChart3, 
    color: 'text-gray-500',
    hint: 'Anteilige Werkstattzeit (GENERAL) nach Projektstunden'
  },
};

export function ProjectControllingDashboard({ projectId }: ProjectControllingDashboardProps) {
  const { data: controlling, isLoading, error } = useProjectControlling(projectId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !controlling) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Controlling-Daten konnten nicht geladen werden
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    projectName,
    projectNumber,
    projectType,
    status,
    budgetTotal,
    actualCostTotal,
    budgetRemaining,
    budgetUsedPercent,
    laborCosts,
    machineCosts,
    materialCosts,
    externalCosts,
    overheadCosts,
    revenueTotal,
    deckungsbeitrag,
    marginPercent,
    status_color,
    warnings,
    phases,
  } = controlling;

  const costBreakdown = [
    { type: CostType.LABOR, amount: laborCosts },
    { type: CostType.MACHINE, amount: machineCosts },
    { type: CostType.MATERIAL, amount: materialCosts },
    { type: CostType.EXTERNAL, amount: externalCosts },
    { type: CostType.OVERHEAD, amount: overheadCosts },
  ];

  return (
    <div className="space-y-6">
      {/* Header mit Status */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{projectName}</h2>
          <p className="text-muted-foreground">{projectNumber} • {projectType}</p>
        </div>
        <Badge 
          variant="outline"
          className={cn(
            "text-base px-3 py-1",
            status_color === 'green' && "border-green-500 text-green-700 bg-green-50",
            status_color === 'yellow' && "border-yellow-500 text-yellow-700 bg-yellow-50",
            status_color === 'red' && "border-red-500 text-red-700 bg-red-50",
          )}
        >
          {status_color === 'green' && <CheckCircle2 className="h-4 w-4 mr-1" />}
          {status_color === 'yellow' && <AlertCircle className="h-4 w-4 mr-1" />}
          {status_color === 'red' && <AlertTriangle className="h-4 w-4 mr-1" />}
          {status_color === 'green' ? 'Im Plan' : status_color === 'yellow' ? 'Warnung' : 'Kritisch'}
        </Badge>
      </div>

      {/* Warnungen */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Haupt-KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Budget */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Budget
            </CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(budgetTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={Math.min(budgetUsedPercent, 100)} 
              className={cn(
                "h-2",
                budgetUsedPercent > 100 && "[&>div]:bg-red-500"
              )}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {budgetUsedPercent.toFixed(1)}% verbraucht
            </p>
          </CardContent>
        </Card>

        {/* Ist-Kosten */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              Ist-Kosten
            </CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(actualCostTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-sm font-medium",
              budgetRemaining >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {budgetRemaining >= 0 ? 'Rest: ' : 'Über Budget: '}
              {formatCurrency(Math.abs(budgetRemaining))}
            </p>
          </CardContent>
        </Card>

        {/* Erlöse */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Erlöse
            </CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(revenueTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fakturiert
            </p>
          </CardContent>
        </Card>

        {/* Marge */}
        <Card className={cn(
          marginPercent < 5 && "border-red-200 bg-red-50",
          marginPercent >= 5 && marginPercent < 10 && "border-yellow-200 bg-yellow-50",
        )}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              {marginPercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              Deckungsbeitrag
            </CardDescription>
            <CardTitle className={cn(
              "text-2xl",
              marginPercent < 0 && "text-red-600"
            )}>
              {formatCurrency(deckungsbeitrag)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-sm font-medium",
              marginPercent < 5 ? "text-red-600" : 
              marginPercent < 10 ? "text-yellow-600" : "text-green-600"
            )}>
              {marginPercent.toFixed(1)}% Marge
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kostenaufschlüsselung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kostenaufschlüsselung</CardTitle>
          <CardDescription>
            Verteilung der Auftragskosten nach Kategorien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TooltipProvider>
              {costBreakdown.map(({ type, amount }) => {
                const config = COST_TYPE_CONFIG[type];
                const Icon = config.icon;
                const percent = actualCostTotal > 0 ? (amount / actualCostTotal) * 100 : 0;
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", config.color)} />
                        <span className="font-medium">{config.label}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{config.hint}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-right">
                        <span className="font-mono">{formatCurrency(amount)}</span>
                        <span className="text-muted-foreground ml-2 text-sm">
                          ({percent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                );
              })}
            </TooltipProvider>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Auftragskosten Total</span>
            <span className="font-mono">{formatCurrency(actualCostTotal)}</span>
          </div>
          
          {/* Info über Gemeinkosten-Umlage */}
          {overheadCosts > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Gemeinkosten-Umlage</p>
                  <p className="text-muted-foreground">
                    Die Werkstattzeit (Rüsten, Aufräumen, Instandhaltung) wird monatlich auf aktive Aufträge 
                    umgelegt – proportional zu den produktiven Stunden dieses Auftrags.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phasen-Übersicht */}
      {phases && phases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Projektphasen</CardTitle>
            <CardDescription>Status und Kosten pro Phase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phases.map((phase) => {
                const phasePercent = phase.budgetAmount > 0 
                  ? (phase.actualAmount / phase.budgetAmount) * 100 
                  : 0;
                
                return (
                  <div key={phase.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {phase.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{phase.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {PHASE_TYPE_LABELS[phase.phaseType]}
                        </Badge>
                      </div>
                      <div className="text-right text-sm">
                        <span className="font-mono">{formatCurrency(phase.actualAmount)}</span>
                        <span className="text-muted-foreground ml-1">
                          / {formatCurrency(phase.budgetAmount)}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(phasePercent, 100)} 
                      className={cn(
                        "h-2",
                        phasePercent > 100 && "[&>div]:bg-red-500",
                        phase.isCompleted && "[&>div]:bg-green-500"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
