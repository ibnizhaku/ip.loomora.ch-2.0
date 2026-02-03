import { useState } from "react";
import { FileText, Clock, Wrench, Plus, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface ServiceReportDialogProps {
  ticketId: string;
  ticketTitle: string;
  customerName: string;
  technicianName: string;
}

export function ServiceReportDialog({ 
  ticketId, 
  ticketTitle, 
  customerName,
  technicianName 
}: ServiceReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [workDescription, setWorkDescription] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [materials, setMaterials] = useState<MaterialItem[]>([
    { id: "1", name: "Schweissdraht 1.2mm", quantity: 2, unit: "kg", price: 45.00 },
    { id: "2", name: "Schutzgas Argon", quantity: 1, unit: "Flasche", price: 85.00 },
  ]);
  const [newMaterial, setNewMaterial] = useState({ name: "", quantity: 1, unit: "Stk", price: 0 });
  const [customerSignature, setCustomerSignature] = useState("");

  const addMaterial = () => {
    if (!newMaterial.name || newMaterial.price <= 0) {
      toast.error("Bitte Material und Preis angeben");
      return;
    }
    setMaterials([...materials, { ...newMaterial, id: crypto.randomUUID() }]);
    setNewMaterial({ name: "", quantity: 1, unit: "Stk", price: 0 });
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const totalMaterial = materials.reduce((sum, m) => sum + (m.quantity * m.price), 0);
  const laborCost = (parseFloat(hoursWorked) || 0) * 95; // CHF 95/Std
  const travelCost = (parseFloat(travelTime) || 0) * 75; // CHF 75/Std
  const totalCost = totalMaterial + laborCost + travelCost;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const handleSave = () => {
    if (!workDescription) {
      toast.error("Bitte Arbeitsbeschreibung eingeben");
      return;
    }
    toast.success("Service-Rapport gespeichert");
    setOpen(false);
  };

  const handleExportPDF = () => {
    toast.success("PDF wird generiert...");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Rapport
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Service-Rapport - {ticketId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 text-sm">
            <div>
              <p className="text-muted-foreground">Kunde</p>
              <p className="font-medium">{customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Techniker</p>
              <p className="font-medium">{technicianName}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Auftrag</p>
              <p className="font-medium">{ticketTitle}</p>
            </div>
          </div>

          {/* Work Description */}
          <div className="space-y-2">
            <Label>Ausgeführte Arbeiten *</Label>
            <Textarea
              placeholder="Beschreiben Sie die durchgeführten Arbeiten..."
              rows={4}
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Arbeitszeit (Std.)
              </Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                placeholder="0.0"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">CHF 95.00/Std.</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Fahrzeit (Std.)
              </Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                placeholder="0.0"
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">CHF 75.00/Std.</p>
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Verwendetes Material
            </Label>
            
            {materials.length > 0 && (
              <div className="space-y-2">
                {materials.map((mat) => (
                  <div key={mat.id} className="flex items-center gap-2 p-2 rounded border bg-muted/30">
                    <span className="flex-1">{mat.name}</span>
                    <span className="text-sm text-muted-foreground">{mat.quantity} {mat.unit}</span>
                    <span className="font-medium w-24 text-right">{formatCurrency(mat.quantity * mat.price)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeMaterial(mat.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 p-2 rounded border border-dashed">
              <Input
                placeholder="Material..."
                className="flex-1"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
              />
              <Input
                type="number"
                className="w-20"
                min="1"
                value={newMaterial.quantity}
                onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseInt(e.target.value) || 1 })}
              />
              <Input
                placeholder="Einheit"
                className="w-20"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
              />
              <Input
                type="number"
                step="0.01"
                className="w-28"
                placeholder="CHF"
                value={newMaterial.price || ""}
                onChange={(e) => setNewMaterial({ ...newMaterial, price: parseFloat(e.target.value) || 0 })}
              />
              <Button variant="outline" onClick={addMaterial}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Arbeitszeit</span>
              <span>{formatCurrency(laborCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fahrzeit</span>
              <span>{formatCurrency(travelCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Material</span>
              <span>{formatCurrency(totalMaterial)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total (exkl. MwSt.)</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <Label>Kundenunterschrift (Name)</Label>
            <Input
              placeholder="Name des Kunden..."
              value={customerSignature}
              onChange={(e) => setCustomerSignature(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              PDF exportieren
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSave}>
                Rapport speichern
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
