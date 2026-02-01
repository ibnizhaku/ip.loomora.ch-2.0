import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Target } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const categories = [
  { value: "production", label: "Produktion" },
  { value: "sales", label: "Vertrieb & Marketing" },
  { value: "admin", label: "Verwaltung" },
  { value: "it", label: "IT & Digitalisierung" },
  { value: "hr", label: "Personal & HR" },
];

const managers = [
  { value: "thomas-mueller", label: "Thomas Müller" },
  { value: "sarah-weber", label: "Sarah Weber" },
  { value: "michael-schmidt", label: "Michael Schmidt" },
  { value: "julia-hoffmann", label: "Julia Hoffmann" },
  { value: "andreas-klein", label: "Andreas Klein" },
];

export default function CostCenterCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    category: "",
    manager: "",
    budget: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.number || !formData.name || !formData.category) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    toast.success(`Kostenstelle ${formData.number} erfolgreich angelegt`);
    navigate("/cost-centers");
  };

  // Generate next available number based on category
  const suggestNumber = (category: string) => {
    const baseNumbers: Record<string, string> = {
      production: "1",
      sales: "2",
      admin: "3",
      it: "4",
      hr: "5",
    };
    const base = baseNumbers[category] || "9";
    return `${base}${String(Math.floor(Math.random() * 900) + 100)}`;
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value,
      number: formData.number || suggestNumber(value),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cost-centers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Neue Kostenstelle anlegen
          </h1>
          <p className="text-muted-foreground">
            Verantwortungsbereich für Kostenrechnung definieren
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Stammdaten */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Stammdaten</CardTitle>
              <CardDescription>Grundlegende Informationen zur Kostenstelle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="number">Kostenstellennummer *</Label>
                  <Input
                    id="number"
                    placeholder="z.B. 1000"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    4-stellig, erste Ziffer = Kategorie
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Bezeichnung *</Label>
                  <Input
                    id="name"
                    placeholder="z.B. Produktion Halle A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Verantwortlich</Label>
                  <Select
                    value={formData.manager}
                    onValueChange={(value) => setFormData({ ...formData, manager: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Verantwortlichen wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((mgr) => (
                        <SelectItem key={mgr.value} value={mgr.value}>
                          {mgr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  placeholder="Aufgabenbereich und Zuständigkeiten beschreiben..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budgetplanung</CardTitle>
                <CardDescription>Jahresbudget für Kostenstelle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Jahresbudget (CHF)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0.00"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>

                {formData.budget && (
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monatsbudget</span>
                      <span className="font-mono font-medium">
                        CHF {(parseFloat(formData.budget) / 12).toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Quartalsbudget</span>
                      <span className="font-mono font-medium">
                        CHF {(parseFloat(formData.budget) / 4).toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kontierung</CardTitle>
                <CardDescription>Automatische Zuordnung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Target className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Kostenrechnung</p>
                    <p className="text-muted-foreground">
                      Buchungen werden automatisch dieser Kostenstelle zugeordnet
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/cost-centers")}>
            Abbrechen
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Kostenstelle anlegen
          </Button>
        </div>
      </form>
    </div>
  );
}
