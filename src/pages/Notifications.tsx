import { useState } from "react";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/hooks/use-notifications";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  Check,
  CheckCheck,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: "system" | "sales" | "finance" | "hr" | "production";
  link?: string;
}

const typeIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
};

const typeStyles = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-destructive/10 text-destructive",
};

const categoryLabels = {
  system: "System",
  sales: "Verkauf",
  finance: "Finanzen",
  hr: "Personal",
  production: "Produktion",
};

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("all");
  const category = !["all", "unread"].includes(activeTab) ? activeTab : undefined;
  const read = activeTab === "unread" ? false : undefined;

  const { data: apiData } = useNotifications({ category, read, pageSize: 50 });
  const { data: unreadData } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = apiData?.data || [];
  const unreadCount = unreadData?.count || 0;
  const totalCount = apiData?.total || 0;

  const warningCount = notifications.filter((n) => n.type === "warning" || n.type === "error").length;
  const readCount = notifications.filter((n) => n.read).length;

  const markAsRead = (id: string) => markAsReadMutation.mutate(id);
  const markAllAsRead = () => markAllAsReadMutation.mutate();
  const deleteNotification = (id: string) => deleteMutation.mutate(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Benachrichtigungen
          </h1>
          <p className="text-muted-foreground">
            System-Benachrichtigungen und Warnungen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" />
            Alle als gelesen
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Einstellungen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ungelesen</p>
              <p className="text-2xl font-bold text-warning">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warnungen</p>
              <p className="text-2xl font-bold">
                {warningCount}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gelesen</p>
              <p className="text-2xl font-bold">
                {readCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="unread">
            Ungelesen {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="finance">Finanzen</TabsTrigger>
          <TabsTrigger value="sales">Verkauf</TabsTrigger>
          <TabsTrigger value="hr">Personal</TabsTrigger>
          <TabsTrigger value="production">Produktion</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Keine Benachrichtigungen</p>
            </div>
          ) : (
            notifications.map((notification, index) => {
              const Icon = typeIcons[notification.type];
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "rounded-xl border bg-card p-5 transition-all animate-fade-in",
                    notification.read ? "border-border" : "border-primary/30 bg-primary/5"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      typeStyles[notification.type]
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "font-semibold",
                          !notification.read && "text-primary"
                        )}>
                          {notification.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[notification.category]}
                        </Badge>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.time}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
