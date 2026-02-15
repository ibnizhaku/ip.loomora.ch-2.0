import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Palmtree,
  ThermometerSun,
  Baby,
  GraduationCap,
  MoreHorizontal,
  Users,
  AlertCircle,
  Stethoscope,
  X,
  Trash2,
  Eye,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AbsenceRejectDialog from "@/components/absences/AbsenceRejectDialog";
import AbsenceApprovalStatus, { AbsenceApprovalProgress } from "@/components/absences/AbsenceApprovalStatus";
import { loadAbsenceWorkflowConfig, getRequiredAbsenceStages, AUTO_CONFIRMED_TYPES } from "@/components/settings/AbsenceWorkflowSettings";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Backend → Frontend type mapping
const typeMap: Record<string, string> = {
  VACATION: "Ferien",
  SICK: "Krankheit",
  ACCIDENT: "Unfall",
  MATERNITY: "Mutterschaft",
  PATERNITY: "Vaterschaft",
  MILITARY: "Militär",
  TRAINING: "Fortbildung",
  SPECIAL: "Sonderurlaub",
  UNPAID: "Unbezahlt",
};

// Backend → Frontend status mapping
const statusMap: Record<string, string> = {
  PENDING: "Ausstehend",
  APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt",
  CANCELLED: "Storniert",
  CONFIRMED: "Bestätigt",
};

const mapType = (raw: string) => typeMap[raw] || raw;
const mapStatus = (raw: string) => statusMap[raw] || raw;

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === "–") return "–";
  try {
    return new Date(dateStr).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
};

interface AbsenceRequest {
  id: string;
  employee: string;
  employeeId: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: string;
  requestDate: string;
  note?: string;
  rejectionReason?: string;
  currentStageIndex: number;
  approvalHistory: AbsenceApprovalProgress[];
}

