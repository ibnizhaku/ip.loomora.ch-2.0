import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Megaphone, Users, Mail, TrendingUp, Calendar, Target, BarChart3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const campaignData = {
  id: "CAMP-2024-0012",
  name: "Frühjahrsaktion Metallbau 2024",
  beschreibung: "Spezialangebote für Stahlkonstruktionen und Geländer mit 15% Rabatt auf Standardprodukte",
  status: "aktiv",
  typ: "E-Mail & Direktmailing",
  zielgruppe: "Architekten & Bauunternehmen",
  startDatum: "15.01.2024",
  endDatum: "31.03.2024",
  budget: 8500,
  ausgaben: 3240,
  verantwortlich: "Lisa Weber",
};

const kennzahlen = {
  empfänger: 1250,
  geöffnet: 487,
  geklickt: 156,
  konvertiert: 23,
  umsatz: 145000,
};

const leads = [
  { firma: "Architektur Meier GmbH", kontakt: "Dr. Stefan Meier", status: "qualifiziert", wert: 28000, datum: "22.01.2024" },
  { firma: "Bau & Konstruktion AG", kontakt: "Andrea Keller", status: "angebot", wert: 45000, datum: "25.01.2024" },
  { firma: "Planungsbüro Zürich", kontakt: "Thomas Brunner", status: "kontaktiert", wert: 18000, datum: "28.01.2024" },
  { firma: "Immobilien Invest SA", kontakt: "Marie Dubois", status: "neu", wert: 32000, datum: "29.01.2024" },
];

const aktivitäten = [
  { datum: "29.01.2024", aktion: "Follow-up E-Mail versendet", empfänger: 487 },
  { datum: "22.01.2024", aktion: "Reminder E-Mail versendet", empfänger: 763 },
  { datum: "15.01.2024", aktion: "Initiale Kampagne gestartet", empfänger: 1250 },
];

const statusColors: Record<string, string> = {
  aktiv: "bg-success/10 text-success",
  geplant: "bg-info/10 text-info",
  beendet: "bg-muted text-muted-foreground",
  pausiert: "bg-warning/10 text-warning",
};

const leadStatusColors: Record<string, string> = {
  neu: "bg-info/10 text-info",
  kontaktiert: "bg-warning/10 text-warning",
  qualifiziert: "bg-success/10 text-success",
  angebot: "bg-primary/10 text-primary",
};

export default function CampaignDetail() {
  const { id } = useParams();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const öffnungsrate = (kennzahlen.geöffnet / kennzahlen.empfänger) * 100;
  const klickrate = (kennzahlen.geklickt / kennzahlen.geöffnet) * 100;
  const konversionsrate = (kennzahlen.konvertiert / kennzahlen.geklickt) * 100;
  const roi = ((kennzahlen.umsatz - campaignData.ausgaben) / campaignData.ausgaben) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/campaigns">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{campaignData.name}</h1>
            <Badge className={statusColors[campaignData.status]}>
              {campaignData.status.charAt(0).toUpperCase() + campaignData.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">{campaignData.id} • {campaignData.typ}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Report
          </Button>
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            E-Mail senden
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Empfänger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kennzahlen.empfänger.toLocaleString("de-CH")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Öffnungsrate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{öffnungsrate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">{kennzahlen.geöffnet} geöffnet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Klickrate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{klickrate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">{kennzahlen.geklickt} Klicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Konversionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{kennzahlen.konvertiert}</p>
            <p className="text-xs text-muted-foreground">{konversionsrate.toFixed(1)}% Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Generierter Umsatz</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatCurrency(kennzahlen.umsatz)}</p>
            <p className="text-xs text-muted-foreground">ROI: {roi.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget & Timeline */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Progress value={(campaignData.ausgaben / campaignData.budget) * 100} className="flex-1 h-3" />
              <span className="font-medium">{((campaignData.ausgaben / campaignData.budget) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ausgaben: {formatCurrency(campaignData.ausgaben)}</span>
              <span className="text-muted-foreground">Budget: {formatCurrency(campaignData.budget)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kampagnen-Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Zeitraum</p>
                <p className="font-medium">{campaignData.startDatum} - {campaignData.endDatum}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Zielgruppe</p>
                <p className="font-medium">{campaignData.zielgruppe}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Verantwortlich</p>
                <p className="font-medium">{campaignData.verantwortlich}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Typ</p>
                <Badge variant="outline">{campaignData.typ}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generierte Leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Generierte Leads</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firma</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Potenzial</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{lead.firma}</TableCell>
                  <TableCell>{lead.kontakt}</TableCell>
                  <TableCell>
                    <Badge className={leadStatusColors[lead.status]}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(lead.wert)}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.datum}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Aktivitäten */}
      <Card>
        <CardHeader>
          <CardTitle>Kampagnen-Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aktivitäten.map((akt, i) => (
              <div key={i} className="flex items-center gap-4 pb-3 border-b last:border-0">
                <div className="text-sm text-muted-foreground w-24">{akt.datum}</div>
                <div className="flex-1">{akt.aktion}</div>
                <Badge variant="outline">{akt.empfänger.toLocaleString("de-CH")} Empfänger</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
