import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Mail, Users, Calendar, Send } from "lucide-react";
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

const emailLists = [
  { value: "all", label: "Alle Abonnenten", count: 12500 },
  { value: "premium", label: "Premium-Kunden", count: 3400 },
  { value: "prospects", label: "Interessenten", count: 5600 },
  { value: "inactive", label: "Inaktive Kunden", count: 2800 },
];

const templates = [
  { value: "blank", label: "Leere E-Mail" },
  { value: "product-launch", label: "Produkt-Launch" },
  { value: "newsletter", label: "Newsletter Standard" },
  { value: "discount", label: "Rabatt-Aktion" },
  { value: "welcome", label: "Willkommens-Mail" },
  { value: "event", label: "Event-Einladung" },
];

export default function EmailCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "",
    preheader: "",
    template: "blank",
    list: "",
    content: "",
    sendType: "now",
    scheduledDate: "",
    scheduledTime: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.list) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    if (formData.sendType === "now") {
      toast.success("E-Mail wird gesendet...");
    } else if (formData.sendType === "scheduled") {
      toast.success("E-Mail wurde geplant");
    } else {
      toast.success("E-Mail als Entwurf gespeichert");
    }
    navigate("/email-marketing");
  };

  const selectedList = emailLists.find(l => l.value === formData.list);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/email-marketing")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Neue E-Mail
          </h1>
          <p className="text-muted-foreground">
            E-Mail-Kampagne erstellen und versenden
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                E-Mail Details
              </h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="subject">Betreff *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="z.B. Ihre exklusiven Angebote dieser Woche"
                  />
                </div>
                <div>
                  <Label htmlFor="preheader">Preheader</Label>
                  <Input
                    id="preheader"
                    value={formData.preheader}
                    onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
                    placeholder="Vorschautext in der Inbox"
                  />
                </div>
                <div>
                  <Label htmlFor="template">Vorlage</Label>
                  <Select
                    value={formData.template}
                    onValueChange={(value) => setFormData({ ...formData, template: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Empfänger
              </h3>
              <div>
                <Label htmlFor="list">Empfängerliste *</Label>
                <Select
                  value={formData.list}
                  onValueChange={(value) => setFormData({ ...formData, list: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Liste wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailLists.map((list) => (
                      <SelectItem key={list.value} value={list.value}>
                        {list.label} ({list.count.toLocaleString("de-CH")} Empfänger)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Inhalt</h3>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="E-Mail-Inhalt hier eingeben oder Vorlage verwenden..."
                rows={10}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Versandzeitpunkt
              </h3>
              <div className="grid gap-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sendType"
                      value="now"
                      checked={formData.sendType === "now"}
                      onChange={(e) => setFormData({ ...formData, sendType: e.target.value })}
                      className="text-primary"
                    />
                    Sofort senden
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sendType"
                      value="scheduled"
                      checked={formData.sendType === "scheduled"}
                      onChange={(e) => setFormData({ ...formData, sendType: e.target.value })}
                      className="text-primary"
                    />
                    Planen
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sendType"
                      value="draft"
                      checked={formData.sendType === "draft"}
                      onChange={(e) => setFormData({ ...formData, sendType: e.target.value })}
                      className="text-primary"
                    />
                    Als Entwurf speichern
                  </label>
                </div>
                {formData.sendType === "scheduled" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="scheduledDate">Datum</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduledTime">Uhrzeit</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Übersicht</h3>
              <div className="space-y-4">
                {selectedList && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Empfänger</p>
                    <p className="text-2xl font-bold text-primary">
                      {selectedList.count.toLocaleString("de-CH")}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedList.label}</p>
                  </div>
                )}
                {formData.template !== "blank" && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Vorlage</p>
                    <p className="font-medium">
                      {templates.find(t => t.value === formData.template)?.label}
                    </p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Versand</p>
                  <p className="font-medium">
                    {formData.sendType === "now" && "Sofort"}
                    {formData.sendType === "scheduled" && "Geplant"}
                    {formData.sendType === "draft" && "Entwurf"}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button type="submit" className="flex-1 gap-2">
                  {formData.sendType === "now" ? (
                    <>
                      <Send className="h-4 w-4" />
                      Senden
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Speichern
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/email-marketing")}
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
