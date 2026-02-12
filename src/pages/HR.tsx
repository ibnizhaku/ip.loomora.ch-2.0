import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: "active" | "vacation" | "sick" | "inactive";
  startDate: string;
  avatar?: string;
}


const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Aktiv", color: "bg-success/10 text-success" },
  vacation: { label: "Urlaub", color: "bg-info/10 text-info" },
  sick: { label: "Krank", color: "bg-warning/10 text-warning" },
  inactive: { label: "Inaktiv", color: "bg-muted text-muted-foreground" },
};
const defaultEmpStatus = { label: "Unbekannt", color: "bg-muted text-muted-foreground" };

function mapEmployee(raw: any): any {
  const s = (raw.status || "").toUpperCase();
  let status = "active";
  if (s === "INACTIVE" || raw.isActive === false) status = "inactive";
  else if (s === "VACATION" || s === "ON_LEAVE") status = "vacation";
  else if (s === "SICK") status = "sick";
  const startDate = raw.startDate || raw.hireDate || raw.createdAt;
  return {
    ...raw,
    name: raw.name || raw.firstName && raw.lastName ? `${raw.firstName} ${raw.lastName}` : raw.firstName || "–",
    position: raw.position || raw.jobTitle || "–",
    department: raw.department?.name || raw.department || "–",
    email: raw.email || "–",
    phone: raw.phone || raw.mobilePhone || "–",
    status,
    startDate: startDate ? new Date(startDate).toLocaleDateString("de-CH") : "–",
  };
}

const departments = ["Alle", "Geschäftsleitung", "Produktion", "Montage", "Projektmanagement", "Administration"];

export default function HR() {
  const queryClient = useQueryClient();
  const { data: apiData } = useQuery({ queryKey: ["/employees"], queryFn: () => api.get<any>("/employees") });
  const employees = (apiData?.data || []).map(mapEmployee);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Alle");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/employees"] });
      toast.success("Mitarbeiter erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
    },
  });

  const handleStatClick = (status: string | null) => {
    setStatusFilter(statusFilter === status ? null : status);
  };

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      (e.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.position || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "Alle" || e.department === selectedDepartment;
    const matchesStatus = !statusFilter || e.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Personalverwaltung
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Mitarbeiter und Teams
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/hr/new")}>
          <Plus className="h-4 w-4" />
          Mitarbeiter hinzufügen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-primary/50",
            !statusFilter && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleStatClick(null)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{employees.length}</p>
              <p className="text-sm text-muted-foreground">Mitarbeiter</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-success/50",
            statusFilter === "active" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatClick("active")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <UserCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {employees.filter((e) => e.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Aktiv</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-info/50",
            statusFilter === "vacation" && "border-info ring-2 ring-info/20"
          )}
          onClick={() => handleStatClick("vacation")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Calendar className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {employees.filter((e) => e.status === "vacation").length}
              </p>
              <p className="text-sm text-muted-foreground">Im Urlaub</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-warning/50",
            statusFilter === "sick" && "border-warning ring-2 ring-warning/20"
          )}
          onClick={() => handleStatClick("sick")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <UserX className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {employees.filter((e) => e.status === "sick").length}
              </p>
              <p className="text-sm text-muted-foreground">Krank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Mitarbeiter suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {departments.map((dept) => (
            <Button
              key={dept}
              variant={selectedDepartment === dept ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDepartment(dept)}
              className="whitespace-nowrap"
            >
              {dept}
            </Button>
          ))}
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee, index) => (
          <div
            key={employee.id}
            className={cn(
              "group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-soft animate-fade-in cursor-pointer"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => navigate(`/hr/${employee.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-border">
                  <AvatarImage src={employee.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {(employee.name || "?")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {employee.position}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/hr/${employee.id}`); }}>
                    Profil anzeigen
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/hr/${employee.id}/edit`); }}>
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/absences/new?employee=${employee.id}`); }}>
                    Urlaub eintragen
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => { e.stopPropagation(); toast.success(`${employee.name} wurde deaktiviert`); }}
                  >
                    Deaktivieren
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Mitarbeiter wirklich löschen?")) {
                        deleteMutation.mutate(employee.id);
                      }
                    }}
                  >
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={(statusConfig[employee.status] || defaultEmpStatus).color}>
                  {(statusConfig[employee.status] || defaultEmpStatus).label}
                </Badge>
                <Badge variant="outline">{employee.department}</Badge>
              </div>

              <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">
                    {employee.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Seit {employee.startDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
