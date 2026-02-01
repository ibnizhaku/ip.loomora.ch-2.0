import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

const leads: Lead[] = [
  {
    id: "1",
    name: "Thomas Müller",
    company: "TechStart GmbH",
    email: "t.mueller@techstart.ch",
    phone: "+41 44 123 45 67",
    location: "Zürich",
    source: "Website",
    status: "qualified",
    score: 85,
    value: 25000,
    assignedTo: "Anna Schmidt",
    createdAt: "2024-01-15",
    lastContact: "2024-01-18",
  },
  {
    id: "2",
    name: "Lisa Weber",
    company: "Digital Solutions AG",
    email: "l.weber@digitalsolutions.ch",
    phone: "+41 31 987 65 43",
    location: "Bern",
    source: "Messe",
    status: "proposal",
    score: 92,
    value: 45000,
    assignedTo: "Max Bauer",
    createdAt: "2024-01-10",
    lastContact: "2024-01-19",
  },
  {
    id: "3",
    name: "Michael Schneider",
    company: "Innovation Labs",
    email: "m.schneider@innovationlabs.ch",
    phone: "+41 61 456 78 90",
    location: "Basel",
    source: "Empfehlung",
    status: "new",
    score: 65,
    value: 15000,
    assignedTo: "Anna Schmidt",
    createdAt: "2024-01-18",
    lastContact: "-",
  },
  {
    id: "4",
    name: "Sandra Fischer",
    company: "Cloud Systems KG",
    email: "s.fischer@cloudsystems.ch",
    phone: "+41 22 234 56 78",
    location: "Genf",
    source: "Google Ads",
    status: "negotiation",
    score: 88,
    value: 38000,
    assignedTo: "Max Bauer",
    createdAt: "2024-01-05",
    lastContact: "2024-01-19",
  },
  {
    id: "5",
    name: "Peter Wagner",
    company: "Smart Factory GmbH",
    email: "p.wagner@smartfactory.ch",
    phone: "+41 71 345 67 89",
    location: "St. Gallen",
    source: "LinkedIn",
    status: "contacted",
    score: 72,
    value: 22000,
    assignedTo: "Anna Schmidt",
    createdAt: "2024-01-12",
    lastContact: "2024-01-17",
  },
];

const pipelineStages = [
  { id: "new", label: "Neu", color: "bg-muted" },
  { id: "contacted", label: "Kontaktiert", color: "bg-info" },
  { id: "qualified", label: "Qualifiziert", color: "bg-primary" },
  { id: "proposal", label: "Angebot", color: "bg-warning" },
  { id: "negotiation", label: "Verhandlung", color: "bg-orange-500" },
  { id: "won", label: "Gewonnen", color: "bg-success" },
];

const statusStyles: Record<string, string> = {
  new: "bg-muted text-muted-foreground",
  contacted: "bg-info/10 text-info",
  qualified: "bg-primary/10 text-primary",
  proposal: "bg-warning/10 text-warning",
  negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

const getStatusLabel = (status: string) => {
  const stage = pipelineStages.find((s) => s.id === status);
  return stage?.label || status;
};

export default function Leads() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const totalValue = leads.reduce((sum, l) => sum + l.value, 0);
  const avgScore = leads.reduce((sum, l) => sum + l.score, 0) / leads.length;
  const newLeadsCount = leads.filter(l => l.status === "new").length;

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getLeadsByStage = (stage: string) => filteredLeads.filter((l) => l.status === stage);

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
          <Button onClick={() => navigate("/leads/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Lead
          </Button>
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

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Lead oder Firma suchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {statusFilter !== "all" && (
          <Button variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
            Filter zurücksetzen
          </Button>
        )}
      </div>

      {view === "list" ? (
        <div className="grid gap-4">
          {filteredLeads.map((lead) => (
            <Card 
              key={lead.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {lead.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{lead.name}</h3>
                        <Badge className={statusStyles[lead.status]}>
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
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="min-w-[280px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <h3 className="font-semibold">{stage.label}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {getLeadsByStage(stage.id).length}
                </Badge>
              </div>
              <div className="space-y-3">
                {getLeadsByStage(stage.id).map((lead) => (
                  <Card 
                    key={lead.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{lead.name}</h4>
                          <p className="text-xs text-muted-foreground">{lead.company}</p>
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
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {lead.assignedTo
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
