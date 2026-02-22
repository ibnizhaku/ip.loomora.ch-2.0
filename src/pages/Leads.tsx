import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Star,
  ArrowRight,
  ArrowUpDown,
  ChevronRight,
  GripVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUpdateLead } from "@/hooks/use-marketing";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  score: number;
  value: number;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
}


const pipelineStages = [
  { id: "new", label: "Neu", color: "bg-muted" },
  { id: "contacted", label: "Kontaktiert", color: "bg-info" },
  { id: "qualified", label: "Qualifiziert", color: "bg-primary" },
  { id: "proposal", label: "Angebot", color: "bg-warning" },
  { id: "negotiation", label: "Verhandlung", color: "bg-amber-500" },
  { id: "won", label: "Gewonnen", color: "bg-success" },
];

const statusStyles: Record<string, string> = {
  new: "bg-muted text-muted-foreground",
  contacted: "bg-info/10 text-info",
  qualified: "bg-primary/10 text-primary",
  proposal: "bg-warning/10 text-warning",
  negotiation: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

const getStatusLabel = (status: string) => {
  const stage = pipelineStages.find((s) => s.id === status);
  return stage?.label || status;
};

const getNextStage = (currentStatus: string): string | null => {
  const currentIndex = pipelineStages.findIndex(s => s.id === currentStatus);
  if (currentIndex === -1 || currentIndex >= pipelineStages.length - 1) return null;
  return pipelineStages[currentIndex + 1].id;
};

type SortField = "name" | "score" | "value" | "createdAt";
type SortOrder = "asc" | "desc";

const toBackendStatus = (s: string) => s.toUpperCase() as "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";

export default function Leads() {
  const navigate = useNavigate();
  const { canWrite, canDelete } = usePermissions();
  const queryClient = useQueryClient();
  const updateLead = useUpdateLead();

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/marketing/leads"],
    queryFn: () => api.get<any>("/marketing/leads"),
  });
  const initialLeads: Lead[] = (apiData?.data || []).map((raw: any) => ({
    id: raw.id || "",
    name: raw.name || raw.contactName || "–",
    company: raw.company || raw.companyName || "–",
    email: raw.email || "–",
    phone: raw.phone || "–",
    location: raw.location || raw.city || "–",
    source: raw.source || "–",
    status: (raw.status || "new").toLowerCase(),
    score: Number(raw.score || 0),
    value: Number(raw.value || raw.estimatedValue || 0),
    assignedTo: raw.assignedTo || raw.assignedUser?.name || "–",
    createdAt: raw.createdAt || "",
    lastContact: raw.lastContact || raw.lastContactDate || "-",
  }));
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/marketing/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/marketing/leads"] });
      toast.success("Lead erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
    },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const avgScore = leads.length > 0 ? leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length : 0;
  const newLeadsCount = leads.filter(l => l.status === "new").length;

  const filteredLeads = leads
    .filter((lead) => {
      const matchesSearch = (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "score":
          comparison = a.score - b.score;
          break;
        case "value":
          comparison = a.value - b.value;
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getLeadsByStage = (stage: string) => filteredLeads.filter((l) => l.status === stage);
  
  const getStageValue = (stage: string) => {
    return getLeadsByStage(stage).reduce((sum, l) => sum + l.value, 0);
  };

  const handleStatCardClick = (filter: string) => {
    setStatusFilter(statusFilter === filter ? "all" : filter);
  };

  const handleCall = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    toast.success(`Rufe ${lead.name} an: ${lead.phone}`);
  };

  const handleEmail = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    window.location.href = `mailto:${lead.email}`;
  };

  const persistStatusChange = async (
    leadId: string,
    newStatus: string,
    leadName: string,
    successMsg?: string
  ) => {
    try {
      await updateLead.mutateAsync({ id: leadId, data: { status: toBackendStatus(newStatus) } });
      queryClient.invalidateQueries({ queryKey: ["/marketing/leads"] });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus as Lead["status"] } : l));
      toast.success(successMsg ?? `${leadName} auf "${pipelineStages.find(s => s.id === newStatus)?.label || newStatus}" gesetzt`);
    } catch {
      toast.error("Status konnte nicht aktualisiert werden");
    }
  };

  const handleMoveToNextStage = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    const nextStage = getNextStage(lead.status);
    if (nextStage) {
      const nextLabel = pipelineStages.find(s => s.id === nextStage)?.label;
      persistStatusChange(lead.id, nextStage, lead.name, `${lead.name} nach "${nextLabel}" verschoben`);
    }
  };

  const handleChangeStatus = (leadId: string, newStatus: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) persistStatusChange(leadId, newStatus, lead.name);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", lead.id);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== targetStageId) {
      const targetLabel = pipelineStages.find(s => s.id === targetStageId)?.label;
      persistStatusChange(draggedLead.id, targetStageId, draggedLead.name, `${draggedLead.name} nach "${targetLabel}" verschoben`);
    }
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleMarkAsWon = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    persistStatusChange(lead.id, "won", lead.name, `🎉 ${lead.name} als gewonnen markiert!`);
  };

  const handleMarkAsLost = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    persistStatusChange(lead.id, "lost", lead.name, `${lead.name} als verloren markiert`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Lead-Management und Vertriebspipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-1">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
            >
              Liste
            </Button>
            <Button
              variant={view === "pipeline" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("pipeline")}
            >
              Pipeline
            </Button>
          </div>
          {canWrite('marketing') && (
            <Button onClick={() => navigate("/leads/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Lead
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            statusFilter === "new" && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleStatCardClick("new")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neue Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newLeadsCount}</div>
            <p className="text-xs text-muted-foreground">
              von {leads.length} gesamt
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline-Wert</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {totalValue.toLocaleString("de-CH")}
            </div>
            <p className="text-xs text-muted-foreground">
              Potenzieller Umsatz
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Lead-Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore.toFixed(0)}</div>
            <Progress value={avgScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            statusFilter === "qualified" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatCardClick("qualified")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualifiziert</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.status === "qualified").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Bereit für Angebot
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Lead oder Firma suchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {view === "list" && (
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                {pipelineStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.label}
                  </SelectItem>
                ))}
                <SelectItem value="lost">Verloren</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sortieren
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort("name")}>
                  Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("score")}>
                  Score {sortField === "score" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("value")}>
                  Wert {sortField === "value" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("createdAt")}>
                  Datum {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {statusFilter !== "all" && (
          <Button variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
            Filter zurücksetzen
          </Button>
        )}
      </div>

      {view === "list" ? (
        <div className="grid gap-4">
          {filteredLeads.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Keine Leads gefunden</p>
              <Button className="mt-4" onClick={() => navigate("/leads/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Ersten Lead anlegen
              </Button>
            </Card>
          ) : (
            filteredLeads.map((lead, index) => (
              <Card 
                key={lead.id} 
                className="hover:shadow-md transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {(lead.name || "?")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{lead.name}</h3>
                          <Badge className={statusStyles[lead.status] || statusStyles.new}>
                            {getStatusLabel(lead.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {lead.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {lead.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(lead.createdAt).toLocaleDateString("de-CH")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Score</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          <span className="font-semibold">{lead.score}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Wert</div>
                        <div className="font-semibold">CHF {lead.value.toLocaleString("de-CH")}</div>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={(e) => handleCall(e, lead)}>
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleEmail(e, lead)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        {lead.status !== "won" && lead.status !== "lost" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleMoveToNextStage(e, lead)}
                            title="Zur nächsten Phase"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Details anzeigen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {lead.status !== "won" && (
                              <DropdownMenuItem onClick={(e) => handleMarkAsWon(e as any, lead)}>
                                <Target className="h-4 w-4 mr-2 text-success" />
                                Als gewonnen markieren
                              </DropdownMenuItem>
                            )}
                            {lead.status !== "lost" && (
                              <DropdownMenuItem onClick={(e) => handleMarkAsLost(e as any, lead)}>
                                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                Als verloren markieren
                              </DropdownMenuItem>
                            )}
                              <DropdownMenuSeparator />
                              {canDelete('marketing') && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Möchten Sie "${lead.name}" wirklich löschen?`)) {
                                      deleteMutation.mutate(lead.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Löschen
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id);
            const stageValue = getStageValue(stage.id);
            const isDropTarget = dragOverStage === stage.id && draggedLead?.status !== stage.id;
            
            return (
              <div 
                key={stage.id} 
                className="min-w-[300px] flex-shrink-0"
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/30">
                  <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                  <h3 className="font-semibold">{stage.label}</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {stageLeads.length}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-3 px-2">
                  CHF {stageValue.toLocaleString("de-CH")}
                </div>
                <div 
                  className={cn(
                    "space-y-3 min-h-[200px] p-2 rounded-lg border border-dashed transition-all duration-200",
                    isDropTarget 
                      ? "bg-primary/10 border-primary ring-2 ring-primary/20" 
                      : "bg-muted/10 border-border"
                  )}
                >
                  {stageLeads.length === 0 ? (
                    <div className={cn(
                      "text-center text-sm py-8 transition-colors",
                      isDropTarget ? "text-primary" : "text-muted-foreground"
                    )}>
                      {isDropTarget ? "Hier ablegen" : "Keine Leads"}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <Card 
                        key={lead.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "cursor-grab hover:shadow-md transition-all group active:cursor-grabbing",
                          draggedLead?.id === lead.id && "opacity-50 ring-2 ring-primary"
                        )}
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                              <div>
                                <h4 className="font-medium text-sm">{lead.name}</h4>
                                <p className="text-xs text-muted-foreground">{lead.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-warning fill-warning" />
                              <span className="text-xs font-medium">{lead.score}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              CHF {lead.value.toLocaleString("de-CH")}
                            </span>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {getNextStage(lead.status) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => handleMoveToNextStage(e, lead)}
                                  title={`Nach "${pipelineStages.find(s => s.id === getNextStage(lead.status))?.label}" verschieben`}
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {pipelineStages.map((s) => (
                                    <DropdownMenuItem 
                                      key={s.id}
                                      onClick={() => handleChangeStatus(lead.id, s.id)}
                                      disabled={lead.status === s.id}
                                    >
                                      <div className={cn("w-2 h-2 rounded-full mr-2", s.color)} />
                                      {s.label}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={(e) => handleMarkAsWon(e as any, lead)}>
                                    <Target className="h-4 w-4 mr-2 text-success" />
                                    Gewonnen
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => handleMarkAsLost(e as any, lead)}>
                                    <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                    Verloren
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {canDelete('marketing') && (
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`Möchten Sie "${lead.name}" wirklich löschen?`)) {
                                          deleteMutation.mutate(lead.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Löschen
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {(lead.assignedTo || "?")
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {lead.lastContact !== "-" 
                                ? new Date(lead.lastContact).toLocaleDateString("de-CH")
                                : "Kein Kontakt"
                              }
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
