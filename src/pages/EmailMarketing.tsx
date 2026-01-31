import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Mail,
  Send,
  Eye,
  MousePointer,
  Users,
  Calendar,
  Clock,
  FileText,
  Copy,
  Trash2,
  BarChart3,
} from "lucide-react";

const newsletters = [
  {
    id: "1",
    subject: "Herbst-Angebote 2024 - Bis zu 40% sparen!",
    status: "sent",
    sentAt: "2024-01-15 10:00",
    recipients: 12500,
    opens: 4200,
    clicks: 890,
    unsubscribes: 23,
    bounces: 45,
  },
  {
    id: "2",
    subject: "Neues Produkt: Innovation X Pro",
    status: "sent",
    sentAt: "2024-01-10 14:30",
    recipients: 12450,
    opens: 3800,
    clicks: 720,
    unsubscribes: 15,
    bounces: 38,
  },
  {
    id: "3",
    subject: "Wochenend-Special: Nur dieses Wochenende",
    status: "scheduled",
    sentAt: "2024-01-20 09:00",
    recipients: 12400,
    opens: 0,
    clicks: 0,
    unsubscribes: 0,
    bounces: 0,
  },
  {
    id: "4",
    subject: "Newsletter KW 4 - Branchen-News",
    status: "draft",
    sentAt: "-",
    recipients: 12400,
    opens: 0,
    clicks: 0,
    unsubscribes: 0,
    bounces: 0,
  },
];

const templates = [
  { id: "1", name: "Produkt-Launch", category: "Marketing", uses: 45 },
  { id: "2", name: "Newsletter Standard", category: "Newsletter", uses: 128 },
  { id: "3", name: "Rabatt-Aktion", category: "Sales", uses: 67 },
  { id: "4", name: "Willkommens-Mail", category: "Onboarding", uses: 234 },
  { id: "5", name: "Event-Einladung", category: "Events", uses: 23 },
];

const lists = [
  { id: "1", name: "Alle Abonnenten", subscribers: 12500, active: 12200, growth: "+245" },
  { id: "2", name: "Premium-Kunden", subscribers: 3400, active: 3350, growth: "+67" },
  { id: "3", name: "Interessenten", subscribers: 5600, active: 5200, growth: "+189" },
  { id: "4", name: "Inaktive Kunden", subscribers: 2800, active: 1200, growth: "-45" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "sent":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "scheduled":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "draft":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function EmailMarketing() {
  const [searchTerm, setSearchTerm] = useState("");

  const totalSent = newsletters.filter((n) => n.status === "sent").reduce((sum, n) => sum + n.recipients, 0);
  const totalOpens = newsletters.reduce((sum, n) => sum + n.opens, 0);
  const totalClicks = newsletters.reduce((sum, n) => sum + n.clicks, 0);
  const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
  const avgClickRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">E-Mail Marketing</h1>
          <p className="text-muted-foreground">
            Newsletter und E-Mail-Kampagnen verwalten
          </p>
        </div>
        <Button>
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
            <div className="text-2xl font-bold">12.500</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesendet (Monat)</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString("de-DE")}</div>
            <p className="text-xs text-muted-foreground">
              {newsletters.filter((n) => n.status === "sent").length} Kampagnen
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
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
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
                {newsletters.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {newsletter.subject}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(newsletter.status)} variant="secondary">
                        {newsletter.status === "sent" && "Gesendet"}
                        {newsletter.status === "scheduled" && "Geplant"}
                        {newsletter.status === "draft" && "Entwurf"}
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
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Clock className="h-3 w-3" />
                          {newsletter.sentAt}
                        </div>
                      )}
                      {newsletter.status === "draft" && "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {newsletter.recipients.toLocaleString("de-DE")}
                    </TableCell>
                    <TableCell className="text-right">
                      {newsletter.opens > 0 ? newsletter.opens.toLocaleString("de-DE") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {newsletter.clicks > 0 ? newsletter.clicks.toLocaleString("de-DE") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {newsletter.opens > 0
                        ? `${((newsletter.opens / newsletter.recipients) * 100).toFixed(1)}%`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Copy className="h-4 w-4" />
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
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
                    <Button size="sm">Verwenden</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed hover:shadow-md transition-shadow cursor-pointer">
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
              <Card key={list.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{list.name}</CardTitle>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Gesamt</p>
                      <p className="text-2xl font-bold">{list.subscribers.toLocaleString("de-DE")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aktiv</p>
                      <p className="text-2xl font-bold">{list.active.toLocaleString("de-DE")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Wachstum</p>
                      <p className={`text-2xl font-bold ${list.growth.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
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
          <Card>
            <CardHeader>
              <CardTitle>E-Mail Automation</CardTitle>
              <CardDescription>
                Automatisierte E-Mail-Workflows erstellen und verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Willkommens-Serie", status: "active", sent: 1234, trigger: "Neue Anmeldung" },
                  { name: "Warenkorb-Abbruch", status: "active", sent: 567, trigger: "Warenkorb verlassen" },
                  { name: "Reaktivierung", status: "paused", sent: 234, trigger: "60 Tage inaktiv" },
                  { name: "Geburtstags-Mail", status: "active", sent: 89, trigger: "Geburtstag" },
                ].map((automation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${automation.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                      <div>
                        <h4 className="font-medium">{automation.name}</h4>
                        <p className="text-sm text-muted-foreground">Trigger: {automation.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{automation.sent}</p>
                        <p className="text-xs text-muted-foreground">E-Mails gesendet</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Bearbeiten
                      </Button>
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
