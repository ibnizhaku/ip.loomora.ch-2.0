import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Building2, Mail, Phone, MapPin, Calendar, TrendingUp, MessageSquare, FileText, Star, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLead, useLeadActivities, useConvertLead, useCreateLeadActivity } from "@/hooks/use-marketing";

const activityTypeToApi: Record<string, string> = {
  Anruf: "CALL",
  "E-Mail": "EMAIL",
  Besuch: "MEETING",
  Meeting: "MEETING",
  Messe: "NOTE",
};
const activityTypeFromApi: Record<string, string> = {
  CALL: "Anruf",
  EMAIL: "E-Mail",
  MEETING: "Meeting",
  NOTE: "Notiz",
  TASK: "Aufgabe",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: "Neu", color: "bg-info/10 text-info" },
  CONTACTED: { label: "Kontaktiert", color: "bg-warning/10 text-warning" },
  QUALIFIED: { label: "Qualifiziert", color: "bg-success/10 text-success" },
  PROPOSAL: { label: "Angebot", color: "bg-primary/10 text-primary" },
  NEGOTIATION: { label: "Verhandlung", color: "bg-primary/10 text-primary" },
  LOST: { label: "Verloren", color: "bg-destructive/10 text-destructive" },
  WON: { label: "Gewonnen", color: "bg-success/10 text-success" },
};

