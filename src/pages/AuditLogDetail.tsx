import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, User, Clock, FileText, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const auditEntry = {
  id: "audit-2024-0892",
  timestamp: "02.02.2024 14:32:15",
  user: {
    name: "Anna Schmidt",
    email: "anna.schmidt@example.com",
    role: "Buchhaltung",
  },
  action: "UPDATE",
  module: "Rechnungen",
  entity: {
    type: "Rechnung",
    id: "RE-2024-089",
    name: "Rechnung RE-2024-089",
  },
  ipAddress: "192.168.1.105",
  userAgent: "Chrome 121.0 / Windows 10",
  changes: [
    { field: "Status", oldValue: "Entwurf", newValue: "Gesendet" },
    { field: "Gesendet am", oldValue: "-", newValue: "02.02.2024" },
    { field: "Fällig am", oldValue: "15.02.2024", newValue: "28.02.2024" },
  ],
  description: "Rechnung wurde an Kunden versendet und Fälligkeitsdatum angepasst",
};

const actionStyles: Record<string, string> = {
  CREATE: "bg-success/10 text-success",
  UPDATE: "bg-info/10 text-info",
  DELETE: "bg-destructive/10 text-destructive",
  LOGIN: "bg-primary/10 text-primary",
  LOGOUT: "bg-muted text-muted-foreground",
  EXPORT: "bg-warning/10 text-warning",
};

const actionLabels: Record<string, string> = {
  CREATE: "Erstellt",
  UPDATE: "Geändert",
  DELETE: "Gelöscht",
  LOGIN: "Anmeldung",
  LOGOUT: "Abmeldung",
  EXPORT: "Export",
};

export default function AuditLogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold">Audit-Eintrag {auditEntry.id}</h1>
              <p className="text-muted-foreground">{auditEntry.timestamp}</p>
            </div>
          </div>
        </div>
        <Badge className={cn("text-base px-4 py-1", actionStyles[auditEntry.action])}>
          {actionLabels[auditEntry.action]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Änderungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{auditEntry.description}</p>
              
              {auditEntry.changes.length > 0 ? (
                <div className="space-y-4">
                  {auditEntry.changes.map((change, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{change.field}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-sm text-muted-foreground">Vorher</p>
                          <p className="font-mono font-medium">{change.oldValue}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 p-3 rounded-lg bg-success/10 border border-success/20">
                          <p className="text-sm text-muted-foreground">Nachher</p>
                          <p className="font-mono font-medium">{change.newValue}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Keine Feldänderungen protokolliert.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Betroffenes Objekt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">{auditEntry.entity.type}</p>
                  <p className="font-medium">{auditEntry.entity.name}</p>
                  <p className="text-sm font-mono text-muted-foreground">{auditEntry.entity.id}</p>
                </div>
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Öffnen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Benutzer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{auditEntry.user.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">E-Mail</p>
                <p className="font-medium">{auditEntry.user.email}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Rolle</p>
                <Badge variant="outline">{auditEntry.user.role}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Technische Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Zeitstempel</p>
                <p className="font-mono text-sm">{auditEntry.timestamp}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">IP-Adresse</p>
                <p className="font-mono text-sm">{auditEntry.ipAddress}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Browser / System</p>
                <p className="font-mono text-sm">{auditEntry.userAgent}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Modul</p>
                <Badge variant="outline">{auditEntry.module}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
