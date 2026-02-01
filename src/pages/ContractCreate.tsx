import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function ContractCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [customer, setCustomer] = useState("");
  const [contractType, setContractType] = useState("");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [noticePeriod, setNoticePeriod] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!title || !customer || !contractType || !startDate || !endDate) {
      toast.error("Bitte füllen Sie die Pflichtfelder aus");
      return;
    }
    toast.success("Vertrag erstellt");
    navigate("/contracts");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neuer Vertrag</h1>
          <p className="text-muted-foreground">Kundenvertrag anlegen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Vertragsdaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Vertragsbezeichnung *</Label>
              <Input 
                placeholder="z.B. Support & Wartung 2024" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kunde *</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Kunde wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fashion-store">Fashion Store GmbH</SelectItem>
                  <SelectItem value="fintech">FinTech Solutions</SelectItem>
                  <SelectItem value="sales-pro">Sales Pro AG</SelectItem>
                  <SelectItem value="tech-innovations">Tech Innovations</SelectItem>
                  <SelectItem value="logistics-plus">Logistics Plus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vertragsart *</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger>
                  <SelectValue placeholder="Art wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Dienstleistung</SelectItem>
                  <SelectItem value="project">Projekt</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="license">Lizenz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vertragswert (CHF)</Label>
              <Input 
                type="number"
                placeholder="0.00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Laufzeit & Konditionen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Startdatum *</Label>
                <Input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Enddatum *</Label>
                <Input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kündigungsfrist</Label>
              <Select value={noticePeriod} onValueChange={setNoticePeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Frist wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-month">1 Monat</SelectItem>
                  <SelectItem value="3-months">3 Monate</SelectItem>
                  <SelectItem value="6-months">6 Monate</SelectItem>
                  <SelectItem value="end-of-year">Zum Jahresende</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Automatische Verlängerung</Label>
                <p className="text-sm text-muted-foreground">Vertrag verlängert sich automatisch</p>
              </div>
              <Switch checked={autoRenewal} onCheckedChange={setAutoRenewal} />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea 
                placeholder="Vertragsbeschreibung und Leistungsumfang..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Vertrag anlegen
        </Button>
      </div>
    </div>
  );
}
