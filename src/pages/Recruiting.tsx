import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Plus, 
  Search, 
  Filter,
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  FileText,
  MoreHorizontal,
  Star,
  Calendar,
  MapPin,
  ExternalLink,
  UserPlus,
  X,
  Copy,
  Trash2
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

const statusConfig: Record<string, { color: string }> = {
  "Aktiv": { color: "bg-success/10 text-success" },
  "Entwurf": { color: "bg-muted text-muted-foreground" },
  "Geschlossen": { color: "bg-muted text-muted-foreground" },
  "Neu": { color: "bg-info/10 text-info" },
  "In Prüfung": { color: "bg-warning/10 text-warning" },
  "Interview geplant": { color: "bg-primary/10 text-primary" },
  "Angebot gesendet": { color: "bg-success/10 text-success" },
  "Abgelehnt": { color: "bg-destructive/10 text-destructive" },
  "Eingestellt": { color: "bg-success/10 text-success" },
};

const Recruiting = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: apiData } = useQuery({ queryKey: ["/recruiting"], queryFn: () => api.get<any>("/recruiting") });
  const jobPostings = apiData?.jobPostings || [];
  const applicants: any[] = apiData?.applicants || [];
  const interviews = apiData?.interviews || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterSource, setFilterSource] = useState<string[]>([]);

  const openPositions = jobPostings.filter(j => j.status === "Aktiv").length;
  const totalApplicants = applicants.length;
  const inProgressApplicants = applicants.filter(a => 
    a.status === "In Prüfung" || a.status === "Interview geplant"
  ).length;
  const newThisWeek = applicants.filter(a => a.status === "Neu").length;
  const uniqueSources = Array.from(new Set(applicants.map((a: any) => String(a.source))));
  const activeFilters = filterStatus.length + filterSource.length;

  // API mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/recruiting/candidates/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/recruiting"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/recruiting/candidates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/recruiting"] });
      toast.success("Bewerbung gelöscht");
    },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  const handleStatClick = (filter: string | null) => {
    setStatusFilter(statusFilter === filter ? null : filter);
  };

  const resetFilters = () => {
    setFilterStatus([]);
    setFilterSource([]);
  };

  const handleSendOffer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const applicant = applicants.find((a: any) => a.id === id);
    updateStatusMutation.mutate({ id, status: "Angebot gesendet" }, {
      onSuccess: () => toast.success(`Angebot an ${applicant?.name} gesendet`),
    });
  };

  const handleReject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const applicant = applicants.find((a: any) => a.id === id);
    updateStatusMutation.mutate({ id, status: "Abgelehnt" }, {
      onSuccess: () => toast.info(`Absage an ${applicant?.name} gesendet`),
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const filteredApplicants = applicants.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === "new" && a.status === "Neu") ||
      (statusFilter === "progress" && (a.status === "In Prüfung" || a.status === "Interview geplant"));
    
    const matchesFilterStatus = filterStatus.length === 0 || filterStatus.includes(a.status);
    const matchesFilterSource = filterSource.length === 0 || filterSource.includes(a.source);
    
    return matchesSearch && matchesStatus && matchesFilterStatus && matchesFilterSource;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Recruiting</h1>
          <p className="text-muted-foreground">Stellenausschreibungen und Bewerbermanagement</p>
        </div>
        <Button onClick={() => navigate("/recruiting/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Stelle ausschreiben
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
                <div className="text-2xl font-bold">{openPositions}</div>
                <p className="text-sm text-muted-foreground">Offene Stellen</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalApplicants}</div>
                <p className="text-sm text-muted-foreground">Bewerber gesamt</p>
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
            statusFilter === "progress" && "border-warning ring-2 ring-warning/20"
          )}
          onClick={() => handleStatClick("progress")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{inProgressApplicants}</div>
                <p className="text-sm text-muted-foreground">In Bearbeitung</p>
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
            statusFilter === "new" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatClick("new")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-success">+{newThisWeek}</div>
                <p className="text-sm text-muted-foreground">Neue Bewerbungen</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <UserPlus className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews */}
      {interviews.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Anstehende Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {interviews.map((interview) => (
                <div 
                  key={interview.id} 
                  className="flex items-center gap-4 p-4 rounded-lg bg-background border cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => toast.info(`Interview mit ${interview.applicant} am ${interview.date} um ${interview.time}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{interview.applicant}</p>
                    <p className="text-sm text-muted-foreground">{interview.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{interview.date}</p>
                    <p className="text-sm text-muted-foreground">{interview.time} • {interview.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="applicants" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applicants">Bewerber</TabsTrigger>
          <TabsTrigger value="positions">Stellenausschreibungen</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="applicants" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Bewerber suchen..."
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
                    {["Neu", "In Prüfung", "Interview geplant", "Angebot gesendet", "Abgelehnt"].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filterStatus.includes(status)}
                          onCheckedChange={(checked) => {
                            setFilterStatus(checked 
                              ? [...filterStatus, status]
                              : filterStatus.filter(s => s !== status)
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
                    <Label className="text-sm font-medium">Quelle</Label>
                    {uniqueSources.map((source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox
                          id={`source-${source}`}
                          checked={filterSource.includes(source)}
                          onCheckedChange={(checked) => {
                            setFilterSource(checked 
                              ? [...filterSource, source]
                              : filterSource.filter(s => s !== source)
                            );
                          }}
                        />
                        <Label htmlFor={`source-${source}`} className="text-sm font-normal cursor-pointer">
                          {source}
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
                    <TableHead>Bewerber</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Erfahrung</TableHead>
                    <TableHead>Quelle</TableHead>
                    <TableHead>Bewertung</TableHead>
                    <TableHead>Beworben am</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.map((applicant) => {
                    const status = statusConfig[applicant.status];
                    return (
                      <TableRow 
                        key={applicant.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/recruiting/${applicant.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {applicant.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium hover:text-primary">{applicant.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{applicant.position}</TableCell>
                        <TableCell>{applicant.experience}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{applicant.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span>{applicant.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{applicant.appliedDate}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>{applicant.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/recruiting/${applicant.id}`); }}>
                                <FileText className="h-4 w-4 mr-2" />
                                Bewerbung anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success("Interview wird geplant..."); }}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Interview planen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info("E-Mail-Dialog geöffnet"); }}>
                                <Mail className="h-4 w-4 mr-2" />
                                E-Mail senden
                              </DropdownMenuItem>
                              {applicant.status !== "Angebot gesendet" && applicant.status !== "Abgelehnt" && (
                                <DropdownMenuItem 
                                  className="text-success"
                                  onClick={(e) => handleSendOffer(applicant.id, e)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Angebot senden
                                </DropdownMenuItem>
                              )}
                              {applicant.status !== "Abgelehnt" && (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => handleReject(applicant.id, e)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Ablehnen
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

        <TabsContent value="positions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stellentitel</TableHead>
                    <TableHead>Abteilung</TableHead>
                    <TableHead>Standort</TableHead>
                    <TableHead className="text-right">Bewerber</TableHead>
                    <TableHead>Veröffentlicht</TableHead>
                    <TableHead>Bewerbungsfrist</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPostings.map((job) => {
                    const status = statusConfig[job.status];
                    return (
                      <TableRow 
                        key={job.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toast.info(`Stelle: ${job.title}`)}
                      >
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {job.location}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{job.applicants}</TableCell>
                        <TableCell className="text-muted-foreground">{job.postedDate}</TableCell>
                        <TableCell>{job.deadline}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>{job.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info("Bearbeitungsmodus"); }}>Bearbeiten</DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success("Stellenanzeige geöffnet"); }}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Stellenanzeige öffnen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success("Stelle dupliziert"); }}>Duplizieren</DropdownMenuItem>
                              {job.status === "Aktiv" && (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => { e.stopPropagation(); toast.info("Stelle geschlossen"); }}
                                >
                                  Schließen
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

        <TabsContent value="pipeline">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { stage: "Neu", count: applicants.filter(a => a.status === "Neu").length, color: "bg-info" },
              { stage: "In Prüfung", count: applicants.filter(a => a.status === "In Prüfung").length, color: "bg-warning" },
              { stage: "Interview", count: applicants.filter(a => a.status === "Interview geplant").length, color: "bg-primary" },
              { stage: "Angebot", count: applicants.filter(a => a.status === "Angebot gesendet").length, color: "bg-success" },
              { stage: "Abgelehnt", count: applicants.filter(a => a.status === "Abgelehnt").length, color: "bg-destructive" },
            ].map((stage) => (
              <Card key={stage.stage} className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <CardTitle className="text-sm">{stage.stage}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stage.count}</p>
                  <p className="text-sm text-muted-foreground">Bewerber</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Recruiting;
