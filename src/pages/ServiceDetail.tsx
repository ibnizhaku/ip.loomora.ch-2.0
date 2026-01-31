import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Wrench, Clock, User, MessageSquare, CheckCircle2, AlertTriangle, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const serviceData = {
  id: "TKT-2024-0456",
  titel: "Reparatur Schweissnaht Halle 3",
  beschreibung: "Schweissnaht am Hauptträger zeigt Risse. Dringende Inspektion und Reparatur erforderlich.",
  kunde: "Müller Industrie AG",
  kundenNr: "KD-2024-0015",
  kontakt: "Hans Müller",
  telefon: "+41 44 567 89 00",
  standort: "Industriestrasse 45, 8005 Zürich",
  status: "in-bearbeitung",
  priorität: "hoch",
  kategorie: "Reparatur",
  erstelltAm: "28.01.2024 09:15",
  fälligBis: "30.01.2024 17:00",
  zugewiesen: "Marco Brunner",
  geschätzteZeit: 4,
  effektiveZeit: 2.5,
  materialkosten: 185.00,
};

const aktivitäten = [
  { zeit: "28.01.2024 14:30", user: "MB", typ: "Notiz", text: "Vor-Ort-Besichtigung abgeschlossen. Riss ist ca. 15cm lang, oberflächlich. Kann geschweisst werden." },
  { zeit: "28.01.2024 11:00", user: "MB", typ: "Status", text: "Status geändert zu 'In Bearbeitung'" },
  { zeit: "28.01.2024 09:30", user: "PS", typ: "Zuweisung", text: "Ticket zugewiesen an Marco Brunner" },
  { zeit: "28.01.2024 09:15", user: "System", typ: "Erstellt", text: "Ticket erstellt via Kundenportal" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  "offen": { label: "Offen", color: "bg-info/10 text-info" },
  "in-bearbeitung": { label: "In Bearbeitung", color: "bg-warning/10 text-warning" },
  "warten": { label: "Warten auf Kunde", color: "bg-muted text-muted-foreground" },
  "erledigt": { label: "Erledigt", color: "bg-success/10 text-success" },
};

const prioritätConfig: Record<string, { label: string; color: string }> = {
  niedrig: { label: "Niedrig", color: "bg-muted text-muted-foreground" },
  mittel: { label: "Mittel", color: "bg-info/10 text-info" },
  hoch: { label: "Hoch", color: "bg-warning/10 text-warning" },
  kritisch: { label: "Kritisch", color: "bg-destructive/10 text-destructive" },
};

export default function ServiceDetail() {
  const { id } = useParams();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/service">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{serviceData.id}</h1>
            <Badge className={statusConfig[serviceData.status].color}>
              {statusConfig[serviceData.status].label}
            </Badge>
            <Badge className={prioritätConfig[serviceData.priorität].color}>
              {prioritätConfig[serviceData.priorität].label}
            </Badge>
          </div>
          <p className="text-muted-foreground">{serviceData.titel}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Rapport
          </Button>
          <Button>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Abschliessen
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fällig bis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{serviceData.fälligBis.split(" ")[0]}</p>
            <p className="text-sm text-muted-foreground">{serviceData.fälligBis.split(" ")[1]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Zeitaufwand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{serviceData.effektiveZeit} / {serviceData.geschätzteZeit} Std.</p>
            <p className="text-sm text-muted-foreground">erfasst / geplant</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(serviceData.materialkosten)}</p>
            <p className="text-sm text-muted-foreground">Verbrauch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Zugewiesen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>MB</AvatarFallback>
              </Avatar>
              <span className="font-medium">{serviceData.zugewiesen}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Beschreibung */}
        <Card>
          <CardHeader>
            <CardTitle>Beschreibung</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{serviceData.beschreibung}</p>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Kategorie</p>
                <Badge variant="outline">{serviceData.kategorie}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Erstellt am</p>
                <p>{serviceData.erstelltAm}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kunde */}
        <Card>
          <CardHeader>
            <CardTitle>Kundendaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-muted-foreground text-sm">Firma</p>
              <Link to={`/customers/${serviceData.kundenNr}`} className="font-medium text-primary hover:underline">
                {serviceData.kunde}
              </Link>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Ansprechpartner</p>
              <p className="font-medium">{serviceData.kontakt}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Telefon</p>
              <p>{serviceData.telefon}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Standort</p>
              <p>{serviceData.standort}</p>
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea placeholder="Kommentar hinzufügen..." className="flex-1" />
            <Button>Senden</Button>
          </div>
          <Separator />
          <div className="space-y-4">
            {aktivitäten.map((akt, i) => (
              <div key={i} className="flex gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{akt.user}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{akt.typ}</Badge>
                    <span className="text-xs text-muted-foreground">{akt.zeit}</span>
                  </div>
                  <p className="text-sm mt-1">{akt.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
