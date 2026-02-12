import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Shield, Key, Clock, CheckCircle2, XCircle, Mail, Smartphone, Settings, Save, Eye, Edit2, Trash2, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const initialBerechtigungen = [
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
  const navigate = useNavigate();

  // Load user from backend
  const { data: userFromBackend, isLoading, error } = useQuery({
    queryKey: ['users', id],
    queryFn: () => api.get<any>(`/users/${id}`),
    enabled: !!id,
  });

  const [berechtigungen, setBerechtigungen] = useState(initialBerechtigungen);
  const [hasChanges, setHasChanges] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    telefon: '',
    rolle: '',
    abteilung: '',
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error state
  if (error || !userFromBackend) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Benutzer nicht gefunden</p>
        <Link to="/users" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  // Map backend data to component format
  const userData = {
    id: userFromBackend.id,
    name: `${userFromBackend.firstName || ''} ${userFromBackend.lastName || ''}`.trim(),
    email: userFromBackend.email || '',
    telefon: userFromBackend.phone || '',
    rolle: userFromBackend.role || 'Mitarbeiter',
    abteilung: 'Produktion',
    mitarbeiterNr: userFromBackend.id.substring(0, 8).toUpperCase(),
    status: userFromBackend.isActive ? 'aktiv' : 'inaktiv',
    erstelltAm: userFromBackend.createdAt ? new Date(userFromBackend.createdAt).toLocaleDateString('de-CH') : '-',
    letzterLogin: userFromBackend.lastLoginAt ? new Date(userFromBackend.lastLoginAt).toLocaleDateString('de-CH') + ' ' + new Date(userFromBackend.lastLoginAt).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) : '-',
    zweiFaktor: userFromBackend.twoFactorEnabled || false,
    sprache: 'Deutsch',
    zeitzone: 'Europe/Zurich',
  };

  // Initialize form if empty
  if (editForm.email === '' && userFromBackend) {
    setEditForm({
      name: userData.name,
      email: userData.email,
      telefon: userData.telefon,
      rolle: userData.rolle,
      abteilung: userData.abteilung,
    });
    setTwoFactorEnabled(userData.zweiFaktor);
  }

  const handlePermissionChange = (modul: string, type: "lesen" | "schreiben" | "löschen", value: boolean) => {
    setBerechtigungen(prev => prev.map(b => {
      if (b.modul !== modul) return b;
      
      if (type === "lesen" && !value) {
        return { ...b, lesen: false, schreiben: false, löschen: false };
      }
      if (type === "schreiben" && value) {
        return { ...b, lesen: true, schreiben: true };
      }
      if (type === "löschen" && value) {
        return { ...b, lesen: true, schreiben: true, löschen: true };
      }
      if (type === "schreiben" && !value) {
        return { ...b, schreiben: false, löschen: false };
      }
      
      return { ...b, [type]: value };
    }));
    setHasChanges(true);
  };

  const handleSavePermissions = () => {
    toast.success("Berechtigungen gespeichert", {
      description: `Die Zugriffsrechte für ${userData.name} wurden aktualisiert`
    });
    setHasChanges(false);
  };

  const handleResetPassword = () => {
    toast.success("Passwort-Reset E-Mail gesendet", {
      description: `Eine E-Mail wurde an ${userData.email} gesendet`
    });
  };

  const handleSaveEdit = () => {
    toast.success("Benutzerdaten aktualisiert", {
      description: `${editForm.name} wurde erfolgreich aktualisiert`
    });
    setShowEditDialog(false);
  };

  const handleToggle2FA = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    toast.success(checked ? "2FA aktiviert" : "2FA deaktiviert", {
      description: checked 
        ? "Zwei-Faktor-Authentifizierung wurde eingerichtet"
        : "Zwei-Faktor-Authentifizierung wurde deaktiviert"
    });
  };

  const handleEndSessions = () => {
    toast.success("Alle Sitzungen beendet", {
      description: "Der Benutzer muss sich erneut anmelden"
    });
  };

  const getPermissionSummary = (b: typeof berechtigungen[0]) => {
    if (b.löschen) return { label: "Vollzugriff", color: "bg-success/10 text-success" };
    if (b.schreiben) return { label: "Lesen & Schreiben", color: "bg-info/10 text-info" };
    if (b.lesen) return { label: "Nur Lesen", color: "bg-warning/10 text-warning" };
    return { label: "Kein Zugriff", color: "bg-muted text-muted-foreground" };
  };
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
          <Button variant="outline" onClick={handleResetPassword}>
            <Key className="mr-2 h-4 w-4" />
            Passwort zurücksetzen
          </Button>
          <Button onClick={() => setShowEditDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>Aktualisieren Sie die Benutzerdaten</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name</Label>
              <Input id="editName" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">E-Mail</Label>
              <Input id="editEmail" type="email" value={editForm.email} onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTelefon">Telefon</Label>
              <Input id="editTelefon" value={editForm.telefon} onChange={e => setEditForm(prev => ({ ...prev, telefon: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAbteilung">Abteilung</Label>
              <Input id="editAbteilung" value={editForm.abteilung} onChange={e => setEditForm(prev => ({ ...prev, abteilung: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Abbrechen</Button>
            <Button onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                {twoFactorEnabled ? (
                  <Badge className="bg-success/10 text-success">Aktiv</Badge>
                ) : (
                  <Badge variant="outline">Inaktiv</Badge>
                )}
                <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
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
              <Button variant="outline" className="flex-1" onClick={handleResetPassword}>
                <Key className="mr-2 h-4 w-4" />
                Passwort ändern
              </Button>
              <Button variant="outline" className="flex-1 text-destructive" onClick={handleEndSessions}>
                Sitzungen beenden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Berechtigungen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Berechtigungen</CardTitle>
                <CardDescription>Zugriffsrechte für {userData.name} verwalten</CardDescription>
              </div>
            </div>
            {hasChanges && (
              <Button onClick={handleSavePermissions}>
                <Save className="mr-2 h-4 w-4" />
                Änderungen speichern
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modul</TableHead>
                  <TableHead className="text-center">
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 mx-auto">
                        <Eye className="h-4 w-4" />
                        Lesen
                      </TooltipTrigger>
                      <TooltipContent>Daten ansehen und lesen</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center">
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 mx-auto">
                        <Edit2 className="h-4 w-4" />
                        Schreiben
                      </TooltipTrigger>
                      <TooltipContent>Daten erstellen und bearbeiten</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center">
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 mx-auto">
                        <Trash2 className="h-4 w-4" />
                        Löschen
                      </TooltipTrigger>
                      <TooltipContent>Daten unwiderruflich löschen</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right">Zusammenfassung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {berechtigungen.map((b) => {
                  const summary = getPermissionSummary(b);
                  return (
                    <TableRow key={b.modul}>
                      <TableCell className="font-medium">{b.modul}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={b.lesen}
                          onCheckedChange={(checked) => handlePermissionChange(b.modul, "lesen", checked)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={b.schreiben}
                          onCheckedChange={(checked) => handlePermissionChange(b.modul, "schreiben", checked)}
                          disabled={!b.lesen}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={b.löschen}
                          onCheckedChange={(checked) => handlePermissionChange(b.modul, "löschen", checked)}
                          disabled={!b.schreiben}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={summary.color}>
                          {summary.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
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
