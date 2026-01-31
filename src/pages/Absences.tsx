import { useState } from "react";
import { Link } from "react-router-dom";
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
  CalendarDays,
  Users,
  AlertCircle
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
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const absenceRequests = [
  { id: 1, employee: "Thomas Müller", type: "Urlaub", from: "15.02.2024", to: "22.02.2024", days: 6, status: "Ausstehend", requestDate: "28.01.2024" },
  { id: 2, employee: "Lisa Weber", type: "Urlaub", from: "01.03.2024", to: "08.03.2024", days: 6, status: "Genehmigt", requestDate: "25.01.2024" },
  { id: 3, employee: "Sarah Koch", type: "Krank", from: "29.01.2024", to: "31.01.2024", days: 3, status: "Bestätigt", requestDate: "29.01.2024" },
  { id: 4, employee: "Michael Braun", type: "Fortbildung", from: "10.02.2024", to: "11.02.2024", days: 2, status: "Genehmigt", requestDate: "20.01.2024" },
  { id: 5, employee: "Anna Schmidt", type: "Urlaub", from: "18.03.2024", to: "29.03.2024", days: 10, status: "Ausstehend", requestDate: "30.01.2024" },
];

const employeeVacation = [
  { id: "1", name: "Max Keller", total: 30, taken: 5, planned: 0, remaining: 25, carryOver: 2 },
  { id: "2", name: "Anna Schmidt", total: 30, taken: 8, planned: 10, remaining: 12, carryOver: 0 },
  { id: "3", name: "Thomas Müller", total: 30, taken: 12, planned: 6, remaining: 12, carryOver: 3 },
  { id: "4", name: "Lisa Weber", total: 28, taken: 4, planned: 6, remaining: 18, carryOver: 0 },
  { id: "5", name: "Sarah Koch", total: 30, taken: 10, planned: 0, remaining: 20, carryOver: 5 },
  { id: "6", name: "Michael Braun", total: 28, taken: 2, planned: 0, remaining: 26, carryOver: 0 },
];

const calendarAbsences = [
  { employee: "Thomas Müller", type: "Urlaub", from: "15.02", to: "22.02", color: "bg-info" },
  { employee: "Lisa Weber", type: "Urlaub", from: "01.03", to: "08.03", color: "bg-info" },
  { employee: "Sarah Koch", type: "Krank", from: "29.01", to: "31.01", color: "bg-warning" },
];

const typeConfig: Record<string, { color: string; icon: any }> = {
  "Urlaub": { color: "bg-info/10 text-info", icon: Palmtree },
  "Krank": { color: "bg-warning/10 text-warning", icon: ThermometerSun },
  "Elternzeit": { color: "bg-primary/10 text-primary", icon: Baby },
  "Fortbildung": { color: "bg-success/10 text-success", icon: GraduationCap },
  "Sonderurlaub": { color: "bg-muted text-muted-foreground", icon: Calendar },
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Ausstehend": { color: "bg-warning/10 text-warning", icon: Clock },
  "Genehmigt": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Bestätigt": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Abgelehnt": { color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const stats = [
  { title: "Anträge offen", value: "2", icon: Clock, color: "text-warning" },
  { title: "Heute abwesend", value: "1", icon: Users, color: "text-info" },
  { title: "Diese Woche", value: "3", icon: CalendarDays, color: "text-muted-foreground" },
  { title: "Resturlaub (Ø)", value: "18.8", icon: Palmtree, color: "text-success" },
];

const Absences = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const pendingRequests = absenceRequests.filter(r => r.status === "Ausstehend");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Abwesenheiten</h1>
          <p className="text-muted-foreground">Verwalten Sie Urlaub, Krankheit und Sonderurlaub</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Abwesenheit eintragen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
            <Button size="sm">Anträge prüfen</Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Anträge</TabsTrigger>
          <TabsTrigger value="overview">Urlaubsübersicht</TabsTrigger>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
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
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Von</TableHead>
                    <TableHead>Bis</TableHead>
                    <TableHead className="text-right">Tage</TableHead>
                    <TableHead>Beantragt am</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absenceRequests.map((request) => {
                    const type = typeConfig[request.type] || typeConfig["Sonderurlaub"];
                    const status = statusConfig[request.status];
                    const TypeIcon = type.icon;
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {request.employee.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{request.employee}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={type.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {request.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.from}</TableCell>
                        <TableCell>{request.to}</TableCell>
                        <TableCell className="text-right font-medium">{request.days}</TableCell>
                        <TableCell className="text-muted-foreground">{request.requestDate}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {request.status === "Ausstehend" && (
                                <>
                                  <DropdownMenuItem className="text-success">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Genehmigen
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Ablehnen
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                              <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
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

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Urlaubskonten 2024</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead className="text-right">Anspruch</TableHead>
                    <TableHead className="text-right">Übertrag</TableHead>
                    <TableHead className="text-right">Genommen</TableHead>
                    <TableHead className="text-right">Geplant</TableHead>
                    <TableHead className="text-right">Verfügbar</TableHead>
                    <TableHead>Fortschritt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeVacation.map((emp) => {
                    const usedPercent = ((emp.taken + emp.planned) / (emp.total + emp.carryOver)) * 100;
                    return (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <Link to={`/hr/${emp.id}`} className="font-medium hover:text-primary">
                            {emp.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">{emp.total}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {emp.carryOver > 0 ? `+${emp.carryOver}` : "-"}
                        </TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Abwesenheitskalender</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-info" />
                    <span className="text-sm">Urlaub</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-warning" />
                    <span className="text-sm">Krank</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-success" />
                    <span className="text-sm">Fortbildung</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-primary" />
                    <span className="text-sm">Elternzeit</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {calendarAbsences.map((absence, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className={`h-10 w-1 rounded ${absence.color}`} />
                      <div className="flex-1">
                        <p className="font-medium">{absence.employee}</p>
                        <p className="text-sm text-muted-foreground">{absence.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{absence.from} - {absence.to}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 text-center">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Vollständigen Kalender öffnen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Absences;
