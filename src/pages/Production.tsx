import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Plus,
  Search,
  Factory,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  Edit,
  Calendar,
  Users,
  Wrench,
  Package,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ProductionOrder {
  id: string;
  number: string;
  name: string;
  project?: string;
  bomNumber?: string;
  status: "planned" | "in_progress" | "paused" | "completed" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  plannedHours: number;
  actualHours: number;
  progress: number;
  assignedTeam: string[];
  workstation: string;
}


const statusStyles = {
  planned: "bg-muted text-muted-foreground",
  in_progress: "bg-info/10 text-info",
  paused: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  planned: "Geplant",
  in_progress: "In Arbeit",
  paused: "Pausiert",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
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

export default function Production() {
  const navigate = useNavigate();
  const { canWrite, canDelete } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/production-orders"],
    queryFn: () => api.get<any>("/production-orders"),
  });
  const initialOrders: ProductionOrder[] = (apiData?.data || []).map((raw: any) => ({
    id: raw.id || "",
    number: raw.number || "",
    name: raw.name || raw.title || "–",
    project: raw.project?.name || raw.project || undefined,
    bomNumber: raw.bomNumber || raw.bom?.number || undefined,
    status: (raw.status || "planned").toLowerCase().replace("-", "_"),
    priority: (raw.priority || "normal").toLowerCase(),
    plannedStart: raw.plannedStart || raw.startDate ? new Date(raw.plannedStart || raw.startDate).toLocaleDateString("de-CH") : "–",
    plannedEnd: raw.plannedEnd || raw.endDate ? new Date(raw.plannedEnd || raw.endDate).toLocaleDateString("de-CH") : "–",
    actualStart: raw.actualStart ? new Date(raw.actualStart).toLocaleDateString("de-CH") : undefined,
    actualEnd: raw.actualEnd ? new Date(raw.actualEnd).toLocaleDateString("de-CH") : undefined,
    plannedHours: Number(raw.plannedHours || 0),
    actualHours: Number(raw.actualHours || 0),
    progress: Number(raw.progress || 0),
    assignedTeam: raw.assignedTeam || [],
    workstation: raw.workstation || "–",
  }));
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderList, setOrderList] = useState<ProductionOrder[]>(initialOrders);

  const totalOrders = orderList.length;
  const inProgressOrders = orderList.filter((o) => o.status === "in_progress").length;
  const plannedOrders = orderList.filter((o) => o.status === "planned").length;
  const completedOrders = orderList.filter((o) => o.status === "completed").length;
  const totalPlannedHours = orderList.reduce((sum, o) => sum + (o.plannedHours || 0), 0);
  const totalActualHours = orderList.reduce((sum, o) => sum + (o.actualHours || 0), 0);

  const filteredOrders = orderList.filter((order) => {
    const matchesSearch = (order.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.number || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStart = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setOrderList(orderList.map(o => 
      o.id === orderId ? { ...o, status: "in_progress" as const, actualStart: new Date().toLocaleDateString("de-CH") } : o
    ));
    toast.success("Auftrag gestartet");
  };

  const handlePause = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setOrderList(orderList.map(o => 
      o.id === orderId ? { ...o, status: "paused" as const } : o
    ));
    toast.info("Auftrag pausiert");
  };

  const handleResume = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setOrderList(orderList.map(o => 
      o.id === orderId ? { ...o, status: "in_progress" as const } : o
    ));
    toast.success("Auftrag fortgesetzt");
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/production-orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/production-orders"] });
      toast.success("Produktionsauftrag erfolgreich gelöscht");
    },
  });

  const handleDelete = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    deleteMutation.mutate(orderId);
  };

  const handleDuplicate = (e: React.MouseEvent, order: ProductionOrder) => {
    e.stopPropagation();
    const newOrder: ProductionOrder = {
      ...order,
      id: Date.now().toString(),
      number: `WA-2024-${String(orderList.length + 1).padStart(3, '0')}`,
      name: `${order.name} (Kopie)`,
      status: "planned",
      progress: 0,
      actualHours: 0,
      actualStart: undefined,
      actualEnd: undefined,
    };
    setOrderList([...orderList, newOrder]);
    toast.success("Auftrag dupliziert");
  };

  const handleTimeTracking = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    navigate("/time-tracking");
    toast.info("Zur Zeiterfassung");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Produktionsplanung
          </h1>
          <p className="text-muted-foreground">
            Werkstattaufträge und Kapazitätsplanung
          </p>
        </div>
        <div className="flex gap-2">
          {canWrite('production-orders') && (
            <Button className="gap-2" onClick={() => navigate("/production/new")}>
              <Plus className="h-4 w-4" />
              Werkstattauftrag
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-primary/50",
            statusFilter === "all" ? "border-primary ring-2 ring-primary/20" : "border-border"
          )}
          onClick={() => setStatusFilter("all")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Factory className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aufträge</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-info/50",
            statusFilter === "in_progress" ? "border-info ring-2 ring-info/20" : "border-border"
          )}
          onClick={() => setStatusFilter("in_progress")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Play className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Arbeit</p>
              <p className="text-2xl font-bold text-info">{inProgressOrders}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-success/50",
            statusFilter === "completed" ? "border-success ring-2 ring-success/20" : "border-border"
          )}
          onClick={() => setStatusFilter("completed")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Abgeschlossen</p>
              <p className="text-2xl font-bold text-success">{completedOrders}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-muted-foreground/50",
            statusFilter === "planned" ? "border-muted-foreground ring-2 ring-muted-foreground/20" : "border-border"
          )}
          onClick={() => setStatusFilter("planned")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Geplant</p>
              <p className="text-2xl font-bold">{plannedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Auftrag suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="planned">Geplant</SelectItem>
            <SelectItem value="in_progress">In Arbeit</SelectItem>
            <SelectItem value="paused">Pausiert</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Production Orders */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => (
          <div
            key={order.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => navigate(`/production/${order.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  order.status === "in_progress" ? "bg-info/10" : "bg-muted"
                )}>
                  <Factory className={cn(
                    "h-6 w-6",
                    order.status === "in_progress" ? "text-info" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{order.name}</h3>
                    <Badge className={statusStyles[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                    <Badge className={priorityStyles[order.priority]}>
                      {priorityLabels[order.priority]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{order.number}</span>
                    {order.project && <> • {order.project}</>}
                    {order.bomNumber && <> • Stückliste: {order.bomNumber}</>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {order.status === "planned" && (
                  <Button size="sm" className="gap-2" onClick={(e) => handleStart(e, order.id)}>
                    <Play className="h-4 w-4" />
                    Starten
                  </Button>
                )}
                {order.status === "in_progress" && (
                  <Button size="sm" variant="outline" className="gap-2" onClick={(e) => handlePause(e, order.id)}>
                    <Pause className="h-4 w-4" />
                    Pausieren
                  </Button>
                )}
                {order.status === "paused" && (
                  <Button size="sm" className="gap-2" onClick={(e) => handleResume(e, order.id)}>
                    <Play className="h-4 w-4" />
                    Fortsetzen
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/production/${order.id}`); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/production/${order.id}`); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleDuplicate(e, order)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplizieren
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleTimeTracking(e, order.id)}>
                      <Clock className="h-4 w-4 mr-2" />
                      Zeit erfassen
                    </DropdownMenuItem>
                    {canDelete('production-orders') && (
                      <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, order.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Fortschritt</span>
                <span className="font-mono">{order.progress}%</span>
              </div>
              <Progress value={order.progress} className="h-2" />
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Zeitraum</p>
                  <p className="text-sm font-mono">{order.plannedStart} - {order.plannedEnd}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Stunden</p>
                  <p className="text-sm font-mono">{order.actualHours} / {order.plannedHours} h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Team</p>
                  <p className="text-sm">{order.assignedTeam.map(m => typeof m === 'object' ? (m as any)?.name || (m as any)?.firstName : m).join(", ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Arbeitsplatz</p>
                  <p className="text-sm">{order.workstation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-muted-foreground rounded-xl border border-border bg-card">
            <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Keine Aufträge gefunden</p>
            <p className="text-sm">Passen Sie die Filter an oder erstellen Sie einen neuen Auftrag</p>
          </div>
        )}
      </div>
    </div>
  );
}