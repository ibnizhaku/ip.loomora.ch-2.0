import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const abwesenheitData = {
  id: "ABW-2024-0089",
  mitarbeiter: "Marco Brunner",
  personalNr: "MA-0045",
  abteilung: "Produktion",
  typ: "Ferien",
  status: "genehmigt",
  von: "19.02.2024",
  bis: "23.02.2024",
  tage: 5,
  stunden: 42.5,
  bemerkung: "Skiferien mit Familie",
  beantragtAm: "15.01.2024",
  genehmigtVon: "Thomas Meier",
  genehmigtAm: "16.01.2024",
  vertretung: "Andreas Steiner",
};

const kontingent = {
  ferienTotal: 25,
  ferienGenommen: 8,
  ferienGeplant: 5,
  ferienRest: 12,
  überstundenSaldo: 24.5,
};

const abwesenheitsTypen = [
  { typ: "Ferien", icon: "🏖️", farbe: "bg-success/10 text-success" },
  { typ: "Krankheit", icon: "🤒", farbe: "bg-destructive/10 text-destructive" },
  { typ: "Unfall", icon: "🚑", farbe: "bg-destructive/10 text-destructive" },
  { typ: "Militär", icon: "🎖️", farbe: "bg-warning/10 text-warning" },
  { typ: "Weiterbildung", icon: "📚", farbe: "bg-info/10 text-info" },
  { typ: "Unbezahlt", icon: "📋", farbe: "bg-muted text-muted-foreground" },
];

const verlauf = [
  { datum: "16.01.2024 09:15", aktion: "Genehmigt", user: "Thomas Meier", notiz: "Vertretung durch A. Steiner bestätigt" },
  { datum: "15.01.2024 14:30", aktion: "Beantragt", user: "Marco Brunner", notiz: "" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  beantragt: { label: "Beantragt", color: "bg-warning/10 text-warning", icon: Clock },
  genehmigt: { label: "Genehmigt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  abgelehnt: { label: "Abgelehnt", color: "bg-destructive/10 text-destructive", icon: XCircle },
  storniert: { label: "Storniert", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

export default function AbsenceDetail() {
  const { id } = useParams();

  const currentTyp = abwesenheitsTypen.find(t => t.typ === abwesenheitData.typ);
  const StatusIcon = statusConfig[abwesenheitData.status].icon;
  const ferienVerbraucht = ((kontingent.ferienGenommen + kontingent.ferienGeplant) / kontingent.ferienTotal) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/absences">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{abwesenheitData.id}</h1>
            <Badge className={statusConfig[abwesenheitData.status].color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[abwesenheitData.status].label}
            </Badge>
            <Badge className={currentTyp?.farbe}>
              {currentTyp?.icon} {abwesenheitData.typ}
            </Badge>
          </div>
          <p className="text-muted-foreground">{abwesenheitData.mitarbeiter} • {abwesenheitData.abteilung}</p>
        </div>
        <div className="flex gap-2">
          {abwesenheitData.status === "beantragt" && (
            <>
              <Button variant="outline" className="text-destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Ablehnen
              </Button>
              <Button>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Genehmigen
              </Button>
            </>
          )}
          {abwesenheitData.status === "genehmigt" && (
            <Button variant="outline">
              Stornieren
            </Button>
          )}
        </div>
      </div>

      {/* Zeitraum Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Von</p>
                <p className="text-2xl font-bold">{abwesenheitData.von}</p>
              </div>
              <div className="text-3xl text-muted-foreground">→</div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Bis</p>
                <p className="text-2xl font-bold">{abwesenheitData.bis}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary">{abwesenheitData.tage}</p>
              <p className="text-sm text-muted-foreground">Arbeitstage ({abwesenheitData.stunden} Std.)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mitarbeiter */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Mitarbeiter</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {abwesenheitData.mitarbeiter.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link to={`/hr/${abwesenheitData.personalNr}`} className="font-medium text-primary hover:underline">
                  {abwesenheitData.mitarbeiter}
                </Link>
                <p className="text-sm text-muted-foreground">{abwesenheitData.personalNr} • {abwesenheitData.abteilung}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-1">Vertretung</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">AS</AvatarFallback>
                </Avatar>
                <span className="font-medium">{abwesenheitData.vertretung}</span>
              </div>
            </div>

            {abwesenheitData.bemerkung && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bemerkung</p>
                  <p>{abwesenheitData.bemerkung}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ferienkontingent */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Ferienkontingent 2024</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Verbraucht / Geplant</span>
                <span>{kontingent.ferienGenommen + kontingent.ferienGeplant} / {kontingent.ferienTotal} Tage</span>
              </div>
              <Progress value={ferienVerbraucht} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{kontingent.ferienGenommen}</p>
                <p className="text-xs text-muted-foreground">Genommen</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <p className="text-2xl font-bold text-warning">{kontingent.ferienGeplant}</p>
                <p className="text-xs text-muted-foreground">Geplant</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <p className="text-2xl font-bold text-success">{kontingent.ferienRest}</p>
                <p className="text-xs text-muted-foreground">Verfügbar</p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <p className="text-2xl font-bold text-info">+{kontingent.überstundenSaldo}</p>
                <p className="text-xs text-muted-foreground">Überstunden (Std.)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Genehmigung */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Genehmigungsprozess</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Beantragt am</p>
              <p className="font-medium">{abwesenheitData.beantragtAm}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Genehmigt von</p>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">TM</AvatarFallback>
                </Avatar>
                <span className="font-medium">{abwesenheitData.genehmigtVon}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Genehmigt am</p>
              <p className="font-medium">{abwesenheitData.genehmigtAm}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verlauf */}
      <Card>
        <CardHeader>
          <CardTitle>Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verlauf.map((v, i) => (
              <div key={i} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="text-sm text-muted-foreground w-36">{v.datum}</div>
                <div className="flex-1">
                  <Badge variant="outline">{v.aktion}</Badge>
                  <span className="ml-2 text-sm">durch {v.user}</span>
                  {v.notiz && <p className="text-sm text-muted-foreground mt-1">{v.notiz}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
