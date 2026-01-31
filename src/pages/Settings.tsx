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
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "profile", label: "Profil", icon: User },
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