const typIcons: Record<string, string> = {
  Anruf: "📞",
  "E-Mail": "✉️",
  Besuch: "🏢",
  Messe: "🎪",
  Meeting: "👥",
  CALL: "📞",
  EMAIL: "✉️",
  MEETING: "👥",
  NOTE: "📌",
  TASK: "✅",
};

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState("Anruf");
  const [activityNote, setActivityNote] = useState("");

  const { data: lead, isLoading } = useLead(id);
  const { data: activitiesFromApi = [] } = useLeadActivities(id);
  const activities = ((lead as { activities?: typeof activitiesFromApi })?.activities ?? activitiesFromApi) as Array<{ id?: string; type: string; description: string; activityDate: string | Date }>;
  const convertLead = useConvertLead();
  const createActivity = useCreateLeadActivity();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });

  const leadData = lead
    ? {
        firma: (lead as { companyName?: string }).companyName || lead.company || "—",
        ansprechpartner: (lead as { name?: string }).name || `${(lead as { firstName?: string }).firstName || ""} ${(lead as { lastName?: string }).lastName || ""}`.trim() || "—",
        position: (lead as { position?: string }).position || "—",
        email: lead.email || "—",
        telefon: lead.phone || "—",
        status: lead.status,
        bewertung: (lead as { score?: number }).score ?? 0,
        potenzial: Number((lead as { estimatedValue?: number }).estimatedValue ?? (lead as { expectedValue?: number }).expectedValue ?? 0),
        wahrscheinlichkeit: (lead as { probability?: number }).probability ?? 50,
        zuständig: (lead as { assignedTo?: { firstName?: string; lastName?: string } }).assignedTo
          ? `${((lead as { assignedTo?: { firstName?: string } }).assignedTo?.firstName || "")} ${((lead as { assignedTo?: { lastName?: string } }).assignedTo?.lastName || "")}`.trim()
          : "—",
        erstelltAm: formatDate(lead.createdAt),
        nextFollowUp: (lead as { nextFollowUp?: string | Date }).nextFollowUp ? formatDate((lead as { nextFollowUp: string }).nextFollowUp) : null,
        quelle: (lead as { source?: string }).source || "—",
        customer: (lead as { customer?: { id: string } }).customer,
        nächsteAktion: (lead as { notes?: string }).notes || "—",
        nächsterTermin: (lead as { nextFollowUp?: string | Date }).nextFollowUp ? formatDate((lead as { nextFollowUp: string }).nextFollowUp) : "—",
        id: lead.id,
        branche: (lead as { industry?: string }).industry || "—",
        mitarbeiter: (lead as { employeeCount?: string }).employeeCount || "—",
        website: (lead as { website?: string }).website || "—",
        adresse: (lead as { address?: string }).address || "—",
        mobile: (lead as { mobile?: string }).mobile || lead.phone || "—",
      }
    : null;

  const gewichtetesPotenzial = leadData ? leadData.potenzial * (leadData.wahrscheinlichkeit / 100) : 0;

  const handleAddActivity = async () => {
    if (!activityNote.trim() || !id) {
      toast.error("Bitte geben Sie eine Beschreibung ein");
      return;
    }
    try {
      await createActivity.mutateAsync({
        leadId: id,
        type: activityTypeToApi[activityType] || "NOTE",
        description: activityNote,
      });
      setActivityDialogOpen(false);
      setActivityNote("");
      toast.success("Aktivität wurde hinzugefügt");
    } catch {
      toast.error("Aktivität konnte nicht gespeichert werden");
    }
  };

  const handleCreateQuote = () => {
    navigate(id ? `/quotes/new?leadId=${id}` : "/quotes/new");
  };

  const handleConvertToCustomer = async () => {
    if (!id) return;
    try {
      const result = await convertLead.mutateAsync({ leadId: id });
      setConvertDialogOpen(false);
      const customerId = (result as { customer?: { id: string } })?.customer?.id;
      toast.success("Lead wurde als Kunde angelegt");
      navigate(customerId ? `/customers/${customerId}` : "/customers");
    } catch {
      toast.error("Konvertierung fehlgeschlagen");
    }
  };

  if (isLoading || !lead) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">Lead nicht gefunden</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/leads">Zurück zu Leads</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!leadData) return null;

  const statusCfg = statusConfig[leadData.status] || { label: leadData.status, color: "bg-muted text-muted-foreground" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/leads">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{leadData.firma}</h1>
            <Badge className={statusCfg.color}>
              {statusCfg.label}
            </Badge>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < leadData.bewertung ? "text-warning fill-warning" : "text-muted-foreground"}`}
                />
              ))}
            </div>
          </div>
          <p className="text-muted-foreground">{leadData.id} • {leadData.branche}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActivityDialogOpen(true)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Aktivität
          </Button>
          <Button variant="outline" onClick={handleCreateQuote}>
            <FileText className="mr-2 h-4 w-4" />
            Angebot
          </Button>
          {leadData.status !== "WON" && (
            <Button onClick={() => setConvertDialogOpen(true)} disabled={convertLead.isPending}>
              {convertLead.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
              Zu Kunde konvertieren
            </Button>
          )}
        </div>
      </div>

      {/* Potenzial Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Potenzial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(leadData.potenzial)}</p>
            <p className="text-sm text-muted-foreground">geschätzter Auftragswert</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wahrscheinlichkeit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress value={leadData.wahrscheinlichkeit} className="flex-1 h-2" />
              <span className="text-2xl font-bold">{leadData.wahrscheinlichkeit}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gewichteter Wert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatCurrency(gewichtetesPotenzial)}</p>
            <p className="text-sm text-muted-foreground">erwarteter Umsatz</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nächste Aktion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{leadData.nächsteAktion}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {leadData.nächsterTermin}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Kontaktdaten */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Kontaktdaten</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {leadData.ansprechpartner.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{leadData.ansprechpartner}</p>
                <p className="text-muted-foreground">{leadData.position}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${leadData.email}`} className="text-primary hover:underline">
                  {leadData.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{leadData.telefon}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{leadData.mobile} (Mobile)</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{leadData.adresse}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Firmendaten */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Firmendaten</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Branche</p>
                <p className="font-medium">{leadData.branche}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unternehmensgrösse</p>
                <p className="font-medium">{leadData.mitarbeiter} Mitarbeiter</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                {leadData.website && leadData.website !== "—" ? (
                  <a href={leadData.website.startsWith("http") ? leadData.website : `https://${leadData.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {leadData.website}
                  </a>
                ) : (
                  <span>{leadData.website}</span>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lead-Quelle</p>
                <p className="font-medium">{leadData.quelle}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Zuständig</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">PS</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{leadData.zuständig}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Erfasst am</p>
                <p className="font-medium">{leadData.erstelltAm}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aktivitäten */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Aktivitäten</CardTitle>
          </div>
          <Button size="sm" onClick={() => setActivityDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Aktivität
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Aktivitäten erfasst.</p>
            ) : (
              activities.map((akt: { id?: string; type: string; description: string; activityDate: string | Date }) => (
                <div key={akt.id ?? akt.activityDate} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="text-2xl">{typIcons[akt.type] || "📌"}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{activityTypeFromApi[akt.type] || akt.type}</Badge>
                      <span className="text-sm text-muted-foreground">{formatDate(akt.activityDate)}</span>
                    </div>
                    <p className="mt-1">{akt.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Aktivität erfassen</DialogTitle>
            <DialogDescription>
              Dokumentieren Sie Ihren Kundenkontakt
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Aktivitätstyp</label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Anruf">📞 Anruf</SelectItem>
                  <SelectItem value="E-Mail">✉️ E-Mail</SelectItem>
                  <SelectItem value="Besuch">🏢 Besuch</SelectItem>
                  <SelectItem value="Meeting">👥 Meeting</SelectItem>
                  <SelectItem value="Messe">🎪 Messe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea 
                placeholder="Was wurde besprochen?"
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddActivity} disabled={createActivity.isPending}>
              {createActivity.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Aktivität speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Customer Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lead zu Kunde konvertieren</DialogTitle>
            <DialogDescription>
              Möchten Sie "{leadData.firma}" als Kunden anlegen?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Firma</span>
                <span className="font-medium">{leadData.firma}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ansprechpartner</span>
                <span className="font-medium">{leadData.ansprechpartner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potenzial</span>
                <span className="font-medium">{formatCurrency(leadData.potenzial)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleConvertToCustomer}>
              Kunde anlegen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
