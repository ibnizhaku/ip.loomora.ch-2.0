import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle, Clock, AlertTriangle, Info, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const notificationData = {
  id: "1",
  title: "Neue Rechnung eingegangen",
  message: "Eine neue Eingangsrechnung von Software AG über CHF 2'500.00 wurde hochgeladen und wartet auf Ihre Freigabe. Die Rechnung bezieht sich auf den Wartungsvertrag für das ERP-System.",
  type: "info" as const,
  category: "Finanzen",
  createdAt: "02.02.2024 14:30",
  read: false,
  priority: "normal" as const,
  actionUrl: "/purchase-invoices/ER-2024-044",
  actionLabel: "Rechnung ansehen",
  sender: "System",
  relatedEntity: {
    type: "Eingangsrechnung",
    reference: "ER-2024-044",
  },
};

const typeStyles = {
  info: { bg: "bg-info/10", text: "text-info", icon: Info },
  warning: { bg: "bg-warning/10", text: "text-warning", icon: AlertTriangle },
  success: { bg: "bg-success/10", text: "text-success", icon: CheckCircle },
  error: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertTriangle },
};

const priorityStyles = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

const priorityLabels = {
  low: "Niedrig",
  normal: "Normal",
  high: "Hoch",
  urgent: "Dringend",
};

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const TypeIcon = typeStyles[notificationData.type].icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", typeStyles[notificationData.type].bg)}>
              <TypeIcon className={cn("h-5 w-5", typeStyles[notificationData.type].text)} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{notificationData.title}</h1>
              <p className="text-muted-foreground">{notificationData.createdAt}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!notificationData.read && (
            <Button variant="outline" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Als gelesen markieren
            </Button>
          )}
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Nachricht
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{notificationData.message}</p>
              
              {notificationData.actionUrl && (
                <div className="mt-6">
                  <Button className="gap-2" onClick={() => navigate(notificationData.actionUrl)}>
                    <ExternalLink className="h-4 w-4" />
                    {notificationData.actionLabel}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {notificationData.relatedEntity && (
            <Card>
              <CardHeader>
                <CardTitle>Verknüpftes Element</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">{notificationData.relatedEntity.type}</p>
                    <p className="font-medium">{notificationData.relatedEntity.reference}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Öffnen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={notificationData.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}>
                  {notificationData.read ? "Gelesen" : "Ungelesen"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Priorität</span>
                <Badge className={priorityStyles[notificationData.priority]}>
                  {priorityLabels[notificationData.priority]}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kategorie</span>
                <span className="font-medium">{notificationData.category}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Absender</span>
                <span className="font-medium">{notificationData.sender}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Empfangen</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{notificationData.createdAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Bell className="h-4 w-4" />
                Stumm schalten
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Löschen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
