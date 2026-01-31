import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Building2, Mail, Phone, MapPin, Calendar, TrendingUp, MessageSquare, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const leadData = {
  id: "LEAD-2024-0234",
  firma: "Stahl & Technik GmbH",
  ansprechpartner: "Dr. Martin Keller",
  position: "Geschäftsführer",
  email: "m.keller@stahl-technik.ch",
  telefon: "+41 44 567 89 00",
  mobile: "+41 79 234 56 78",
  adresse: "Industriestrasse 45, 8005 Zürich",
  website: "www.stahl-technik.ch",
  branche: "Maschinenbau",
  mitarbeiter: "50-100",
  quelle: "Messe Swissbau 2024",
  status: "qualifiziert",
  bewertung: 4,
  potenzial: 85000,
  wahrscheinlichkeit: 70,
  nächsteAktion: "Angebot erstellen",
  nächsterTermin: "05.02.2024",
  zuständig: "Peter Schneider",
  erstelltAm: "18.01.2024",
};

const aktivitäten = [
  { datum: "30.01.2024", typ: "Besuch", beschreibung: "Vor-Ort-Besichtigung der Produktionshalle durchgeführt", user: "PS" },
  { datum: "25.01.2024", typ: "E-Mail", beschreibung: "Produktkatalog und Referenzliste zugesendet", user: "PS" },
  { datum: "22.01.2024", typ: "Anruf", beschreibung: "Erstgespräch: Interesse an Stahlkonstruktion für Hallenerweiterung", user: "PS" },
  { datum: "18.01.2024", typ: "Messe", beschreibung: "Erstkontakt auf der Swissbau, Visitenkarte erhalten", user: "LW" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  neu: { label: "Neu", color: "bg-info/10 text-info" },
  kontaktiert: { label: "Kontaktiert", color: "bg-warning/10 text-warning" },
  qualifiziert: { label: "Qualifiziert", color: "bg-success/10 text-success" },
  angebot: { label: "Angebot", color: "bg-primary/10 text-primary" },
  verloren: { label: "Verloren", color: "bg-destructive/10 text-destructive" },
  gewonnen: { label: "Gewonnen", color: "bg-success/10 text-success" },
};

const typIcons: Record<string, string> = {
  Anruf: "📞",
  "E-Mail": "✉️",
  Besuch: "🏢",
  Messe: "🎪",
  Meeting: "👥",
};

export default function LeadDetail() {
  const { id } = useParams();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const gewichtetesPotenzial = leadData.potenzial * (leadData.wahrscheinlichkeit / 100);

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
            <Badge className={statusConfig[leadData.status].color}>
              {statusConfig[leadData.status].label}
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
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Aktivität
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Angebot
          </Button>
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Zu Kunde konvertieren
          </Button>
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
                <a href={`https://${leadData.website}`} target="_blank" className="text-primary hover:underline">
                  {leadData.website}
                </a>
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
          <Button size="sm">
            Neue Aktivität
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aktivitäten.map((akt, i) => (
              <div key={i} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="text-2xl">{typIcons[akt.typ] || "📌"}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{akt.typ}</Badge>
                    <span className="text-sm text-muted-foreground">{akt.datum}</span>
                  </div>
                  <p className="mt-1">{akt.beschreibung}</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{akt.user}</AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
