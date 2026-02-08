import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
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
  Mail,
  Send,
  Eye,
  MousePointer,
  Users,
  Calendar,
  Clock,
  FileText,
  Copy,
  BarChart3,
  Edit,
  Trash2,
  Pause,
  Play,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Newsletter {
  id: string;
  subject: string;
  status: "sent" | "scheduled" | "draft";
  sentAt: string;
  recipients: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
}

const statusStyles = {
  sent: "bg-success/10 text-success",
  scheduled: "bg-info/10 text-info",
  draft: "bg-muted text-muted-foreground",
};

const statusLabels = {
  sent: "Gesendet",
  scheduled: "Geplant",
  draft: "Entwurf",
};

export default function EmailMarketing() {
  const navigate = useNavigate();
  const { data: apiData } = useQuery({ queryKey: ["/marketing"], queryFn: () => api.get<any>("/marketing") });
  const newsletters = apiData?.newsletters || apiData?.data || [];
  const templates = apiData?.templates || [];
  const lists = apiData?.lists || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "sent" | "scheduled" | "draft">("all");

  const totalSent = newsletters.filter((n) => n.status === "sent").reduce((sum, n) => sum + n.recipients, 0);
  const totalOpens = newsletters.reduce((sum, n) => sum + n.opens, 0);
  const totalClicks = newsletters.reduce((sum, n) => sum + n.clicks, 0);
  const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
  const avgClickRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;
  const sentCount = newsletters.filter((n) => n.status === "sent").length;

  const filteredNewsletters = newsletters.filter((newsletter) => {
    const matchesSearch = newsletter.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || newsletter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatCardClick = (filter: "all" | "sent") => {
    if (filter === "sent") {
      setStatusFilter(statusFilter === "sent" ? "all" : "sent");
    }
  };

  const handleDuplicate = (e: React.MouseEvent, newsletter: Newsletter) => {
    e.stopPropagation();
    toast.success(`E-Mail "${newsletter.subject}" dupliziert`);
  };

  const handleDelete = (e: React.MouseEvent, newsletter: Newsletter) => {
    e.stopPropagation();
    toast.success(`E-Mail "${newsletter.subject}" gelöscht`);
  };

  const handleEdit = (e: React.MouseEvent, newsletter: Newsletter) => {
    e.stopPropagation();
    toast.info(`E-Mail "${newsletter.subject}" wird bearbeitet`);
    navigate("/email-marketing/new");
  };

  const handleViewStats = (e: React.MouseEvent, newsletter: Newsletter) => {
    e.stopPropagation();
    toast.info(`Statistiken für "${newsletter.subject}"`);
  };

  const handleUseTemplate = (template: { name: string }) => {
    toast.success(`Vorlage "${template.name}" wird verwendet`);
    navigate("/email-marketing/new");
  };

  const handleDeleteTemplate = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    toast.success(`Vorlage "${name}" gelöscht`);
  };

  const handleEditTemplate = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    toast.info(`Vorlage "${name}" wird bearbeitet`);
  };

  const handleDeleteList = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    toast.success(`Liste "${name}" gelöscht`);
  };

  const handleExportList = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    toast.success(`Liste "${name}" wird exportiert`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">E-Mail Marketing</h1>
          <p className="text-muted-foreground">
            Newsletter und E-Mail-Kampagnen verwalten
          </p>
        </div>
        <Button onClick={() => navigate("/email-marketing/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Neue E-Mail
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnenten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12'500</div>
            <p className="text-xs text-muted-foreground">
              +245 diesen Monat
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Öffnungsrate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</div>
            <Progress value={avgOpenRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Klickrate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgClickRate.toFixed(1)}%</div>
            <Progress value={avgClickRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            statusFilter === "sent" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatCardClick("sent")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesendet (Monat)</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString("de-CH")}</div>
            <p className="text-xs text-muted-foreground">
              {sentCount} Kampagnen
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Kampagnen</TabsTrigger>
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
          <TabsTrigger value="lists">Listen</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kampagne suchen..."
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

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Betreff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gesendet</TableHead>
                  <TableHead className="text-right">Empfänger</TableHead>
                  <TableHead className="text-right">Öffnungen</TableHead>
                  <TableHead className="text-right">Klicks</TableHead>
                  <TableHead className="text-right">Öffnungsrate</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNewsletters.map((newsletter) => (
                  <TableRow 
                    key={newsletter.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toast.info(`Details für "${newsletter.subject}"`)}
                  >
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {newsletter.subject}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[newsletter.status]}>
                        {statusLabels[newsletter.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {newsletter.status === "sent" && (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {newsletter.sentAt}
                        </div>
                      )}
                      {newsletter.status === "scheduled" && (
                        <div className="flex items-center gap-1 text-sm text-info">
                          <Clock className="h-3 w-3" />
                          {newsletter.sentAt}
                        </div>
                      )}
                      {newsletter.status === "draft" && "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {newsletter.recipients.toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell className="text-right">
                      {newsletter.opens > 0 ? newsletter.opens.toLocaleString("de-CH") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {newsletter.clicks > 0 ? newsletter.clicks.toLocaleString("de-CH") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {newsletter.opens > 0
                        ? `${((newsletter.opens / newsletter.recipients) * 100).toFixed(1)}%`
                        : "-"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => handleViewStats(e, newsletter)}>
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDuplicate(e, newsletter)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleEdit(e, newsletter)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleDuplicate(e, newsletter)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplizieren
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleViewStats(e, newsletter)}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Statistiken
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, newsletter)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.category}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEditTemplate(e, template.name)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Verwenden
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteTemplate(e, template.name)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {template.uses}x verwendet
                    </span>
                    <Button size="sm" onClick={() => handleUseTemplate(template)}>
                      Verwenden
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card 
              className="border-dashed hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate("/email-marketing/new")}
            >
              <CardContent className="h-full flex flex-col items-center justify-center py-8">
                <Plus className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Neue Vorlage erstellen</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lists" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {lists.map((list) => (
              <Card key={list.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{list.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleExportList(e, list.name)}>
                          <Download className="h-4 w-4 mr-2" />
                          Exportieren
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteList(e, list.name)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Gesamt</p>
                      <p className="text-2xl font-bold">{list.subscribers.toLocaleString("de-CH")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aktiv</p>
                      <p className="text-2xl font-bold">{list.active.toLocaleString("de-CH")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Wachstum</p>
                      <p className={`text-2xl font-bold ${list.growth.startsWith("+") ? "text-success" : "text-destructive"}`}>
                        {list.growth}
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(list.active / list.subscribers) * 100} 
                    className="mt-4" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {((list.active / list.subscribers) * 100).toFixed(1)}% aktive Rate
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">E-Mail Automation</h2>
              <p className="text-sm text-muted-foreground">Automatisierte E-Mail-Workflows erstellen und verwalten</p>
            </div>
            <Button onClick={() => { toast.success("Neue Automation erstellen"); navigate("/email-marketing/new"); }}>
              <Plus className="mr-2 h-4 w-4" />
              Neue Automation
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  { name: "Willkommens-Serie", status: "active", sent: 1234, trigger: "Neue Anmeldung", openRate: 68 },
                  { name: "Warenkorb-Abbruch", status: "active", sent: 567, trigger: "Warenkorb verlassen", openRate: 45 },
                  { name: "Reaktivierung", status: "paused", sent: 234, trigger: "60 Tage inaktiv", openRate: 22 },
                  { name: "Geburtstags-Mail", status: "active", sent: 89, trigger: "Geburtstag", openRate: 72 },
                ].map((automation, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toast.info(`Automation "${automation.name}" bearbeiten`)}
                  >
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          toast.success(automation.status === "active" 
                            ? `"${automation.name}" pausiert` 
                            : `"${automation.name}" aktiviert`
                          ); 
                        }}
                      >
                        {automation.status === "active" ? (
                          <Pause className="h-4 w-4 text-warning" />
                        ) : (
                          <Play className="h-4 w-4 text-success" />
                        )}
                      </Button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{automation.name}</h4>
                          <Badge className={automation.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                            {automation.status === "active" ? "Aktiv" : "Pausiert"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Trigger: {automation.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{automation.sent.toLocaleString("de-CH")}</p>
                        <p className="text-xs text-muted-foreground">E-Mails gesendet</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{automation.openRate}%</p>
                        <p className="text-xs text-muted-foreground">Öffnungsrate</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info(`Bearbeite ${automation.name}`); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success(`"${automation.name}" dupliziert`); }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplizieren
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info(`Statistiken für "${automation.name}"`); }}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Statistiken
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); toast.success(`"${automation.name}" gelöscht`); }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
