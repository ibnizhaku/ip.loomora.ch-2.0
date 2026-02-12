import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Megaphone,
  Mail,
  Target,
  TrendingUp,
  Users,
  MousePointer,
  Calendar,
  Play,
  Pause,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "social" | "ppc" | "influencer";
  status: "active" | "paused" | "draft" | "completed";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  reach: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

const statusStyles = {
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  draft: "bg-muted text-muted-foreground",
  completed: "bg-info/10 text-info",
};

const statusLabels = {
  active: "Aktiv",
  paused: "Pausiert",
  draft: "Entwurf",
  completed: "Abgeschlossen",
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "social":
      return <Users className="h-4 w-4" />;
    case "ppc":
      return <MousePointer className="h-4 w-4" />;
    case "influencer":
      return <Megaphone className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

export default function Campaigns() {
  const navigate = useNavigate();
  const { data: apiData } = useQuery({ queryKey: ["/marketing/campaigns"], queryFn: () => api.get<any>("/marketing/campaigns") });
  const campaigns = apiData?.data || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "draft" | "completed">("all");
  const [activeTab, setActiveTab] = useState("all");
  const [activeStatCard, setActiveStatCard] = useState<"budget" | "revenue" | "conversions" | "active" | null>(null);

  const totalBudget = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (Number(c.spent) || 0), 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + (Number(c.revenue) || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (Number(c.conversions) || 0), 0);
  const activeCount = campaigns.filter((c) => c.status === "active").length;

  const defaultStatus = { color: "bg-muted text-muted-foreground", label: "Unbekannt" } as const;

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = (campaign.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || campaign.status === activeTab;
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesTab && matchesStatus;
  });

  const handleStatCardClick = (card: "budget" | "revenue" | "conversions" | "active") => {
    if (activeStatCard === card) {
      setActiveStatCard(null);
      setStatusFilter("all");
      setActiveTab("all");
    } else {
      setActiveStatCard(card);
      if (card === "active") {
        setStatusFilter("active");
        setActiveTab("active");
      } else if (card === "budget") {
        // Show campaigns with high budget utilization (>50%)
        setStatusFilter("all");
        setActiveTab("all");
      } else if (card === "conversions") {
        // Show campaigns with conversions
        setStatusFilter("all");
        setActiveTab("all");
      } else if (card === "revenue") {
        // Show completed campaigns with revenue
        setStatusFilter("completed");
        setActiveTab("completed");
      }
    }
  };

  const handleToggleStatus = (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation();
    if (campaign.status === "active") {
      toast.success(`Kampagne "${campaign.name}" pausiert`);
    } else {
      toast.success(`Kampagne "${campaign.name}" aktiviert`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kampagnen</h1>
          <p className="text-muted-foreground">
            Marketing-Kampagnen verwalten und analysieren
          </p>
        </div>
        <Button onClick={() => navigate("/campaigns/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Kampagne
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            activeStatCard === "budget" && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleStatCardClick("budget")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtbudget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {(totalBudget || 0).toLocaleString("de-CH")}
            </div>
            <Progress value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              CHF {(totalSpent || 0).toLocaleString("de-CH")} ausgegeben ({totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%)
            </p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            activeStatCard === "revenue" && "border-info ring-2 ring-info/20"
          )}
          onClick={() => handleStatCardClick("revenue")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umsatz</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {(totalRevenue || 0).toLocaleString("de-CH")}
            </div>
            <p className="text-xs text-muted-foreground">
              ROI: {totalSpent > 0 ? ((totalRevenue / totalSpent - 1) * 100).toFixed(0) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-warning/50",
            activeStatCard === "conversions" && "border-warning ring-2 ring-warning/20"
          )}
          onClick={() => handleStatCardClick("conversions")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              Ø CHF {totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : "0.00"} pro Conversion
            </p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-success/50",
            activeStatCard === "active" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatCardClick("active")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Kampagnen</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              von {campaigns.length} gesamt
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="active">Aktiv</TabsTrigger>
            <TabsTrigger value="paused">Pausiert</TabsTrigger>
            <TabsTrigger value="draft">Entwurf</TabsTrigger>
            <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kampagne suchen..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kampagne</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Zeitraum</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Reichweite</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Umsatz</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow 
                    key={campaign.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(campaign.type)}
                        <span className="capitalize">{campaign.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={(statusStyles[campaign.status] || defaultStatus).color || defaultStatus.color}>
                        {statusLabels[campaign.status] || defaultStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(campaign.startDate).toLocaleDateString("de-CH")} -{" "}
                        {new Date(campaign.endDate).toLocaleDateString("de-CH")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        CHF {(campaign.spent || 0).toLocaleString("de-CH")} / {(campaign.budget || 0).toLocaleString("de-CH")}
                      </div>
                      <Progress 
                        value={campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0} 
                        className="mt-1 h-1" 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {(campaign.reach || 0).toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell className="text-right">{campaign.conversions || 0}</TableCell>
                    <TableCell className="text-right font-medium">
                      CHF {(campaign.revenue || 0).toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {campaign.status === "active" ? (
                          <Button variant="ghost" size="icon" onClick={(e) => handleToggleStatus(e, campaign)}>
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : campaign.status !== "completed" ? (
                          <Button variant="ghost" size="icon" onClick={(e) => handleToggleStatus(e, campaign)}>
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
