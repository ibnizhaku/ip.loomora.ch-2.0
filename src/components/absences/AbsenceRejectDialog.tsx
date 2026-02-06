import { useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { loadAbsenceWorkflowConfig } from "@/components/settings/AbsenceWorkflowSettings";

interface AbsenceRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  absenceType: string;
  dateRange: string;
  onConfirm: (reason: string) => void;
}

export default function AbsenceRejectDialog({
  open,
  onOpenChange,
  employeeName,
  absenceType,
  dateRange,
  onConfirm,
}: AbsenceRejectDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  
  const config = loadAbsenceWorkflowConfig();
  const requireReason = config.requireRejectionReason;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError("Bitte geben Sie einen Ablehnungsgrund ein");
      return;
    }
    onConfirm(reason);
    setReason("");
    setError("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setReason("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Abwesenheit ablehnen
          </DialogTitle>
          <DialogDescription>
            Möchten Sie den Abwesenheitsantrag wirklich ablehnen?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
            <p><span className="font-medium">Mitarbeiter:</span> {employeeName}</p>
            <p><span className="font-medium">Art:</span> {absenceType}</p>
            <p><span className="font-medium">Zeitraum:</span> {dateRange}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">
              Ablehnungsgrund
              {requireReason && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id="reason"
              placeholder="Bitte geben Sie den Grund für die Ablehnung ein..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              className={error ? "border-destructive" : ""}
              rows={3}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {!requireReason && (
              <p className="text-xs text-muted-foreground">Optional</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Ablehnen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
