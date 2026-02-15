import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle, Clock, AlertTriangle, Info, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useMarkNotificationAsRead, useDeleteNotification } from "@/hooks/use-notifications";

const typeStyles: Record<string, { bg: string; text: string; icon: any }> = {
  info: { bg: "bg-info/10", text: "text-info", icon: Info },
  warning: { bg: "bg-warning/10", text: "text-warning", icon: AlertTriangle },
  success: { bg: "bg-success/10", text: "text-success", icon: CheckCircle },
  error: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertTriangle },
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleString("de-CH"); } catch { return d; }
}

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, isLoading, error } = useQuery({
    queryKey: ['notifications', id],
    queryFn: () => api.get(`/notifications/${id}`),
    enabled: !!id,
  });
  const markRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error || !raw) return <div className="flex flex-col items-center justify-center h-64 text-muted-foreground"><p>Benachrichtigung nicht gefunden</p><Button variant="link" onClick={() => navigate(-1)}>Zurück</Button></div>;

  const n = raw as any;
  const typeStyle = typeStyles[n.type] || typeStyles.info;
  const TypeIcon = typeStyle.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", typeStyle.bg)}>
              <TypeIcon className={cn("h-5 w-5", typeStyle.text)} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{n.title}</h1>
              <p className="text-muted-foreground">{formatDate(n.time || n.createdAt)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!n.read && (
            <Button variant="outline" className="gap-2" onClick={() => { markRead.mutate(id || ''); toast.success("Als gelesen markiert"); }}>
              <CheckCircle className="h-4 w-4" />
              Als gelesen markieren
            </Button>
          )}
          <Button variant="destructive" size="icon" onClick={() => { deleteNotification.mutate(id || ''); toast.success("Gelöscht"); navigate(-1); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Nachricht</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{n.message}</p>
              {n.actionUrl && (
                <div className="mt-6">
                  <Button className="gap-2" onClick={() => navigate(n.actionUrl)}>
                    <ExternalLink className="h-4 w-4" />
                    Öffnen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}>
                  {n.read ? "Gelesen" : "Ungelesen"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kategorie</span>
                <span className="font-medium">{n.category || "—"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Empfangen</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(n.time || n.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