const typeConfig: Record<string, { color: string; icon: any }> = {
  "Ferien": { color: "bg-info/10 text-info", icon: Palmtree },
  "Krankheit": { color: "bg-warning/10 text-warning", icon: ThermometerSun },
  "Unfall": { color: "bg-destructive/10 text-destructive", icon: Stethoscope },
  "Mutterschaft": { color: "bg-primary/10 text-primary", icon: Baby },
  "Vaterschaft": { color: "bg-primary/10 text-primary", icon: Baby },
  "Militär": { color: "bg-muted text-muted-foreground", icon: Calendar },
  "Fortbildung": { color: "bg-success/10 text-success", icon: GraduationCap },
  "Sonderurlaub": { color: "bg-muted text-muted-foreground", icon: Calendar },
  "Unbezahlt": { color: "bg-muted text-muted-foreground", icon: Calendar },
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Ausstehend": { color: "bg-warning/10 text-warning", icon: Clock },
  "Genehmigt": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Bestätigt": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Abgelehnt": { color: "bg-destructive/10 text-destructive", icon: XCircle },
  "Storniert": { color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

const Absences = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch absences from API
  const { data: apiData, isLoading } = useQuery({
    queryKey: ["/absences"],
    queryFn: () => api.get<any>("/absences"),
  });

  // Fetch employees for Ferienübersicht
  const { data: employeesApiData } = useQuery({
    queryKey: ["/employees", { pageSize: 200 }],
    queryFn: () => api.get<any>("/employees?pageSize=200"),
  });

  const absenceRequests: AbsenceRequest[] = (apiData?.data || []).map((raw: any) => ({
    id: raw.id,
    employee: raw.employee?.name || `${raw.employee?.firstName || ""} ${raw.employee?.lastName || ""}`.trim() || "–",
    employeeId: raw.employeeId || raw.employee?.id || "",
    type: mapType(raw.type),
    from: formatDate(raw.startDate || raw.from),
    to: formatDate(raw.endDate || raw.to),
    days: Number(raw.days || raw.duration || 0),
    status: mapStatus(raw.status),
    requestDate: formatDate(raw.createdAt || raw.requestDate),
    note: raw.notes || raw.reason || "",
    rejectionReason: raw.rejectionReason || "",
    currentStageIndex: raw.currentStageIndex || 0,
    approvalHistory: raw.approvalHistory || [],
  }));

  // Map employees for Ferienübersicht
  const employeeVacation = ((employeesApiData as any)?.data || []).map((emp: any) => {
    const contract = emp.contracts?.[0];
    const vacDays = contract?.vacationDays || emp.vacationDays || 25;
    const taken = emp.vacationTaken || 0;
    const birthDate = emp.dateOfBirth ? new Date(emp.dateOfBirth) : null;
    const age = birthDate ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
    return {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      position: emp.position || "–",
      age,
      total: vacDays,
      taken,
      planned: 0,
      remaining: vacDays - taken,
    };
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/absences/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/absences"] });
      toast.success("Abwesenheit erfolgreich gelöscht");
    },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/absences/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/absences"] });
      toast.success("Antrag genehmigt");
    },
    onError: () => toast.error("Fehler beim Genehmigen"),
  });

  // Reject mutation
  const rejectAbsenceMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.post(`/absences/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/absences"] });
    },
    onError: () => toast.error("Fehler beim Ablehnen"),
  });

  const requests = absenceRequests;
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterRequestStatus, setFilterRequestStatus] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AbsenceRequest | null>(null);

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AbsenceRequest | null>(null);
  
  const pendingRequests = requests.filter(r => r.status === "Ausstehend");

  const totalFerien = employeeVacation.reduce((sum: number, e: any) => sum + e.total, 0);
  const genommenFerien = employeeVacation.reduce((sum: number, e: any) => sum + e.taken, 0);
  const activeFilters = filterType.length + filterRequestStatus.length;

  const handleStatClick = (filter: string | null) => {
    setStatusFilter(statusFilter === filter ? null : filter);
  };

  const resetFilters = () => {
    setFilterType([]);
    setFilterRequestStatus([]);
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = (r.employee || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter || r.type === statusFilter;
    const matchesFilterType = filterType.length === 0 || filterType.includes(r.type);
    const matchesFilterStatus = filterRequestStatus.length === 0 || filterRequestStatus.includes(r.status);
    return matchesSearch && matchesStatus && matchesFilterType && matchesFilterStatus;
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const openRejectDialog = (request: AbsenceRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = (reason: string) => {
    if (selectedRequest) {
      rejectAbsenceMutation.mutate({ id: selectedRequest.id, reason }, {
        onSuccess: () => {
          toast.error(`Antrag von ${selectedRequest.employee} abgelehnt`, {
            description: reason ? `Grund: ${reason}` : undefined,
          });
        },
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, request: AbsenceRequest) => {
    e.stopPropagation();
    setDeleteTarget(request);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Abwesenheiten</h1>
          <p className="text-muted-foreground">Ferien, Krankheit & Absenzen nach GAV Metallbau</p>
        </div>
        <Button onClick={() => navigate("/absences/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Abwesenheit eintragen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-success/50",
            statusFilter === "Ferien" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatClick("Ferien")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalFerien || 0} Tage</div>
                <p className="text-sm text-muted-foreground">Ferienanspruch Total</p>
                {totalFerien > 0 && <Progress value={(genommenFerien / totalFerien) * 100} className="mt-2" />}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Palmtree className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-info/50",
            !statusFilter && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleStatClick(null)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-warning">{pendingRequests.length}</div>
                <p className="text-sm text-muted-foreground">Offene Anträge</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-destructive/50",
            statusFilter === "Krankheit" && "border-destructive ring-2 ring-destructive/20"
          )}
          onClick={() => handleStatClick("Krankheit")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {requests.filter(r => r.type === "Krankheit").reduce((s, r) => s + r.days, 0)} Tage
                </div>
                <p className="text-sm text-muted-foreground">Krankheitstage (Jahr)</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Stethoscope className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-warning/50",
            statusFilter === "Ausstehend" && "border-warning ring-2 ring-warning/20"
          )}
          onClick={() => handleStatClick("Ausstehend")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{requests.filter(r => r.status === "Genehmigt").length}</div>
                <p className="text-sm text-muted-foreground">Heute abwesend</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-6 w-6 text-warning" />
            <div className="flex-1">
              <p className="font-semibold">{pendingRequests.length} ausstehende Anträge</p>
              <p className="text-sm text-muted-foreground">
                {pendingRequests.map(r => r.employee).join(", ")} warten auf Genehmigung
              </p>
            </div>
            <Button size="sm" onClick={() => handleStatClick("Ausstehend")}>Anträge prüfen</Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Anträge</TabsTrigger>
          <TabsTrigger value="overview">Ferienübersicht</TabsTrigger>
          <TabsTrigger value="gav">GAV Regelungen</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Anträge suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(activeFilters > 0 && "border-primary")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {activeFilters > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">{activeFilters}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Filter</h4>
                    {activeFilters > 0 && (
                      <Button variant="ghost" size="sm" onClick={resetFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Zurücksetzen
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Art</Label>
                    {["Ferien", "Krankheit", "Unfall", "Fortbildung"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filterType.includes(type)}
                          onCheckedChange={(checked) => {
                            setFilterType(checked 
                              ? [...filterType, type]
                              : filterType.filter(t => t !== type)
                            );
                          }}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Status</Label>
                    {["Ausstehend", "Genehmigt", "Bestätigt", "Abgelehnt"].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filterRequestStatus.includes(status)}
                          onCheckedChange={(checked) => {
                            setFilterRequestStatus(checked 
                              ? [...filterRequestStatus, status]
                              : filterRequestStatus.filter(s => s !== status)
                            );
                          }}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mb-3 opacity-50" />
                  <p className="font-medium">Keine Abwesenheiten gefunden</p>
                  <p className="text-sm">Erstellen Sie eine neue Abwesenheit oder passen Sie die Filter an.</p>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeitende</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Von</TableHead>
                    <TableHead>Bis</TableHead>
                    <TableHead className="text-right">Tage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bemerkung</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const type = typeConfig[request.type] || typeConfig["Sonderurlaub"];
                    const status = statusConfig[request.status] || statusConfig["Ausstehend"];
                    const TypeIcon = type?.icon || Calendar;
                    const StatusIcon = status?.icon || Clock;
                    return (
                      <TableRow 
                        key={request.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/absences/${request.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {(request.employee || "").split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{request.employee}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={type?.color || "bg-muted text-muted-foreground"}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {request.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.from}</TableCell>
                        <TableCell>{request.to}</TableCell>
                        <TableCell className="text-right font-medium">{request.days}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={status?.color || "bg-muted text-muted-foreground"}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {request.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                          {request.rejectionReason || request.note || "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/absences/${request.id}`); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Details anzeigen
                              </DropdownMenuItem>
                              {request.status === "Ausstehend" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-success"
                                    onClick={(e) => { e.stopPropagation(); handleApprove(request.id); }}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Genehmigen
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={(e) => { e.stopPropagation(); openRejectDialog(request); }}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Ablehnen
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => handleDeleteClick(e, request)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Ferienkonten {new Date().getFullYear()}</CardTitle>
              <CardDescription>Anspruch gemäss GAV Metallbau (altersabhängig)</CardDescription>
            </CardHeader>
            <CardContent>
              {employeeVacation.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mb-3 opacity-50" />
                  <p className="font-medium">Keine Mitarbeiterdaten verfügbar</p>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeitende</TableHead>
                    <TableHead>Alter</TableHead>
                    <TableHead className="text-right">Anspruch</TableHead>
                    <TableHead className="text-right">Genommen</TableHead>
                    <TableHead className="text-right">Geplant</TableHead>
                    <TableHead className="text-right">Restsaldo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeVacation.map((emp: any) => {
                    const usedPercent = emp.total > 0 ? ((emp.taken + emp.planned) / emp.total) * 100 : 0;
                    return (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {emp.name.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link to={`/hr/${emp.id}`} className="font-medium hover:text-primary">{emp.name}</Link>
                              <p className="text-xs text-muted-foreground">{emp.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{emp.age > 0 ? `${emp.age} J.` : "–"}</TableCell>
                        <TableCell className="text-right">{emp.total}</TableCell>
                        <TableCell className="text-right">{emp.taken}</TableCell>
                        <TableCell className="text-right text-info">{emp.planned || "-"}</TableCell>
                        <TableCell className="text-right font-semibold text-success">{emp.remaining}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={usedPercent} className="h-2 w-20" />
                            <span className="text-xs text-muted-foreground">{Math.round(usedPercent)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gav" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ferienanspruch GAV Metallbau</CardTitle>
                <CardDescription>Gemäss Gesamtarbeitsvertrag SMU</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Bis 20 Jahre</span><span className="font-semibold">25 Arbeitstage (5 Wochen)</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>20-49 Jahre</span><span className="font-semibold">20 Arbeitstage (4 Wochen)</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Ab 50 Jahre</span><span className="font-semibold">25 Arbeitstage (5 Wochen)</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Ab 60 Jahre</span><span className="font-semibold">30 Arbeitstage (6 Wochen)</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bezahlte Abwesenheiten</CardTitle>
                <CardDescription>Gesetzlich & GAV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Eigene Hochzeit</span><span className="font-semibold">3 Tage</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Vaterschaftsurlaub</span><span className="font-semibold">10 Tage (2 Wochen)</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Mutterschaftsurlaub</span><span className="font-semibold">14 Wochen (98 Tage)</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Todesfall (Familie)</span><span className="font-semibold">1-3 Tage</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Umzug</span><span className="font-semibold">1 Tag</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Krankheit & Unfall</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Krankentaggeld (KTG)</span><span className="font-semibold">80% ab 3. Tag, max. 720 Tage</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Berufsunfall (BU/SUVA)</span><span className="font-semibold">80% ab 3. Tag</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Nichtberufsunfall (NBU)</span><span className="font-semibold">80% ab 3. Tag</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Arztzeugnis erforderlich</span><span className="font-semibold">Ab 3. Krankheitstag</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feiertage (Kanton ZH)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Neujahr</span><span className="font-semibold">1. Januar</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Karfreitag & Ostermontag</span><span className="font-semibold">variabel</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Tag der Arbeit</span><span className="font-semibold">1. Mai</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Bundesfeiertag</span><span className="font-semibold">1. August</span></div>
                <div className="flex justify-between p-2 bg-muted/50 rounded"><span>Weihnachten</span><span className="font-semibold">25./26. Dezember</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      {selectedRequest && (
        <AbsenceRejectDialog
          open={rejectDialogOpen}
          onOpenChange={setRejectDialogOpen}
          employeeName={selectedRequest.employee}
          absenceType={selectedRequest.type}
          dateRange={`${selectedRequest.from} - ${selectedRequest.to}`}
          onConfirm={handleRejectConfirm}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abwesenheit löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `Möchten Sie die ${deleteTarget.type} von ${deleteTarget.employee} (${deleteTarget.from} - ${deleteTarget.to}) wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Absences;
