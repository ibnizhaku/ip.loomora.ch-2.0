import { useState } from "react";
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Users,
  Building2,
  Calendar,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface SwissdecSubmission {
  id: string;
  type: "monthly" | "annual" | "entry" | "exit";
  period: string;
  employeeCount: number;
  totalSalary: number;
  status: "draft" | "validating" | "ready" | "submitted" | "confirmed" | "error";
  submittedAt?: string;
  confirmedAt?: string;
  errors?: string[];
}

const submissions: SwissdecSubmission[] = [
  {
    id: "1",
    type: "monthly",
    period: "Januar 2024",
    employeeCount: 12,
    totalSalary: 98500,
    status: "confirmed",
    submittedAt: "31.01.2024 14:23",
    confirmedAt: "31.01.2024 14:25",
  },
  {
    id: "2",
    type: "monthly",
    period: "Dezember 2023",
    employeeCount: 11,
    totalSalary: 94200,
    status: "confirmed",
    submittedAt: "29.12.2023 16:45",
    confirmedAt: "29.12.2023 16:48",
  },
  {
    id: "3",
    type: "annual",
    period: "2023",
    employeeCount: 15,
    totalSalary: 1125000,
    status: "submitted",
    submittedAt: "15.01.2024 09:30",
  },
  {
    id: "4",
    type: "entry",
    period: "Februar 2024",
    employeeCount: 1,
    totalSalary: 6200,
    status: "ready",
  },
  {
    id: "5",
    type: "monthly",
    period: "Februar 2024",
    employeeCount: 13,
    totalSalary: 104700,
    status: "draft",
  },
];

const typeLabels = {
  monthly: "Monatsmeldung",
  annual: "Jahresmeldung",
  entry: "Eintritt",
  exit: "Austritt",
};

const typeStyles = {
  monthly: "bg-primary/10 text-primary",
  annual: "bg-info/10 text-info",
  entry: "bg-success/10 text-success",
  exit: "bg-warning/10 text-warning",
};

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  validating: "bg-info/10 text-info",
  ready: "bg-warning/10 text-warning",
  submitted: "bg-primary/10 text-primary",
  confirmed: "bg-success/10 text-success",
  error: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  draft: "Entwurf",
  validating: "Validierung...",
  ready: "Bereit",
  submitted: "Gesendet",
  confirmed: "Bestätigt",
  error: "Fehler",
};

export default function Swissdec() {
  const [activeTab, setActiveTab] = useState("submissions");

  const confirmedSubmissions = submissions.filter((s) => s.status === "confirmed").length;
  const pendingSubmissions = submissions.filter((s) => s.status === "ready" || s.status === "draft").length;
  const totalEmployees = 13; // Current active employees

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Swissdec / ELM
          </h1>
          <p className="text-muted-foreground">
            Elektronische Lohnmeldung an Behörden und Versicherungen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            XML Export
          </Button>
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Meldung erstellen
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <Building2 className="h-5 w-5 text-info" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-info">Swissdec 5.0 Standard</h3>
            <p className="text-sm text-muted-foreground">
              Automatische Übermittlung an AHV-Ausgleichskasse, Pensionskasse, UVG, KTG und Steuerbehörden.
              Alle Meldungen werden verschlüsselt übertragen.
            </p>
          </div>
          <Badge className="bg-success/10 text-success">Zertifiziert</Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mitarbeiter</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bestätigt</p>
              <p className="text-2xl font-bold text-success">{confirmedSubmissions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausstehend</p>
              <p className="text-2xl font-bold text-warning">{pendingSubmissions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Calendar className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nächste Frist</p>
              <p className="text-2xl font-bold">28.02.</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="submissions">Meldungen</TabsTrigger>
          <TabsTrigger value="recipients">Empfänger</TabsTrigger>
          <TabsTrigger value="certificates">Zertifikate</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-6 space-y-4">
          {submissions.map((sub, index) => (
            <div
              key={sub.id}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{sub.period}</h3>
                      <Badge className={typeStyles[sub.type]}>
                        {typeLabels[sub.type]}
                      </Badge>
                      <Badge className={statusStyles[sub.status]}>
                        {statusLabels[sub.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sub.employeeCount} Mitarbeiter • CHF {sub.totalSalary.toLocaleString()} Lohnsumme
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {sub.submittedAt && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Gesendet</p>
                      <p className="text-sm font-mono">{sub.submittedAt}</p>
                    </div>
                  )}
                  {sub.confirmedAt && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Bestätigt</p>
                      <p className="text-sm font-mono">{sub.confirmedAt}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {sub.status === "ready" && (
                      <Button size="sm" className="gap-2">
                        <Send className="h-4 w-4" />
                        Senden
                      </Button>
                    )}
                    {sub.status === "draft" && (
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Validieren
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {sub.status === "validating" && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <Progress value={65} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">Validierung läuft...</span>
                  </div>
                </div>
              )}

              {sub.errors && sub.errors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <div className="text-sm">
                      {sub.errors.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="recipients" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Konfigurierte Empfänger</h3>
            <div className="space-y-4">
              {[
                { name: "AHV-Ausgleichskasse Zürich", type: "AHV/IV/EO", status: "active" },
                { name: "Pensionskasse Metallbau", type: "BVG", status: "active" },
                { name: "Suva", type: "UVG", status: "active" },
                { name: "Helsana", type: "KTG", status: "active" },
                { name: "Kantonales Steueramt Zürich", type: "QST", status: "active" },
              ].map((recipient, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{recipient.name}</p>
                      <p className="text-sm text-muted-foreground">{recipient.type}</p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success">Verbunden</Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Swissdec Zertifikate</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Transmitter-Zertifikat</p>
                  <p className="text-sm text-muted-foreground">Gültig bis: 31.12.2025</p>
                </div>
                <Badge className="bg-success/10 text-success">Gültig</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Distributor-Zertifikat</p>
                  <p className="text-sm text-muted-foreground">Swissdec AG</p>
                </div>
                <Badge className="bg-success/10 text-success">Aktiv</Badge>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
