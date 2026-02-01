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
  Store,
  Truck,
  Package,
  Percent,
  Tag,
  Image,
  Webhook,
  FileText,
  Download,
  Zap,
  ClipboardList,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Database,
  History,
  Lock,
  WifiOff,
  Upload,
  FolderSync,
  Contact,
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const settingsSections = [
  { id: "profile", label: "Profil", icon: User },
  { id: "integrations", label: "Integrationen", icon: Link2 },
  { id: "calendar", label: "Kalender & Kontakte", icon: Calendar },
  { id: "email", label: "E-Mail", icon: Mail },
  { id: "api", label: "API & Webhooks", icon: Webhook },
  { id: "documents", label: "Dokumente", icon: FileText },
  { id: "shop", label: "Shop", icon: Store },
  { id: "automation", label: "Automatisierung", icon: Zap },
  { id: "backup", label: "Backup & Export", icon: Download },
  { id: "audit", label: "Audit & Compliance", icon: ClipboardList },
  { id: "mobile", label: "Mobile & Offline", icon: Smartphone },
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

              <Separator />

              {/* Buchhaltungssoftware */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Buchhaltungssoftware
                </h3>
                
                <div className="grid gap-3">
                  {/* Bexio */}
                  <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00a3e0]/10">
                          <span className="text-lg font-bold text-[#00a3e0]">bx</span>
                        </div>
                        <div>
                          <p className="font-medium">Bexio</p>
                          <p className="text-sm text-muted-foreground">
                            Schweizer Cloud-Buchhaltung für KMU
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
                    <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Debitoren</Badge>
                      <Badge variant="secondary" className="text-xs">Kreditoren</Badge>
                      <Badge variant="secondary" className="text-xs">Rechnungen</Badge>
                      <Badge variant="secondary" className="text-xs">Produkte</Badge>
                    </div>
                  </div>

                  {/* Abacus */}
                  <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e30613]/10">
                          <span className="text-lg font-bold text-[#e30613]">A</span>
                        </div>
                        <div>
                          <p className="font-medium">Abacus</p>
                          <p className="text-sm text-muted-foreground">
                            Schweizer ERP & Finanzsoftware
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
                    <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Finanzbuchhaltung</Badge>
                      <Badge variant="secondary" className="text-xs">Lohnbuchhaltung</Badge>
                      <Badge variant="secondary" className="text-xs">AbaWeb</Badge>
                    </div>
                  </div>

                  {/* Sage */}
                  <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00dc00]/10">
                          <span className="text-lg font-bold text-[#00a651]">S</span>
                        </div>
                        <div>
                          <p className="font-medium">Sage 50 / Sage 200</p>
                          <p className="text-sm text-muted-foreground">
                            Buchhaltung & Warenwirtschaft
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
                    <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Debitoren</Badge>
                      <Badge variant="secondary" className="text-xs">Kreditoren</Badge>
                      <Badge variant="secondary" className="text-xs">Kontenplan</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Treuhänder Export */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Treuhänder-Export
                </h3>
                
                <div className="p-4 rounded-xl border border-border">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Export-Format</p>
                        <p className="text-sm text-muted-foreground">
                          Datenformat für den Treuhänder wählen
                        </p>
                      </div>
                      <Select defaultValue="datev">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="datev">DATEV (Standard)</SelectItem>
                          <SelectItem value="topal">Topal</SelectItem>
                          <SelectItem value="banana">Banana</SelectItem>
                          <SelectItem value="csv">CSV Universal</SelectItem>
                          <SelectItem value="xml">XML (ISO 20022)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Automatischer Export</p>
                        <p className="text-sm text-muted-foreground">
                          Monatlicher Export an Treuhänder senden
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="trusteeEmail">Treuhänder E-Mail</Label>
                        <Input id="trusteeEmail" type="email" placeholder="treuhänder@example.ch" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exportDay">Export-Tag</Label>
                        <Select defaultValue="5">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1. des Monats</SelectItem>
                            <SelectItem value="5">5. des Monats</SelectItem>
                            <SelectItem value="10">10. des Monats</SelectItem>
                            <SelectItem value="15">15. des Monats</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Vorschau Export
                      </Button>
                      <Button className="gap-2">
                        <Save className="h-4 w-4" />
                        Jetzt exportieren
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Export History */}
                <div className="p-4 rounded-xl border border-border">
                  <h4 className="font-medium mb-3">Letzte Exporte</h4>
                  <div className="space-y-2">
                    {[
                      { date: "31.12.2024", type: "DATEV", status: "success" },
                      { date: "30.11.2024", type: "DATEV", status: "success" },
                      { date: "31.10.2024", type: "DATEV", status: "success" },
                    ].map((exp, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="text-sm">{exp.date}</span>
                          <Badge variant="secondary" className="text-xs">{exp.type}</Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
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
                      Für die vollständige Integration mit Buchhaltungssoftware muss Lovable Cloud aktiviert werden. 
                      Dies ermöglicht OAuth-Authentifizierung und sichere API-Verbindungen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "shop" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Shop-Einstellungen</h2>
                <p className="text-sm text-muted-foreground">
                  Konfigurieren Sie Ihren Online-Shop
                </p>
              </div>

              <Separator />

              {/* Shop Status */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Shop-Status
                </h3>
                
                <div className="grid gap-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Shop aktivieren</p>
                        <p className="text-sm text-muted-foreground">
                          Online-Shop für Kunden sichtbar machen
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Wartungsmodus</p>
                        <p className="text-sm text-muted-foreground">
                          Shop vorübergehend deaktivieren für Updates
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Gastbestellungen erlauben</p>
                        <p className="text-sm text-muted-foreground">
                          Kunden können ohne Konto bestellen
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Shop-Informationen */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Shop-Informationen
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Shop-Name</Label>
                    <Input id="shopName" defaultValue="Loomora Shop" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopUrl">Shop-URL</Label>
                    <Input id="shopUrl" defaultValue="shop.loomora.ch" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopEmail">Kontakt-E-Mail</Label>
                    <Input id="shopEmail" type="email" defaultValue="shop@loomora.ch" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopPhone">Support-Telefon</Label>
                    <Input id="shopPhone" defaultValue="+41 44 123 45 67" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopDescription">Shop-Beschreibung</Label>
                  <Input id="shopDescription" defaultValue="Ihr Partner für hochwertige Metallbau-Produkte" />
                </div>
              </div>

              <Separator />

              {/* Versand */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Versandoptionen
                </h3>
                
                <div className="grid gap-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">Standardversand</p>
                        <p className="text-sm text-muted-foreground">
                          3-5 Werktage Lieferzeit
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Versandkosten (CHF)</Label>
                        <Input type="number" defaultValue="9.90" />
                      </div>
                      <div className="space-y-2">
                        <Label>Kostenlos ab (CHF)</Label>
                        <Input type="number" defaultValue="100" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">Expressversand</p>
                        <p className="text-sm text-muted-foreground">
                          1-2 Werktage Lieferzeit
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Versandkosten (CHF)</Label>
                        <Input type="number" defaultValue="19.90" />
                      </div>
                      <div className="space-y-2">
                        <Label>Kostenlos ab (CHF)</Label>
                        <Input type="number" defaultValue="250" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Selbstabholung</p>
                        <p className="text-sm text-muted-foreground">
                          Abholung vor Ort im Lager
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Zahlungsmethoden */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Zahlungsmethoden
                </h3>
                
                <div className="grid gap-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6772e5]/10">
                          <CreditCard className="h-5 w-5 text-[#6772e5]" />
                        </div>
                        <div>
                          <p className="font-medium">Kreditkarte</p>
                          <p className="text-sm text-muted-foreground">
                            Visa, Mastercard, American Express
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff5f00]/10">
                          <span className="text-lg font-bold text-[#ff5f00]">T</span>
                        </div>
                        <div>
                          <p className="font-medium">TWINT</p>
                          <p className="text-sm text-muted-foreground">
                            Schweizer Mobile Payment
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#003087]/10">
                          <span className="text-sm font-bold text-[#003087]">PP</span>
                        </div>
                        <div>
                          <p className="font-medium">PayPal</p>
                          <p className="text-sm text-muted-foreground">
                            Online-Zahlungsdienst
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Rechnung</p>
                          <p className="text-sm text-muted-foreground">
                            Zahlung per Rechnung (30 Tage)
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Produkt-Einstellungen */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produkt-Einstellungen
                </h3>
                
                <div className="grid gap-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Lagerbestand anzeigen</p>
                        <p className="text-sm text-muted-foreground">
                          Verfügbarkeit im Shop anzeigen
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bei Ausverkauf bestellen</p>
                        <p className="text-sm text-muted-foreground">
                          Bestellung auch bei 0 Lagerbestand
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bewertungen aktivieren</p>
                        <p className="text-sm text-muted-foreground">
                          Kunden können Produkte bewerten
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Produkte pro Seite</p>
                        <p className="text-sm text-muted-foreground">
                          Anzahl der Produkte in der Übersicht
                        </p>
                      </div>
                      <Select defaultValue="24">
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12</SelectItem>
                          <SelectItem value="24">24</SelectItem>
                          <SelectItem value="48">48</SelectItem>
                          <SelectItem value="96">96</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Rabatte & Gutscheine */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Rabatte & Gutscheine
                </h3>
                
                <div className="grid gap-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Gutschein-System</p>
                        <p className="text-sm text-muted-foreground">
                          Rabattcodes im Shop aktivieren
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Mengenrabatte</p>
                        <p className="text-sm text-muted-foreground">
                          Automatische Rabatte bei Grossbestellungen
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Neukunden-Rabatt (%)</p>
                        <p className="text-sm text-muted-foreground">
                          Rabatt für Erstbestellungen
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" className="w-20" defaultValue="10" />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SEO & Marketing */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  SEO & Marketing
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta-Titel</Label>
                    <Input id="metaTitle" defaultValue="Loomora Shop - Metallbau Produkte" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Meta-Keywords</Label>
                    <Input id="metaKeywords" defaultValue="Metallbau, Stahl, Geländer, Treppen" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta-Beschreibung</Label>
                  <Input id="metaDescription" defaultValue="Hochwertige Metallbau-Produkte online kaufen. Geländer, Treppen, Stahlkonstruktionen und mehr." />
                </div>

                <div className="grid gap-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Google Analytics</p>
                        <p className="text-sm text-muted-foreground">
                          Shop-Statistiken tracken
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Facebook Pixel</p>
                        <p className="text-sm text-muted-foreground">
                          Conversions für Werbung tracken
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Shop-Einstellungen speichern
              </Button>
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

          {activeSection === "email" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">E-Mail Konfiguration</h2>
                <p className="text-sm text-muted-foreground">
                  SMTP-Server und E-Mail-Einstellungen konfigurieren
                </p>
              </div>

              <Separator />

              {/* SMTP Server */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  SMTP-Server Einstellungen
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP-Host</Label>
                    <Input id="smtpHost" placeholder="smtp.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP-Port</Label>
                    <Select defaultValue="587">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 (Unverschlüsselt)</SelectItem>
                        <SelectItem value="465">465 (SSL/TLS)</SelectItem>
                        <SelectItem value="587">587 (STARTTLS)</SelectItem>
                        <SelectItem value="2525">2525 (Alternativ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">Benutzername</Label>
                    <Input id="smtpUser" placeholder="benutzer@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">Passwort</Label>
                    <Input id="smtpPassword" type="password" placeholder="••••••••" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SSL/TLS verwenden</p>
                      <p className="text-sm text-muted-foreground">
                        Verschlüsselte Verbindung zum SMTP-Server
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMTP-Authentifizierung</p>
                      <p className="text-sm text-muted-foreground">
                        Anmeldung beim SMTP-Server erforderlich
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              {/* IMAP Server */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  IMAP-Server Einstellungen (Posteingang)
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="imapHost">IMAP-Host</Label>
                    <Input id="imapHost" placeholder="imap.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imapPort">IMAP-Port</Label>
                    <Select defaultValue="993">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="143">143 (Unverschlüsselt)</SelectItem>
                        <SelectItem value="993">993 (SSL/TLS)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imapUser">Benutzername</Label>
                    <Input id="imapUser" placeholder="benutzer@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imapPassword">Passwort</Label>
                    <Input id="imapPassword" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Absender-Einstellungen */}
              <div className="space-y-4">
                <h3 className="font-medium">Absender-Einstellungen</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emailSenderName">Absender-Name</Label>
                    <Input id="emailSenderName" defaultValue="Loomora Metallbau AG" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailSenderAddress">Absender-Adresse</Label>
                    <Input id="emailSenderAddress" type="email" defaultValue="info@loomora.ch" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailReplyTo">Antwort-Adresse (Reply-To)</Label>
                    <Input id="emailReplyTo" type="email" defaultValue="support@loomora.ch" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailBcc">BCC-Adresse (optional)</Label>
                    <Input id="emailBcc" type="email" placeholder="archiv@loomora.ch" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* E-Mail Vorlagen */}
              <div className="space-y-4">
                <h3 className="font-medium">E-Mail Vorlagen & Signatur</h3>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">HTML-E-Mails aktivieren</p>
                      <p className="text-sm text-muted-foreground">
                        E-Mails mit HTML-Formatierung versenden
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Firmen-Signatur anhängen</p>
                      <p className="text-sm text-muted-foreground">
                        Automatische Signatur an alle E-Mails
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Firmenlogo in E-Mails</p>
                      <p className="text-sm text-muted-foreground">
                        Logo in der E-Mail-Kopfzeile anzeigen
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Erweiterte Einstellungen */}
              <div className="space-y-4">
                <h3 className="font-medium">Erweiterte Einstellungen</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Timeout (Sekunden)</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 Sekunden</SelectItem>
                        <SelectItem value="30">30 Sekunden</SelectItem>
                        <SelectItem value="60">60 Sekunden</SelectItem>
                        <SelectItem value="120">120 Sekunden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max. Anhangsgrösse</Label>
                    <Select defaultValue="25">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 MB</SelectItem>
                        <SelectItem value="25">25 MB</SelectItem>
                        <SelectItem value="50">50 MB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Debug-Modus</p>
                      <p className="text-sm text-muted-foreground">
                        Detaillierte E-Mail-Logs für Fehleranalyse
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Konfiguration speichern
                </Button>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Verbindung testen
                </Button>
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Test-E-Mail senden
                </Button>
              </div>
            </div>
          )}

          {activeSection === "calendar" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Kalender & Kontakte</h2>
                <p className="text-sm text-muted-foreground">
                  CalDAV/CardDAV-Synchronisation mit externen Diensten
                </p>
              </div>

              <Separator />

              {/* CalDAV */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  CalDAV-Server (Kalender)
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>CalDAV-URL</Label>
                    <Input placeholder="https://calendar.example.com/caldav" />
                  </div>
                  <div className="space-y-2">
                    <Label>Benutzername</Label>
                    <Input placeholder="benutzer@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Passwort</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Kalender-Name</Label>
                    <Input defaultValue="Loomora Kalender" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">CalDAV-Sync aktivieren</p>
                      <p className="text-sm text-muted-foreground">
                        Termine mit externem CalDAV-Server synchronisieren
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bidirektionale Sync</p>
                        <p className="text-sm text-muted-foreground">Änderungen in beide Richtungen</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Erinnerungen sync</p>
                        <p className="text-sm text-muted-foreground">Alarm-Einstellungen übernehmen</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* CardDAV */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Contact className="h-5 w-5" />
                  CardDAV-Server (Kontakte)
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>CardDAV-URL</Label>
                    <Input placeholder="https://contacts.example.com/carddav" />
                  </div>
                  <div className="space-y-2">
                    <Label>Benutzername</Label>
                    <Input placeholder="benutzer@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Passwort</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Adressbuch-Name</Label>
                    <Input defaultValue="Loomora Kontakte" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">CardDAV-Sync aktivieren</p>
                      <p className="text-sm text-muted-foreground">
                        Kontakte mit externem CardDAV-Server synchronisieren
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sync-Richtung</p>
                      <p className="text-sm text-muted-foreground">Welche Kontakte synchronisieren?</p>
                    </div>
                    <Select defaultValue="both">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Kunden & Lieferanten</SelectItem>
                        <SelectItem value="customers">Nur Kunden</SelectItem>
                        <SelectItem value="suppliers">Nur Lieferanten</SelectItem>
                        <SelectItem value="all">Alle Kontakte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sync-Einstellungen */}
              <div className="space-y-4">
                <h3 className="font-medium">Synchronisations-Einstellungen</h3>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sync-Intervall</p>
                      <p className="text-sm text-muted-foreground">Wie oft synchronisieren?</p>
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
                        <SelectItem value="manual">Manuell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Konflikt-Behandlung</p>
                      <p className="text-sm text-muted-foreground">Bei Sync-Konflikten</p>
                    </div>
                    <Select defaultValue="server">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="server">Server gewinnt</SelectItem>
                        <SelectItem value="local">Lokal gewinnt</SelectItem>
                        <SelectItem value="newest">Neuere gewinnt</SelectItem>
                        <SelectItem value="ask">Immer fragen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Konfiguration speichern
                </Button>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Jetzt synchronisieren
                </Button>
              </div>
            </div>
          )}

          {activeSection === "api" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">API & Webhooks</h2>
                <p className="text-sm text-muted-foreground">
                  API-Schlüssel und Webhook-Endpunkte verwalten
                </p>
              </div>

              <Separator />

              {/* API Keys */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API-Schlüssel
                  </h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Neuer Schlüssel
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Produktiv-API</p>
                          <Badge>Aktiv</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Erstellt am 15.01.2024</p>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">lmra_prod_****************************</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Test-API</p>
                          <Badge variant="secondary">Test</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Erstellt am 10.01.2024</p>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">lmra_test_****************************</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Webhooks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhooks
                  </h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Neuer Webhook
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Rechnung erstellt</p>
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Aktiv
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          POST https://api.example.com/webhooks/invoice
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">invoice.created</Badge>
                          <Badge variant="secondary">invoice.paid</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Bestellung eingegangen</p>
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Aktiv
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          POST https://api.example.com/webhooks/order
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">order.created</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <h4 className="font-medium mb-2">Verfügbare Events</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">customer.created</Badge>
                    <Badge variant="outline">customer.updated</Badge>
                    <Badge variant="outline">invoice.created</Badge>
                    <Badge variant="outline">invoice.paid</Badge>
                    <Badge variant="outline">order.created</Badge>
                    <Badge variant="outline">order.shipped</Badge>
                    <Badge variant="outline">product.updated</Badge>
                    <Badge variant="outline">payment.received</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* API-Einstellungen */}
              <div className="space-y-4">
                <h3 className="font-medium">API-Einstellungen</h3>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Rate Limiting</p>
                      <p className="text-sm text-muted-foreground">Max. Anfragen pro Minute</p>
                    </div>
                    <Select defaultValue="100">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60 / Min.</SelectItem>
                        <SelectItem value="100">100 / Min.</SelectItem>
                        <SelectItem value="500">500 / Min.</SelectItem>
                        <SelectItem value="unlimited">Unbegrenzt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API-Logging aktivieren</p>
                      <p className="text-sm text-muted-foreground">Alle API-Aufrufe protokollieren</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Einstellungen speichern
              </Button>
            </div>
          )}

          {activeSection === "documents" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Dokumente & Vorlagen</h2>
                <p className="text-sm text-muted-foreground">
                  PDF-Vorlagen, Nummernkreise und Briefpapier konfigurieren
                </p>
              </div>

              <Separator />

              {/* Nummernkreise */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Nummernkreise
                </h3>

                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-3 p-4 rounded-xl border border-border">
                    <div className="space-y-2">
                      <Label>Rechnungen</Label>
                      <div className="flex gap-2">
                        <Input defaultValue="RE-" className="w-20" />
                        <Input defaultValue="2024" className="w-20" />
                        <Input defaultValue="0001" className="flex-1" />
                      </div>
                      <p className="text-xs text-muted-foreground">Vorschau: RE-2024-0001</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Angebote</Label>
                      <div className="flex gap-2">
                        <Input defaultValue="AN-" className="w-20" />
                        <Input defaultValue="2024" className="w-20" />
                        <Input defaultValue="0001" className="flex-1" />
                      </div>
                      <p className="text-xs text-muted-foreground">Vorschau: AN-2024-0001</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Aufträge</Label>
                      <div className="flex gap-2">
                        <Input defaultValue="AU-" className="w-20" />
                        <Input defaultValue="2024" className="w-20" />
                        <Input defaultValue="0001" className="flex-1" />
                      </div>
                      <p className="text-xs text-muted-foreground">Vorschau: AU-2024-0001</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 p-4 rounded-xl border border-border">
                    <div className="space-y-2">
                      <Label>Lieferscheine</Label>
                      <div className="flex gap-2">
                        <Input defaultValue="LS-" className="w-20" />
                        <Input defaultValue="2024" className="w-20" />
                        <Input defaultValue="0001" className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gutschriften</Label>
                      <div className="flex gap-2">
                        <Input defaultValue="GS-" className="w-20" />
                        <Input defaultValue="2024" className="w-20" />
                        <Input defaultValue="0001" className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Bestellungen</Label>
                      <div className="flex gap-2">
                        <Input defaultValue="BE-" className="w-20" />
                        <Input defaultValue="2024" className="w-20" />
                        <Input defaultValue="0001" className="flex-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatischer Jahreswechsel</p>
                      <p className="text-sm text-muted-foreground">
                        Nummernkreise am 01.01. zurücksetzen
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Briefpapier */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Briefpapier & Design
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border border-border space-y-3">
                    <Label>Logo-Position</Label>
                    <Select defaultValue="top-left">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Oben links</SelectItem>
                        <SelectItem value="top-center">Oben mittig</SelectItem>
                        <SelectItem value="top-right">Oben rechts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 rounded-xl border border-border space-y-3">
                    <Label>Kopfzeilen-Hintergrund</Label>
                    <Input type="color" defaultValue="#1a1a2e" className="h-10 w-full" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Fusszeile (links)</Label>
                    <Textarea defaultValue="Loomora Metallbau AG | Industriestrasse 15 | 8005 Zürich" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fusszeile (rechts)</Label>
                    <Textarea defaultValue="IBAN: CH93 0076 2011 6238 5295 7 | MWST: CHE-123.456.789" rows={2} />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">QR-Rechnung aktivieren</p>
                      <p className="text-sm text-muted-foreground">Swiss QR-Code auf Rechnungen</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              {/* PDF-Einstellungen */}
              <div className="space-y-4">
                <h3 className="font-medium">PDF-Einstellungen</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">PDF/A-Format</p>
                        <p className="text-sm text-muted-foreground">Archivierungsformat</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Digitale Signatur</p>
                        <p className="text-sm text-muted-foreground">PDFs signieren</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Einstellungen speichern
              </Button>
            </div>
          )}

          {activeSection === "automation" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Automatisierung & Workflows</h2>
                <p className="text-sm text-muted-foreground">
                  Automatische Aktionen und Workflow-Regeln konfigurieren
                </p>
              </div>

              <Separator />

              {/* E-Mail-Automatisierung */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  E-Mail-Automatisierung
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Zahlungserinnerungen</p>
                        <p className="text-sm text-muted-foreground">Automatische Mahnungen senden</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="mt-3 pt-3 border-t border-border grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs">1. Mahnung nach</Label>
                        <Select defaultValue="14">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 Tagen</SelectItem>
                            <SelectItem value="14">14 Tagen</SelectItem>
                            <SelectItem value="30">30 Tagen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">2. Mahnung nach</Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="21">21 Tagen</SelectItem>
                            <SelectItem value="30">30 Tagen</SelectItem>
                            <SelectItem value="45">45 Tagen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">3. Mahnung nach</Label>
                        <Select defaultValue="45">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="45">45 Tagen</SelectItem>
                            <SelectItem value="60">60 Tagen</SelectItem>
                            <SelectItem value="90">90 Tagen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auftragsbestätigung</p>
                        <p className="text-sm text-muted-foreground">Bei neuer Bestellung automatisch senden</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Lieferbenachrichtigung</p>
                        <p className="text-sm text-muted-foreground">Kunden bei Versand informieren</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Aufgaben-Automatisierung */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Aufgaben & Eskalation
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Zuweisung</p>
                        <p className="text-sm text-muted-foreground">Neue Leads automatisch zuweisen</p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Überfällige Aufgaben eskalieren</p>
                        <p className="text-sm text-muted-foreground">Vorgesetzten nach X Tagen informieren</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select defaultValue="3">
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Tag</SelectItem>
                            <SelectItem value="3">3 Tage</SelectItem>
                            <SelectItem value="7">7 Tage</SelectItem>
                          </SelectContent>
                        </Select>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Follow-up Erinnerungen</p>
                        <p className="text-sm text-muted-foreground">Automatische Nachfass-Aufgaben</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Lager-Automatisierung */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Lager & Bestand
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Mindestbestand-Warnung</p>
                        <p className="text-sm text-muted-foreground">Bei Unterschreitung benachrichtigen</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Nachbestellung</p>
                        <p className="text-sm text-muted-foreground">Bestellung automatisch erstellen</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Einstellungen speichern
              </Button>
            </div>
          )}

          {activeSection === "backup" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Backup & Export</h2>
                <p className="text-sm text-muted-foreground">
                  Datensicherung und Export-Optionen konfigurieren
                </p>
              </div>

              <Separator />

              {/* Automatische Backups */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Automatische Backups
                </h3>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatische Backups aktivieren</p>
                      <p className="text-sm text-muted-foreground">Regelmässige Datensicherung</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Backup-Intervall</p>
                        <p className="text-sm text-muted-foreground">Wie oft sichern?</p>
                      </div>
                      <Select defaultValue="daily">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Stündlich</SelectItem>
                          <SelectItem value="daily">Täglich</SelectItem>
                          <SelectItem value="weekly">Wöchentlich</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Aufbewahrung</p>
                        <p className="text-sm text-muted-foreground">Wie lange behalten?</p>
                      </div>
                      <Select defaultValue="90">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 Tage</SelectItem>
                          <SelectItem value="90">90 Tage</SelectItem>
                          <SelectItem value="365">1 Jahr</SelectItem>
                          <SelectItem value="forever">Unbegrenzt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Letztes Backup</p>
                      <p className="text-sm text-muted-foreground">01.02.2024 um 03:00 Uhr</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Erfolgreich
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Manueller Export */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Daten-Export
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border border-border space-y-3">
                    <p className="font-medium">Export-Format</p>
                    <Select defaultValue="csv">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV (Excel-kompatibel)</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 rounded-xl border border-border space-y-3">
                    <p className="font-medium">Daten auswählen</p>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Daten</SelectItem>
                        <SelectItem value="customers">Nur Kunden</SelectItem>
                        <SelectItem value="invoices">Nur Rechnungen</SelectItem>
                        <SelectItem value="products">Nur Produkte</SelectItem>
                        <SelectItem value="orders">Nur Aufträge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Export starten
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Daten importieren
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Cloud-Speicher */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <FolderSync className="h-5 w-5" />
                  Cloud-Speicher (Backup-Ziel)
                </h3>

                <div className="grid gap-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Lokaler Server</p>
                          <p className="text-sm text-muted-foreground">Auf eigenem Server speichern</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0061ff]/10">
                          <span className="text-sm font-bold text-[#0061ff]">S3</span>
                        </div>
                        <div>
                          <p className="font-medium">Amazon S3 / Wasabi</p>
                          <p className="text-sm text-muted-foreground">Cloud-Objektspeicher</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Verbinden</Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Einstellungen speichern
              </Button>
            </div>
          )}

          {activeSection === "audit" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Audit & Compliance</h2>
                <p className="text-sm text-muted-foreground">
                  Protokollierung, Aufbewahrung und Datenschutz
                </p>
              </div>

              <Separator />

              {/* Audit-Logging */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Audit-Protokollierung
                </h3>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Vollständiges Audit-Logging</p>
                      <p className="text-sm text-muted-foreground">Alle Änderungen protokollieren</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Benutzer-Aktivitäten</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Datenänderungen</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Login-Versuche</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">API-Zugriffe</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Log-Aufbewahrung</p>
                      <p className="text-sm text-muted-foreground">Revisionssicher (Schweizer Recht: 10 Jahre)</p>
                    </div>
                    <Select defaultValue="10y">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1y">1 Jahr</SelectItem>
                        <SelectItem value="5y">5 Jahre</SelectItem>
                        <SelectItem value="10y">10 Jahre</SelectItem>
                        <SelectItem value="forever">Unbegrenzt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Datenschutz */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Datenschutz (DSGVO / DSG)
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cookie-Banner aktivieren</p>
                        <p className="text-sm text-muted-foreground">Für Shop und Kundenportal</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Datenlöschung auf Anfrage</p>
                        <p className="text-sm text-muted-foreground">"Recht auf Vergessenwerden"</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Datenexport für Kunden</p>
                        <p className="text-sm text-muted-foreground">Portabilität ermöglichen</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Anonymisierung</p>
                        <p className="text-sm text-muted-foreground">Inaktive Kundendaten nach X Jahren</p>
                      </div>
                      <Select defaultValue="5">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Jahre</SelectItem>
                          <SelectItem value="5">5 Jahre</SelectItem>
                          <SelectItem value="7">7 Jahre</SelectItem>
                          <SelectItem value="never">Nie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Compliance-Berichte */}
              <div className="space-y-4">
                <h3 className="font-medium">Compliance-Berichte</h3>

                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Audit-Bericht generieren
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    DSGVO-Dokumentation
                  </Button>
                </div>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Einstellungen speichern
              </Button>
            </div>
          )}

          {activeSection === "mobile" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Mobile & Offline</h2>
                <p className="text-sm text-muted-foreground">
                  Mobile App und Offline-Funktionen konfigurieren
                </p>
              </div>

              <Separator />

              {/* Push-Benachrichtigungen */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Push-Benachrichtigungen
                </h3>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push-Benachrichtigungen aktivieren</p>
                      <p className="text-sm text-muted-foreground">Auf mobilen Geräten</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Neue Aufträge</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Zahlungseingänge</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Aufgaben-Erinnerungen</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Chat-Nachrichten</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ruhezeiten</p>
                      <p className="text-sm text-muted-foreground">Keine Push zwischen</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="time" defaultValue="22:00" className="w-[100px]" />
                      <span>-</span>
                      <Input type="time" defaultValue="07:00" className="w-[100px]" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Offline-Modus */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <WifiOff className="h-5 w-5" />
                  Offline-Modus
                </h3>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Offline-Modus aktivieren</p>
                      <p className="text-sm text-muted-foreground">Arbeiten ohne Internetverbindung</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Offline verfügbare Daten:</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="p-4 rounded-xl border border-border">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Kundendaten</p>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-border">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Produktkatalog</p>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-border">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Aufträge</p>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-border">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Dokumente</p>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Max. Offline-Speicher</p>
                      <p className="text-sm text-muted-foreground">Lokaler Speicherplatz begrenzen</p>
                    </div>
                    <Select defaultValue="500">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 MB</SelectItem>
                        <SelectItem value="500">500 MB</SelectItem>
                        <SelectItem value="1000">1 GB</SelectItem>
                        <SelectItem value="unlimited">Unbegrenzt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Aktueller Offline-Speicher</p>
                      <p className="text-sm text-muted-foreground">Belegter lokaler Speicher</p>
                    </div>
                    <p className="font-medium">127 MB / 500 MB</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sync-Einstellungen */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Synchronisation
                </h3>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-Sync bei Verbindung</p>
                      <p className="text-sm text-muted-foreground">Automatisch synchronisieren</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nur bei WLAN synchronisieren</p>
                      <p className="text-sm text-muted-foreground">Mobile Daten schonen</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Einstellungen speichern
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
