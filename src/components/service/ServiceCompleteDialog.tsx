import { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ServiceCompleteDialogProps {
  ticketId: string;
  ticketTitle: string;
  onComplete?: () => void;
}

export function ServiceCompleteDialog({ 
  ticketId, 
  ticketTitle,
  onComplete 
}: ServiceCompleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState("behoben");
  const [summary, setSummary] = useState("");
  const [createInvoice, setCreateInvoice] = useState(true);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);

  const handleComplete = () => {
    if (!summary) {
      toast.error("Bitte geben Sie eine Zusammenfassung ein");
      return;
    }
    
    toast.success(`Ticket ${ticketId} abgeschlossen`);
    
    if (createInvoice) {
      toast.info("Rechnung wird erstellt...");
    }
    if (notifyCustomer) {
      toast.info("Kunde wird benachrichtigt...");
    }
    if (scheduleFollowUp) {
      toast.info("Nachfolgetermin wird geplant...");
    }
    
    setOpen(false);
    onComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Abschliessen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Ticket abschliessen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Ticket</p>
            <p className="font-medium">{ticketId} - {ticketTitle}</p>
          </div>

          {/* Resolution */}
          <div className="space-y-3">
            <Label>Ergebnis</Label>
            <RadioGroup value={resolution} onValueChange={setResolution}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-primary/30 cursor-pointer">
                <RadioGroupItem value="behoben" id="behoben" />
                <Label htmlFor="behoben" className="flex-1 cursor-pointer">
                  <span className="font-medium">Problem behoben</span>
                  <p className="text-sm text-muted-foreground">Das Ticket wurde erfolgreich abgeschlossen</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-primary/30 cursor-pointer">
                <RadioGroupItem value="teilweise" id="teilweise" />
                <Label htmlFor="teilweise" className="flex-1 cursor-pointer">
                  <span className="font-medium">Teilweise behoben</span>
                  <p className="text-sm text-muted-foreground">Weitere Arbeiten erforderlich</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-primary/30 cursor-pointer">
                <RadioGroupItem value="nicht-moeglich" id="nicht-moeglich" />
                <Label htmlFor="nicht-moeglich" className="flex-1 cursor-pointer">
                  <span className="font-medium">Nicht möglich</span>
                  <p className="text-sm text-muted-foreground">Problem konnte nicht gelöst werden</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label>Abschlussbericht *</Label>
            <Textarea
              placeholder="Beschreiben Sie kurz die durchgeführten Arbeiten und das Ergebnis..."
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Optionen</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="invoice" 
                  checked={createInvoice}
                  onCheckedChange={(checked) => setCreateInvoice(checked as boolean)}
                />
                <Label htmlFor="invoice" className="cursor-pointer">
                  Rechnung aus Rapport erstellen
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notify" 
                  checked={notifyCustomer}
                  onCheckedChange={(checked) => setNotifyCustomer(checked as boolean)}
                />
                <Label htmlFor="notify" className="cursor-pointer">
                  Kunde per E-Mail benachrichtigen
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="followup" 
                  checked={scheduleFollowUp}
                  onCheckedChange={(checked) => setScheduleFollowUp(checked as boolean)}
                />
                <Label htmlFor="followup" className="cursor-pointer">
                  Nachfolgetermin planen
                </Label>
              </div>
            </div>
          </div>

          {resolution === "nicht-moeglich" && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                Bitte dokumentieren Sie im Abschlussbericht, warum das Problem nicht gelöst werden konnte.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleComplete} className="bg-success hover:bg-success/90">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Ticket abschliessen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
