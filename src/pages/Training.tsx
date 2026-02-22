import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Plus, 
  Search, 
  Filter,
  GraduationCap,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  BookOpen,
  Award,
  Video,
  MapPin,
  MoreHorizontal,
  TrendingUp,
  X,
  Edit,
  Trash2,
  Download,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { color: string; icon: any }> = {
  "Workshop": { color: "bg-primary/10 text-primary", icon: Users },
  "Online-Kurs": { color: "bg-info/10 text-info", icon: Video },
  "Coaching": { color: "bg-warning/10 text-warning", icon: GraduationCap },
  "E-Learning": { color: "bg-success/10 text-success", icon: BookOpen },
  "Zertifizierung": { color: "bg-destructive/10 text-destructive", icon: Award },
};

const statusConfig: Record<string, { color: string }> = {
  "Geplant": { color: "bg-info/10 text-info" },
  "Laufend": { color: "bg-warning/10 text-warning" },
  "Abgeschlossen": { color: "bg-success/10 text-success" },
  "Abgesagt": { color: "bg-destructive/10 text-destructive" },
};

const formatCHF = (amount: number) => {
  return amount.toLocaleString("de-CH", { minimumFractionDigits: 0 });
};

const Training = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: apiData } = useQuery({ queryKey: ["/training"], queryFn: () => api.get<any>("/training") });
  const trainingsList = apiData?.trainings || apiData?.data || [];
  const employeeTrainings = apiData?.employeeTrainings || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterTrainingStatus, setFilterTrainingStatus] = useState<string[]>([]);
  const [filterTrainingType, setFilterTrainingType] = useState<string[]>([]);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.put(`/training/${id}`, { status: "Abgesagt" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/training"] });
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.error("Schulung abgesagt");
    },
    onError: () => toast.error("Fehler beim Absagen"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/training/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/training"] });
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success("Schulung gelöscht");
    },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  const totalTrainings = trainingsList.length;
  const totalParticipants = trainingsList.reduce((sum: number, t: any) => sum + (t.participants || 0), 0);
  const avgHours = employeeTrainings.length > 0 ? Math.round(employeeTrainings.reduce((sum: number, e: any) => sum + (e.hoursThisYear || 0), 0) / employeeTrainings.length) : 0;
  const totalBudget = 15000;
  const usedBudget = trainingsList.reduce((sum: number, t: any) => sum + (t.cost || 0), 0);
  const budgetPercent = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0;
  const activeFilters = filterTrainingStatus.length + filterTrainingType.length;

  const handleStatClick = (filter: string | null) => {
    setStatusFilter(statusFilter === filter ? null : filter);
  };

  const resetFilters = () => {
    setFilterTrainingStatus([]);
    setFilterTrainingType([]);
  };

  const handleCancel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    cancelMutation.mutate(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Schulung wirklich löschen?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTrainings = trainingsList.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || 
      (statusFilter === "planned" && t.status === "Geplant") ||
      (statusFilter === "running" && t.status === "Laufend") ||
      (statusFilter === "completed" && t.status === "Abgeschlossen");
    const matchesFilterStatus = filterTrainingStatus.length === 0 || filterTrainingStatus.includes(t.status);
    const matchesFilterType = filterTrainingType.length === 0 || filterTrainingType.includes(t.type);
    return matchesSearch && matchesStatus && matchesFilterStatus && matchesFilterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Schulungen</h1>
          <p className="text-muted-foreground">Weiterbildungen und Zertifizierungen verwalten</p>
        </div>
        <Button onClick={() => navigate("/training/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Schulung planen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            !statusFilter && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleStatClick(null)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalTrainings}</div>
                <p className="text-sm text-muted-foreground">Schulungen 2024</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalParticipants}</div>
                <p className="text-sm text-muted-foreground">Teilnehmer</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-warning/50",
            statusFilter === "running" && "border-warning ring-2 ring-warning/20"
          )}
          onClick={() => handleStatClick("running")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{avgHours}h</div>
                <p className="text-sm text-muted-foreground">Ø Stunden/MA</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-success/50",
            statusFilter === "completed" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatClick("completed")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{budgetPercent}%</div>
                <p className="text-sm text-muted-foreground">Budget genutzt</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weiterbildungsbudget 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">CHF {formatCHF(usedBudget)} von CHF {formatCHF(totalBudget)} verwendet</span>
            <span className="text-sm font-medium">{budgetPercent}%</span>
          </div>
          <Progress value={budgetPercent} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Verbleibend: CHF {formatCHF(totalBudget - usedBudget)}</span>
            <span>{trainingsList.filter(t => t.status === "Geplant").length} geplante Schulungen</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trainings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trainings">Schulungen</TabsTrigger>
          <TabsTrigger value="employees">Mitarbeiter</TabsTrigger>
          <TabsTrigger value="catalog">Katalog</TabsTrigger>
        </TabsList>

        <TabsContent value="trainings" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Schulungen suchen..."
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
                    <Label className="text-sm font-medium">Status</Label>
                    {["Geplant", "Laufend", "Abgeschlossen", "Abgesagt"].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filterTrainingStatus.includes(status)}
                          onCheckedChange={(checked) => {
                            setFilterTrainingStatus(checked 
                              ? [...filterTrainingStatus, status]
                              : filterTrainingStatus.filter(s => s !== status)
                            );
                          }}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Art</Label>
                    {["Workshop", "E-Learning", "Coaching", "Zertifizierung"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filterTrainingType.includes(type)}
                          onCheckedChange={(checked) => {
                            setFilterTrainingType(checked 
                              ? [...filterTrainingType, type]
                              : filterTrainingType.filter(t => t !== type)
                            );
                          }}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                          {type}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schulung</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Dauer</TableHead>
                    <TableHead>Teilnehmer</TableHead>
                    <TableHead className="text-right">Kosten</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainings.map((training) => {
                    const type = typeConfig[training.type];
                    const status = statusConfig[training.status];
                    const TypeIcon = type?.icon || BookOpen;
                    return (
                      <TableRow 
                        key={training.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/training/${training.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium hover:text-primary">{training.title}</p>
                            <p className="text-sm text-muted-foreground">{training.trainer}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={type?.color || "bg-muted"}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {training.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{training.date}</TableCell>
                        <TableCell>{training.duration}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{training.participants}/{training.maxParticipants}</span>
                            <Progress 
                              value={(training.participants / training.maxParticipants) * 100} 
                              className="h-2 w-12" 
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {training.cost > 0 ? `CHF ${formatCHF(training.cost)}` : "Kostenlos"}
                        </TableCell>
                        <TableCell>
                          <Badge className={status?.color}>{training.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/training/${training.id}`); }}>
                                Details anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/training/${training.id}?tab=participants`); }}>
                                <Users className="mr-2 h-4 w-4" />
                                Teilnehmer verwalten
                            </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/training/${training.id}?edit=1`); }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/training/${training.id}?tab=participants&add=true`); }}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Teilnehmer hinzufügen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); 
                                import("@/lib/api").then(m => m.downloadPdf('training' as any, training.id, `Schulung_${training.title}.pdf`));
                              }}>
                                <Download className="mr-2 h-4 w-4" />
                                PDF Export
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {training.status === "Geplant" && (
                                <DropdownMenuItem 
                                  className="text-warning"
                                  onClick={(e) => handleCancel(training.id, e)}
                                >
                                  Absagen
                                </DropdownMenuItem>
                              )}
                              {(training.status === "Abgesagt" || training.status === "Abgeschlossen") && (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => handleDelete(training.id, e)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Löschen
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Weiterbildungsübersicht nach Mitarbeiter</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead className="text-right">Abgeschlossen</TableHead>
                    <TableHead className="text-right">Geplant</TableHead>
                    <TableHead className="text-right">Zertifikate</TableHead>
                    <TableHead className="text-right">Stunden 2024</TableHead>
                    <TableHead>Fortschritt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeTrainings.map((emp) => {
                    const targetHours = 48;
                    const progressPercent = (emp.hoursThisYear / targetHours) * 100;
                    return (
                      <TableRow 
                        key={emp.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/hr/${emp.id}`)}
                      >
                        <TableCell>
                          <span className="font-medium hover:text-primary">
                            {emp.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{emp.completedTrainings}</TableCell>
                        <TableCell className="text-right text-info">{emp.plannedTrainings}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Award className="h-4 w-4 text-warning" />
                            {emp.certificates}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{emp.hoursThisYear}h</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={Math.min(progressPercent, 100)} className="h-2 w-20" />
                            <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Schweissen MIG/MAG Fortgeschritten", category: "Technik", duration: "3 Tage", provider: "SVBL" },
              { title: "CAD/CAM Metallbau", category: "Software", duration: "2 Tage", provider: "Autodesk" },
              { title: "Arbeitssicherheit Metallbau", category: "Sicherheit", duration: "1 Tag", provider: "SUVA" },
              { title: "Projektleitung im Metallbau", category: "Management", duration: "5 Tage", provider: "SMU" },
              { title: "Montage-Koordination", category: "Technik", duration: "2 Tage", provider: "Intern" },
              { title: "Qualitätsmanagement ISO 9001", category: "Qualität", duration: "2 Tage", provider: "SQS" },
            ].map((course, index) => (
              <Card 
                key={index} 
                className="hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => toast.info(`Kurs: ${course.title}`)}
              >
                <CardContent className="pt-6">
                  <Badge variant="outline" className="mb-3">{course.category}</Badge>
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{course.provider}</span>
                    <span>{course.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Training;
