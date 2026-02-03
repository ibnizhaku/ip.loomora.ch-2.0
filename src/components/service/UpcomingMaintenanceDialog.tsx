import { useState } from "react";
import { Calendar, Clock, Building2, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MaintenanceItem {
  id: string;
  ticketNumber: string;
  title: string;
  customer: string;
  dueDate: string;
  daysUntilDue: number;
  interval: string;
  lastMaintenance?: string;
  status: "overdue" | "due-soon" | "upcoming";
}

const maintenanceItems: MaintenanceItem[] = [
  {
    id: "1",
    ticketNumber: "SRV-2024-002",
    title: "Jährliche Wartung Brandschutztüren",
    customer: "Logistik Center Zürich",
    dueDate: "15.02.2024",
    daysUntilDue: 12,
    interval: "Jährlich",
    lastMaintenance: "15.02.2023",
    status: "due-soon",
  },
  {
    id: "2",
    ticketNumber: "WV-2024-001",
    title: "Halbjährliche Inspektion Stahlkonstruktion",
    customer: "Müller Industrie AG",
    dueDate: "01.02.2024",
    daysUntilDue: -2,
    interval: "Halbjährlich",
    lastMaintenance: "01.08.2023",
    status: "overdue",
  },
  {
    id: "3",
    ticketNumber: "WV-2024-003",
    title: "Quartalsweise Prüfung Geländer",
    customer: "Immobilien Müller",
    dueDate: "28.02.2024",
    daysUntilDue: 25,
    interval: "Quartalsweise",
    lastMaintenance: "28.11.2023",
    status: "upcoming",
  },
  {
    id: "4",
    ticketNumber: "WV-2024-004",
    title: "Monatliche Schmierung Schiebetore",
    customer: "Bauherr AG",
    dueDate: "05.02.2024",
    daysUntilDue: 2,
    interval: "Monatlich",
    lastMaintenance: "05.01.2024",
    status: "due-soon",
  },
  {
    id: "5",
    ticketNumber: "WV-2024-005",
    title: "Jährliche Wartung Fluchttreppe",
    customer: "Hotel Bellevue",
    dueDate: "15.03.2024",
    daysUntilDue: 41,
    interval: "Jährlich",
    lastMaintenance: "15.03.2023",
    status: "upcoming",
  },
];

const statusConfig = {
  overdue: { 
    label: "Überfällig", 
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: AlertTriangle,
  },
  "due-soon": { 
    label: "Bald fällig", 
    color: "bg-warning/10 text-warning border-warning/20",
    icon: Clock,
  },
  upcoming: { 
    label: "Geplant", 
    color: "bg-info/10 text-info border-info/20",
    icon: Calendar,
  },
};

export function UpcomingMaintenanceDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const overdueCount = maintenanceItems.filter(i => i.status === "overdue").length;
  const dueSoonCount = maintenanceItems.filter(i => i.status === "due-soon").length;

  const handleItemClick = (item: MaintenanceItem) => {
    setOpen(false);
    navigate(`/service/${item.id}`);
  };

  const handleCreateTicket = (item: MaintenanceItem) => {
    setOpen(false);
    navigate("/service/new");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Calendar className="h-4 w-4" />
          Wartungsplan
          {overdueCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {overdueCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bevorstehende Wartungen
          </DialogTitle>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
            <p className="text-xs text-muted-foreground">Überfällig</p>
          </div>
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-center">
            <p className="text-2xl font-bold text-warning">{dueSoonCount}</p>
            <p className="text-xs text-muted-foreground">Diese Woche</p>
          </div>
          <div className="rounded-lg border border-info/20 bg-info/5 p-3 text-center">
            <p className="text-2xl font-bold text-info">{maintenanceItems.length}</p>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </div>
        </div>

        {/* Maintenance List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {maintenanceItems
              .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
              .map((item) => {
                const StatusIcon = statusConfig[item.status].icon;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-lg border p-4 transition-all hover:border-primary/50 cursor-pointer",
                      item.status === "overdue" && "border-destructive/30 bg-destructive/5"
                    )}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          item.status === "overdue" ? "bg-destructive/10" : "bg-muted"
                        )}>
                          <StatusIcon className={cn(
                            "h-5 w-5",
                            item.status === "overdue" ? "text-destructive" : 
                            item.status === "due-soon" ? "text-warning" : "text-info"
                          )} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium truncate">{item.title}</h4>
                            <Badge className={statusConfig[item.status].color}>
                              {statusConfig[item.status].label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{item.customer}</span>
                            <span>•</span>
                            <span className="font-mono text-xs">{item.ticketNumber}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Intervall: {item.interval}</span>
                            {item.lastMaintenance && (
                              <span>Letzte: {item.lastMaintenance}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "font-mono text-sm font-medium",
                          item.status === "overdue" && "text-destructive"
                        )}>
                          {item.dueDate}
                        </p>
                        <p className={cn(
                          "text-xs",
                          item.daysUntilDue < 0 ? "text-destructive" :
                          item.daysUntilDue <= 7 ? "text-warning" : "text-muted-foreground"
                        )}>
                          {item.daysUntilDue < 0 
                            ? `${Math.abs(item.daysUntilDue)} Tage überfällig`
                            : item.daysUntilDue === 0 
                            ? "Heute fällig"
                            : `in ${item.daysUntilDue} Tagen`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-between pt-2 border-t">
          <Button variant="outline" onClick={() => navigate("/calendar")}>
            <Calendar className="h-4 w-4 mr-2" />
            Im Kalender anzeigen
          </Button>
          <Button onClick={() => { setOpen(false); navigate("/service/new"); }}>
            Wartungsticket erstellen
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
