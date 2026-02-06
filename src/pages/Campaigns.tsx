import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Herbst-Sale 2024",
    type: "email",
    status: "active",
    startDate: "2024-09-01",
    endDate: "2024-09-30",
    budget: 5000,
    spent: 3200,
    reach: 45000,
    clicks: 2340,
    conversions: 156,
    revenue: 23400,
  },
  {
    id: "2",
    name: "Newsletter Q4",
    type: "email",
    status: "active",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    budget: 2000,
    spent: 450,
    reach: 12000,
    clicks: 890,
    conversions: 45,
    revenue: 6750,
  },
  {
    id: "3",
    name: "Social Media Push",
    type: "social",
    status: "paused",
    startDate: "2024-08-15",
    endDate: "2024-10-15",
    budget: 8000,
    spent: 4500,
    reach: 125000,
    clicks: 5600,
    conversions: 234,
    revenue: 35100,
  },
  {
    id: "4",
    name: "Google Ads Winter",
    type: "ppc",
    status: "draft",
    startDate: "2024-11-01",
    endDate: "2024-12-31",
    budget: 15000,
    spent: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
  },
  {
    id: "5",
    name: "Influencer Kooperation",
    type: "influencer",
    status: "completed",
    startDate: "2024-07-01",
    endDate: "2024-08-31",
    budget: 10000,
    spent: 10000,
    reach: 250000,
    clicks: 12500,
    conversions: 420,
    revenue: 63000,
  },
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "draft" | "completed">("all");
  const [activeTab, setActiveTab] = useState("all");
  const [activeStatCard, setActiveStatCard] = useState<"budget" | "revenue" | "conversions" | "active" | null>(null);

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const activeCount = campaigns.filter((c) => c.status === "active").length;

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
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
              CHF {totalBudget.toLocaleString("de-CH")}
            </div>
            <Progress value={(totalSpent / totalBudget) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              CHF {totalSpent.toLocaleString("de-CH")} ausgegeben ({((totalSpent / totalBudget) * 100).toFixed(0)}%)
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
              CHF {totalRevenue.toLocaleString("de-CH")}
            </div>
            <p className="text-xs text-muted-foreground">
              ROI: {((totalRevenue / totalSpent - 1) * 100).toFixed(0)}%
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
              Ø CHF {(totalSpent / totalConversions).toFixed(2)} pro Conversion
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
                      <Badge className={statusStyles[campaign.status]}>
                        {statusLabels[campaign.status]}
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
                        CHF {campaign.spent.toLocaleString("de-CH")} / {campaign.budget.toLocaleString("de-CH")}
                      </div>
                      <Progress 
                        value={(campaign.spent / campaign.budget) * 100} 
                        className="mt-1 h-1" 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.reach.toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell className="text-right">{campaign.conversions}</TableCell>
                    <TableCell className="text-right font-medium">
                      CHF {campaign.revenue.toLocaleString("de-CH")}
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
