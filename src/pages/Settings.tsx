import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Building2,
  Mail,
  Key,
  Smartphone,
  Save,
  Link2,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "profile", label: "Profil", icon: User },
  { id: "integrations", label: "Integrationen", icon: Link2 },
  { id: "notifications", label: "Benachrichtigungen", icon: Bell },
  { id: "security", label: "Sicherheit", icon: Shield },
  { id: "appearance", label: "Darstellung", icon: Palette },
  { id: "billing", label: "Abrechnung", icon: CreditCard },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Einstellungen
        </h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Kontoeinstellungen und Präferenzen
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-1">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <section.icon className="h-5 w-5" />
              <span className="font-medium">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 rounded-2xl border border-border bg-card p-6">
          {activeSection === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Profil</h2>
                <p className="text-sm text-muted-foreground">
                  Verwalten Sie Ihre persönlichen Informationen
                </p>
              </div>

              <Separator />

              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                    MK
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">Foto ändern</Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG oder GIF. Max 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input id="firstName" defaultValue="Max" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input id="lastName" defaultValue="Keller" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="m.keller@loomora.de"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" defaultValue="+49 170 1234567" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  defaultValue="CEO & Gründer von Loomora"
                />
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Änderungen speichern
              </Button>
            </div>
          )}

          {activeSection === "integrations" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Integrationen</h2>
                <p className="text-sm text-muted-foreground">
                  Verbinden Sie externe E-Mail- und Kalender-Dienste
                </p>
              </div>

              <Separator />

              {/* E-Mail Integrationen */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  E-Mail-Dienste
                </h3>
                
                <div className="grid gap-3">
                  {/* Microsoft 365 */}
                  <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0078d4]/10">
                          <svg className="h-6 w-6" viewBox="0 0 23 23" fill="none">
                            <path fill="#f25022" d="M1 1h10v10H1z"/>
                            <path fill="#00a4ef" d="M1 12h10v10H1z"/>
                            <path fill="#7fba00" d="M12 1h10v10H12z"/>
                            <path fill="#ffb900" d="M12 12h10v10H12z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Microsoft 365</p>
                          <p className="text-sm text-muted-foreground">
                            Outlook, Exchange, Teams-Kalender
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-muted-foreground">
                          <XCircle className="h-3 w-3 mr-1" />
                          Nicht verbunden
                        </Badge>
                        <Button>Verbinden</Button>
                      </div>
                    </div>
                  </div>

                  {/* Google Workspace */}
                  <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border">
                          <svg className="h-6 w-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Google Workspace</p>
                          <p className="text-sm text-muted-foreground">
                            Gmail, Google Calendar, Kontakte
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-muted-foreground">
                          <XCircle className="h-3 w-3 mr-1" />
                          Nicht verbunden
                        </Badge>
                        <Button>Verbinden</Button>
                      </div>
                    </div>
                  </div>

                  {/* IMAP/SMTP */}
                  <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                          <Mail className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">IMAP / SMTP</p>
                          <p className="text-sm text-muted-foreground">
                            Beliebiger E-Mail-Server
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-muted-foreground">
                          <XCircle className="h-3 w-3 mr-1" />
                          Nicht verbunden
                        </Badge>
                        <Button variant="outline">Konfigurieren</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Kalender Integrationen */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Kalender-Synchronisation
                </h3>
                
                <div className="grid gap-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Kalender-Sync aktivieren</p>
                        <p className="text-sm text-muted-foreground">
                          Termine mit externen Kalendern synchronisieren
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bidirektionale Sync</p>
                        <p className="text-sm text-muted-foreground">
                          Änderungen in beide Richtungen synchronisieren
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sync-Intervall</p>
                        <p className="text-sm text-muted-foreground">
                          Wie oft soll synchronisiert werden?
                        </p>
                      </div>
                      <Select defaultValue="15">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Alle 5 Min.</SelectItem>
                          <SelectItem value="15">Alle 15 Min.</SelectItem>
                          <SelectItem value="30">Alle 30 Min.</SelectItem>
                          <SelectItem value="60">Stündlich</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* E-Mail Einstellungen */}
              <div className="space-y-4">
                <h3 className="font-medium">E-Mail-Versand Einstellungen</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Absender-Name</Label>
                    <Input id="senderName" defaultValue="Loomora Metallbau AG" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">Absender-E-Mail</Label>
                    <Input id="senderEmail" type="email" defaultValue="info@loomora.ch" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replyTo">Antwort-Adresse</Label>
                    <Input id="replyTo" type="email" defaultValue="support@loomora.ch" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signature">E-Mail-Signatur</Label>
                    <Select defaultValue="company">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Persönlich</SelectItem>
                        <SelectItem value="company">Firma</SelectItem>
                        <SelectItem value="none">Keine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Einstellungen speichern
                </Button>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Verbindung testen
                </Button>
              </div>

              {/* Info Box */}
              <div className="rounded-xl border border-info/30 bg-info/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10">
                    <Link2 className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <p className="font-medium text-info">Backend erforderlich</p>
                    <p className="text-sm text-muted-foreground">
                      Für die vollständige E-Mail- und Kalender-Integration muss Lovable Cloud aktiviert werden. 
                      Dies ermöglicht OAuth-Authentifizierung und sichere API-Verbindungen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Benachrichtigungen
                </h2>
                <p className="text-sm text-muted-foreground">
                  Konfigurieren Sie Ihre Benachrichtigungseinstellungen
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                {[
                  {
                    title: "E-Mail-Benachrichtigungen",
                    description: "Erhalten Sie Updates per E-Mail",
                    icon: Mail,
                  },
                  {
                    title: "Push-Benachrichtigungen",
                    description: "Browser-Push-Nachrichten aktivieren",
                    icon: Bell,
                  },
                  {
                    title: "Mobile Benachrichtigungen",
                    description: "Nachrichten auf Ihrem Smartphone",
                    icon: Smartphone,
                  },
                  {
                    title: "Projekt-Updates",
                    description: "Benachrichtigungen bei Projektänderungen",
                    icon: Building2,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-4 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Sicherheit</h2>
                <p className="text-sm text-muted-foreground">
                  Verwalten Sie Ihre Sicherheitseinstellungen
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Passwort ändern</p>
                        <p className="text-sm text-muted-foreground">
                          Zuletzt geändert vor 30 Tagen
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Ändern</Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                        <Shield className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">Zwei-Faktor-Authentifizierung</p>
                        <p className="text-sm text-muted-foreground">
                          Zusätzliche Sicherheitsebene aktivieren
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                        <Globe className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">Aktive Sitzungen</p>
                        <p className="text-sm text-muted-foreground">
                          3 aktive Geräte
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Verwalten</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Darstellung</h2>
                <p className="text-sm text-muted-foreground">
                  Passen Sie das Erscheinungsbild an
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Farbschema</Label>
                  <Select defaultValue="system">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Hell</SelectItem>
                      <SelectItem value="dark">Dunkel</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sprache</Label>
                  <Select defaultValue="de">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Zeitzone</Label>
                  <Select defaultValue="europe-berlin">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe-berlin">
                        Europa/Berlin (UTC+1)
                      </SelectItem>
                      <SelectItem value="europe-london">
                        Europa/London (UTC)
                      </SelectItem>
                      <SelectItem value="america-new-york">
                        Amerika/New York (UTC-5)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {activeSection === "billing" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Abrechnung</h2>
                <p className="text-sm text-muted-foreground">
                  Verwalten Sie Ihren Plan und Zahlungsmethoden
                </p>
              </div>

              <Separator />

              <div className="p-6 rounded-xl border border-primary bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aktueller Plan</p>
                    <p className="text-2xl font-bold">Business Pro</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      €99/Monat • Wird am 15.02.2024 verlängert
                    </p>
                  </div>
                  <Button>Plan upgraden</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Zahlungsmethode</h3>
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">
                          Läuft ab 12/2025
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Ändern</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
