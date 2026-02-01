import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function QualityCheckCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [productionOrder, setProductionOrder] = useState("");
  const [checkType, setCheckType] = useState("");
  const [inspector, setInspector] = useState("");
  const [plannedDate, setPlannedDate] = useState("");
  const [criteria, setCriteria] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!name || !productionOrder || !checkType) {
      toast.error("Bitte füllen Sie die Pflichtfelder aus");
      return;
    }
    toast.success("QS-Prüfung erstellt");
    navigate("/quality-control");
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
              <Label>Prüfungsname *</Label>
              <Input 
                placeholder="z.B. Endkontrolle Baugruppe A" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Produktionsauftrag *</Label>
              <Select value={productionOrder} onValueChange={setProductionOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Auftrag wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PA-2024-001">PA-2024-001 - Gehäuse Typ A</SelectItem>
                  <SelectItem value="PA-2024-002">PA-2024-002 - Motorblock V8</SelectItem>
                  <SelectItem value="PA-2024-003">PA-2024-003 - Steuereinheit</SelectItem>
                  <SelectItem value="PA-2024-004">PA-2024-004 - Antriebswelle</SelectItem>
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
                  <SelectItem value="incoming">Wareneingangsprüfung</SelectItem>
                  <SelectItem value="process">Fertigungsbegleitend</SelectItem>
                  <SelectItem value="final">Endkontrolle</SelectItem>
                  <SelectItem value="random">Stichprobe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Geplantes Datum</Label>
              <Input 
                type="date" 
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prüfer & Kriterien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Prüfer</Label>
              <Select value={inspector} onValueChange={setInspector}>
                <SelectTrigger>
                  <SelectValue placeholder="Prüfer wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mueller">Thomas Müller</SelectItem>
                  <SelectItem value="schmidt">Anna Schmidt</SelectItem>
                  <SelectItem value="weber">Michael Weber</SelectItem>
                  <SelectItem value="fischer">Lisa Fischer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prüfkriterien</Label>
              <Textarea 
                placeholder="z.B. Maßhaltigkeit, Oberflächenqualität, Funktionstest..."
                rows={4}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bemerkungen</Label>
              <Textarea 
                placeholder="Zusätzliche Hinweise zur Prüfung..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Prüfung anlegen
        </Button>
      </div>
    </div>
  );
}
