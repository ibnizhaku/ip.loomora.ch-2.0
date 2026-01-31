import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Shield, Key, Clock, CheckCircle2, XCircle, Mail, Smartphone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const userData = {
  id: "USR-0045",
  name: "Marco Brunner",
  email: "m.brunner@firma.ch",
  telefon: "+41 79 234 56 78",
  rolle: "Mitarbeiter",
  abteilung: "Produktion",
  mitarbeiterNr: "MA-0045",
  status: "aktiv",
  erstelltAm: "01.03.2022",
  letzterLogin: "29.01.2024 08:15",
  zweiFaktor: true,
  sprache: "Deutsch",
  zeitzone: "Europe/Zurich",
};

const berechtigungen = [
  { modul: "Dashboard", lesen: true, schreiben: true, löschen: false },
  { modul: "Projekte", lesen: true, schreiben: true, löschen: false },
  { modul: "Aufgaben", lesen: true, schreiben: true, löschen: true },
  { modul: "Zeiterfassung", lesen: true, schreiben: true, löschen: false },
  { modul: "Produktion", lesen: true, schreiben: true, löschen: false },
  { modul: "Stücklisten", lesen: true, schreiben: false, löschen: false },
  { modul: "Kunden", lesen: true, schreiben: false, löschen: false },
  { modul: "Rechnungen", lesen: false, schreiben: false, löschen: false },
  { modul: "Buchhaltung", lesen: false, schreiben: false, löschen: false },
  { modul: "Personal", lesen: false, schreiben: false, löschen: false },
  { modul: "Einstellungen", lesen: false, schreiben: false, löschen: false },
];

const loginHistorie = [
  { datum: "29.01.2024 08:15", ip: "85.195.xxx.xxx", gerät: "Chrome / Windows", ort: "Zürich, CH", status: "erfolgreich" },
  { datum: "28.01.2024 07:55", ip: "85.195.xxx.xxx", gerät: "Chrome / Windows", ort: "Zürich, CH", status: "erfolgreich" },
  { datum: "26.01.2024 08:02", ip: "85.195.xxx.xxx", gerät: "Safari / iOS", ort: "Zürich, CH", status: "erfolgreich" },
  { datum: "25.01.2024 18:30", ip: "178.82.xxx.xxx", gerät: "Chrome / Windows", ort: "Bern, CH", status: "fehlgeschlagen" },
  { datum: "25.01.2024 08:10", ip: "85.195.xxx.xxx", gerät: "Chrome / Windows", ort: "Zürich, CH", status: "erfolgreich" },
];

const statusColors: Record<string, string> = {
  aktiv: "bg-success/10 text-success",
  inaktiv: "bg-muted text-muted-foreground",
  gesperrt: "bg-destructive/10 text-destructive",
};

export default function UserDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{userData.name}</h1>
            <Badge className={statusColors[userData.status]}>
              {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
            </Badge>
            <Badge variant="outline">{userData.rolle}</Badge>
          </div>
          <p className="text-muted-foreground">{userData.id} • {userData.abteilung}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Key className="mr-2 h-4 w-4" />
            Passwort zurücksetzen
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Benutzerdaten */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Benutzerprofil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {userData.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{userData.name}</p>
                <p className="text-muted-foreground">{userData.rolle} • {userData.abteilung}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span>{userData.telefon}</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Mitarbeiter-Nr.</p>
                <Link to={`/hr/${userData.mitarbeiterNr}`} className="text-primary hover:underline">
                  {userData.mitarbeiterNr}
                </Link>
              </div>
              <div>
                <p className="text-muted-foreground">Erstellt am</p>
                <p>{userData.erstelltAm}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sprache</p>
                <p>{userData.sprache}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Zeitzone</p>
                <p>{userData.zeitzone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sicherheit */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Sicherheit</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Zwei-Faktor-Authentifizierung</p>
                  <p className="text-sm text-muted-foreground">Zusätzliche Sicherheit beim Login</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userData.zweiFaktor ? (
                  <Badge className="bg-success/10 text-success">Aktiv</Badge>
                ) : (
                  <Badge variant="outline">Inaktiv</Badge>
                )}
                <Switch checked={userData.zweiFaktor} />
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Letzter Login</p>
                  <p className="text-sm text-muted-foreground">{userData.letzterLogin}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Key className="mr-2 h-4 w-4" />
                Passwort ändern
              </Button>
              <Button variant="outline" className="flex-1 text-destructive">
                Sitzungen beenden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Berechtigungen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Berechtigungen (Rolle: {userData.rolle})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modul</TableHead>
                <TableHead className="text-center">Lesen</TableHead>
                <TableHead className="text-center">Schreiben</TableHead>
                <TableHead className="text-center">Löschen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {berechtigungen.map((b) => (
                <TableRow key={b.modul}>
                  <TableCell className="font-medium">{b.modul}</TableCell>
                  <TableCell className="text-center">
                    {b.lesen ? (
                      <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {b.schreiben ? (
                      <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {b.löschen ? (
                      <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Login-Historie */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Login-Historie</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeitpunkt</TableHead>
                <TableHead>IP-Adresse</TableHead>
                <TableHead>Gerät / Browser</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loginHistorie.map((l, i) => (
                <TableRow key={i}>
                  <TableCell>{l.datum}</TableCell>
                  <TableCell className="font-mono text-sm">{l.ip}</TableCell>
                  <TableCell>{l.gerät}</TableCell>
                  <TableCell>{l.ort}</TableCell>
                  <TableCell>
                    {l.status === "erfolgreich" ? (
                      <Badge className="bg-success/10 text-success">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Erfolgreich
                      </Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Fehlgeschlagen
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
