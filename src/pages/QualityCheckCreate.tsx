import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, ClipboardCheck, Plus, X, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useQualityChecklists, useCreateQualityCheck } from "@/hooks/use-quality-control";
import { useProductionOrders } from "@/hooks/use-production-orders";
import { useEmployees } from "@/hooks/use-employees";

const categoryColors: Record<string, string> = {
  "Schweissen": "bg-orange-500/10 text-orange-600",
  "Massgenauigkeit": "bg-blue-500/10 text-blue-600",
  "Oberfläche": "bg-green-500/10 text-green-600",
  "Verbindungen": "bg-purple-500/10 text-purple-600",
  "Wareneingang": "bg-amber-500/10 text-amber-600",
  "Eingang": "bg-amber-500/10 text-amber-600",
  "Masse": "bg-blue-500/10 text-blue-600",
};

export default function QualityCheckCreate() {
  const navigate = useNavigate();
  const [productionOrder, setProductionOrder] = useState("");
  const [checkType, setCheckType] = useState("");
  const [inspector, setInspector] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedChecklist, setSelectedChecklist] = useState("");

  const { data: checklistsData } = useQualityChecklists({ pageSize: 100 });
  const { data: productionOrdersData } = useProductionOrders({ pageSize: 100 });
  const { data: employeesData } = useEmployees({ pageSize: 100 });
  const createMutation = useCreateQualityCheck();

  const checklists = (checklistsData as any)?.data || [];
  const productionOrders = (productionOrdersData as any)?.data || [];
  const employees = (employeesData as any)?.data || [];

  const selectedChecklistData = checklists.find((c: any) => c.id === selectedChecklist);

  const handleSave = async () => {
    if (!selectedChecklist || !checkType) {
      toast.error("Bitte wählen Sie eine Checkliste und Prüfungsart");
      return;
    }
    try {
      await createMutation.mutateAsync({
        checklistId: selectedChecklist,
        type: checkType,
        productionOrderId: productionOrder || undefined,
        inspectorId: inspector || undefined,
        notes: notes || undefined,
      } as any);
      toast.success("QS-Prüfung erstellt");
      navigate("/quality");
    } catch {
      toast.error("Fehler beim Erstellen der Prüfung");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neue QS-Prüfung</h1>
          <p className="text-muted-foreground">Qualitätsprüfung anlegen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Prüfungsdaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Produktionsauftrag</Label>
              <Select value={productionOrder} onValueChange={setProductionOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Auftrag wählen (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {productionOrders.map((po: any) => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.number} - {po.name || po.description || ""}
                    </SelectItem>
                  ))}
                  {productionOrders.length === 0 && (
                    <SelectItem value="__none" disabled>Keine Aufträge vorhanden</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prüfungsart *</Label>
              <Select value={checkType} onValueChange={setCheckType}>
                <SelectTrigger>
                  <SelectValue placeholder="Art wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOMING">Wareneingangsprüfung</SelectItem>
                  <SelectItem value="IN_PROCESS">Fertigungsbegleitend</SelectItem>
                  <SelectItem value="FINAL">Endkontrolle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prüfer & Bemerkungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Prüfer</Label>
              <Select value={inspector} onValueChange={setInspector}>
                <SelectTrigger>
                  <SelectValue placeholder="Prüfer wählen" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                  {employees.length === 0 && (
                    <SelectItem value="__none" disabled>Keine Mitarbeiter vorhanden</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bemerkungen</Label>
              <Textarea 
                placeholder="Zusätzliche Hinweise zur Prüfung..."
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checklisten-Auswahl */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Checkliste auswählen *
            {selectedChecklistData && (
              <Badge variant="secondary" className="ml-2">
                {selectedChecklistData.items?.length || 0} Prüfpunkte
              </Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/quality/checklists">
              Vorlagen verwalten
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {checklists.map((checklist: any) => {
              const isSelected = selectedChecklist === checklist.id;
              return (
                <div
                  key={checklist.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedChecklist(isSelected ? "" : checklist.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => setSelectedChecklist(isSelected ? "" : checklist.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{checklist.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {checklist.category && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${categoryColors[checklist.category] || ""}`}
                        >
                          {checklist.category}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {checklist.items?.length || 0} Punkte
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {checklists.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>Keine Checklisten-Vorlagen vorhanden</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/quality/checklists/new">Erste Vorlage erstellen</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSave} disabled={createMutation.isPending}>
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Prüfung anlegen
        </Button>
      </div>
    </div>
  );
}
