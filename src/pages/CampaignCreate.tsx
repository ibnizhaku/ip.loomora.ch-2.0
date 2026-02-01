import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Megaphone, Calendar, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const campaignTypes = [
  { value: "email", label: "E-Mail Kampagne" },
  { value: "social", label: "Social Media" },
  { value: "ppc", label: "PPC / Google Ads" },
  { value: "influencer", label: "Influencer Marketing" },
  { value: "content", label: "Content Marketing" },
  { value: "event", label: "Event Marketing" },
];

const targetAudiences = [
  { value: "all", label: "Alle Kunden" },
  { value: "new", label: "Neukunden" },
  { value: "existing", label: "Bestandskunden" },
  { value: "premium", label: "Premium-Kunden" },
  { value: "inactive", label: "Inaktive Kunden" },
];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    targetAudience: "",
    budget: "",
    startDate: "",
    endDate: "",
    goal: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.budget) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    toast.success("Kampagne erfolgreich erstellt");
    navigate("/campaigns");
  };

  const budget = parseFloat(formData.budget) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/campaigns")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Neue Kampagne
          </h1>
          <p className="text-muted-foreground">
            Marketing-Kampagne erstellen und konfigurieren
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Kampagnen-Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Kampagnenname *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Herbst-Sale 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Kampagnentyp *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Typ wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetAudience">Zielgruppe</Label>
                  <Select
                    value={formData.targetAudience}
                    onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Zielgruppe wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudiences.map((audience) => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Kampagnenziel und -beschreibung"
                    rows={3}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="goal">Kampagnenziel</Label>
                  <Input
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    placeholder="z.B. 500 Conversions, 10'000 Impressions"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Zeitraum & Budget
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="startDate">Startdatum *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Enddatum *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="budget">Budget (CHF) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Kampagnenübersicht</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-2xl font-bold text-primary">
                    CHF {budget.toLocaleString("de-CH")}
                  </p>
                </div>
                {formData.type && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Kampagnentyp</p>
                    <p className="font-medium">
                      {campaignTypes.find(t => t.value === formData.type)?.label}
                    </p>
                  </div>
                )}
                {formData.startDate && formData.endDate && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Laufzeit</p>
                    <p className="font-medium">
                      {new Date(formData.startDate).toLocaleDateString("de-CH")} - {new Date(formData.endDate).toLocaleDateString("de-CH")}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-2">
                <Button type="submit" className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Erstellen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/campaigns")}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
