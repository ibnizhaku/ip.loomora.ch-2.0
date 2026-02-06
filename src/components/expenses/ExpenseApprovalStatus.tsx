import { CheckCircle, Circle, Clock, XCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { loadWorkflowConfig, getRequiredStages, ApprovalStage } from "@/components/settings/ExpenseWorkflowSettings";

export interface ApprovalProgress {
  stageId: string;
  stageName: string;
  status: "pending" | "approved" | "rejected" | "skipped";
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

interface ExpenseApprovalStatusProps {
  amount: number;
  currentStageIndex: number;
  approvalHistory: ApprovalProgress[];
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
  compact?: boolean;
}

const formatCHF = (amount: number) => {
  return amount.toLocaleString("de-CH", { minimumFractionDigits: 2 });
};

export default function ExpenseApprovalStatus({
  amount,
  currentStageIndex,
  approvalHistory,
  status,
  compact = false,
}: ExpenseApprovalStatusProps) {
  const config = loadWorkflowConfig();
  
  if (!config.enabled) {
    return null;
  }

  const requiredStages = getRequiredStages(amount, config);
  
  if (requiredStages.length === 0) {
    return null;
  }

  const getStageStatus = (stage: ApprovalStage, index: number): "completed" | "current" | "pending" | "skipped" | "rejected" => {
    const historyEntry = approvalHistory.find(h => h.stageId === stage.id);
    
    if (status === "rejected") {
      if (historyEntry?.status === "rejected") return "rejected";
      if (index <= currentStageIndex) return "completed";
      return "pending";
    }
    
    if (status === "approved" || status === "paid") {
      return "completed";
    }
    
    if (historyEntry?.status === "skipped") return "skipped";
    if (historyEntry?.status === "approved") return "completed";
    if (index === currentStageIndex) return "current";
    if (index < currentStageIndex) return "completed";
    return "pending";
  };

  const getStatusIcon = (stageStatus: string) => {
    switch (stageStatus) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "current":
        return <Clock className="h-4 w-4 text-warning animate-pulse" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "skipped":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (compact) {
    const completedCount = requiredStages.filter((stage, i) => 
      getStageStatus(stage, i) === "completed"
    ).length;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 cursor-help">
              <CheckCircle className="h-3 w-3" />
              {completedCount}/{requiredStages.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium mb-2">Genehmigungsfortschritt</p>
            <div className="space-y-1">
              {requiredStages.map((stage, index) => {
                const stageStatus = getStageStatus(stage, index);
                return (
                  <div key={stage.id} className="flex items-center gap-2 text-xs">
                    {getStatusIcon(stageStatus)}
                    <span className={cn(
                      stageStatus === "completed" && "text-success",
                      stageStatus === "current" && "text-warning font-medium",
                      stageStatus === "rejected" && "text-destructive",
                      stageStatus === "skipped" && "text-muted-foreground line-through"
                    )}>
                      {stage.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>Genehmigungsworkflow</span>
        <Badge variant="outline" className="text-xs">
          {requiredStages.length} Stufen für CHF {formatCHF(amount)}
        </Badge>
      </div>
      
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {requiredStages.map((stage, index) => {
          const stageStatus = getStageStatus(stage, index);
          const historyEntry = approvalHistory.find(h => h.stageId === stage.id);
          
          return (
            <div key={stage.id} className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                      stageStatus === "completed" && "bg-success/10 border-success/30",
                      stageStatus === "current" && "bg-warning/10 border-warning/30 ring-2 ring-warning/20",
                      stageStatus === "rejected" && "bg-destructive/10 border-destructive/30",
                      stageStatus === "skipped" && "bg-muted border-muted-foreground/20",
                      stageStatus === "pending" && "bg-muted/50 border-border"
                    )}>
                      {getStatusIcon(stageStatus)}
                      <span className={cn(
                        "text-sm",
                        stageStatus === "current" && "font-medium",
                        stageStatus === "skipped" && "line-through text-muted-foreground"
                      )}>
                        {stage.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      <p className="font-medium">{stage.name}</p>
                      {stage.threshold > 0 && (
                        <p className="text-muted-foreground">
                          Erforderlich ab CHF {formatCHF(stage.threshold)}
                        </p>
                      )}
                      {historyEntry?.approvedBy && (
                        <p className="text-success">
                          Genehmigt von {historyEntry.approvedBy}
                          {historyEntry.approvedAt && ` am ${historyEntry.approvedAt}`}
                        </p>
                      )}
                      {historyEntry?.rejectedReason && (
                        <p className="text-destructive">
                          Grund: {historyEntry.rejectedReason}
                        </p>
                      )}
                      {stageStatus === "current" && (
                        <p className="text-warning">Wartet auf Freigabe</p>
                      )}
                      {stageStatus === "skipped" && (
                        <p className="text-muted-foreground">
                          Übersprungen (Auto-Freigabe unter Schwelle)
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {index < requiredStages.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
