import { useState } from "react";
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

const productionOrders: ProductionOrder[] = [
  {
    id: "1",
    number: "WA-2024-001",
    name: "Metalltreppe 3-geschossig",
    project: "PRJ-2024-015",
    bomNumber: "STL-2024-001",
    status: "in_progress",
    priority: "high",
    plannedStart: "22.01.2024",
    plannedEnd: "02.02.2024",
    actualStart: "22.01.2024",
    plannedHours: 68,
    actualHours: 42,
    progress: 62,
    assignedTeam: ["M. Steiner", "A. Meier"],
    workstation: "Schweisserei 1",
  },
  {
    id: "2",
    number: "WA-2024-002",
    name: "Balkongeländer 15m",
    project: "PRJ-2024-018",
    bomNumber: "STL-2024-002",
    status: "planned",
    priority: "normal",
    plannedStart: "05.02.2024",
    plannedEnd: "09.02.2024",
    plannedHours: 19,
    actualHours: 0,
    progress: 0,
    assignedTeam: ["T. Brunner"],
    workstation: "Montage",
  },
  {
    id: "3",
    number: "WA-2024-003",
    name: "Brandschutztüren (5 Stk)",
    status: "paused",
    priority: "urgent",
    plannedStart: "29.01.2024",
    plannedEnd: "31.01.2024",
    actualStart: "29.01.2024",
    plannedHours: 25,
    actualHours: 12,
    progress: 48,
    assignedTeam: ["S. Huber", "M. Steiner"],
    workstation: "Schweisserei 2",
  },
  {
    id: "4",
    number: "WA-2024-004",
    name: "Stahlträger Carport",
    project: "PRJ-2024-022",
    status: "completed",
    priority: "low",
    plannedStart: "15.01.2024",
    plannedEnd: "19.01.2024",
    actualStart: "15.01.2024",
    actualEnd: "18.01.2024",
    plannedHours: 14,
    actualHours: 12,
    progress: 100,
    assignedTeam: ["A. Meier"],
    workstation: "Schweisserei 1",
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totalOrders = productionOrders.length;
  const inProgressOrders = productionOrders.filter((o) => o.status === "in_progress").length;
  const completedOrders = productionOrders.filter((o) => o.status === "completed").length;
  const totalPlannedHours = productionOrders.reduce((sum, o) => sum + o.plannedHours, 0);
  const totalActualHours = productionOrders.reduce((sum, o) => sum + o.actualHours, 0);

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
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Kapazität
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Werkstattauftrag
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
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
        <div className="rounded-xl border border-border bg-card p-5">
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
        <div className="rounded-xl border border-border bg-card p-5">
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
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auslastung</p>
              <p className="text-2xl font-bold">
                {Math.round((totalActualHours / totalPlannedHours) * 100)}%
              </p>
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
        {productionOrders.map((order, index) => (
          <div
            key={order.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
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

              <div className="flex items-center gap-2">
                {order.status === "planned" && (
                  <Button size="sm" className="gap-2">
                    <Play className="h-4 w-4" />
                    Starten
                  </Button>
                )}
                {order.status === "in_progress" && (
                  <Button size="sm" variant="outline" className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pausieren
                  </Button>
                )}
                {order.status === "paused" && (
                  <Button size="sm" className="gap-2">
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
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Clock className="h-4 w-4 mr-2" />
                      Zeit erfassen
                    </DropdownMenuItem>
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
                  <p className="text-sm">{order.assignedTeam.join(", ")}</p>
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
      </div>
    </div>
  );
}
