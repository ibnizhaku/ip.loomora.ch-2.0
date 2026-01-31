import { useState } from "react";
import { Link } from "react-router-dom";
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
  Euro,
  TrendingUp
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

const trainings = [
  { id: 1, title: "Agile Projektmanagement", type: "Workshop", trainer: "Extern", date: "15.02.2024", duration: "2 Tage", participants: 8, maxParticipants: 12, status: "Geplant", cost: 2400 },
  { id: 2, title: "React Advanced Patterns", type: "Online-Kurs", trainer: "Intern", date: "01.02.2024", duration: "4 Wochen", participants: 5, maxParticipants: 10, status: "Laufend", cost: 0 },
  { id: 3, title: "Führungskräfte-Coaching", type: "Coaching", trainer: "Extern", date: "20.02.2024", duration: "1 Tag", participants: 4, maxParticipants: 6, status: "Geplant", cost: 1800 },
  { id: 4, title: "DSGVO Compliance", type: "E-Learning", trainer: "Extern", date: "10.01.2024", duration: "2 Stunden", participants: 24, maxParticipants: 30, status: "Abgeschlossen", cost: 500 },
  { id: 5, title: "AWS Cloud Practitioner", type: "Zertifizierung", trainer: "Extern", date: "01.03.2024", duration: "3 Tage", participants: 3, maxParticipants: 5, status: "Geplant", cost: 3500 },
];

const employeeTrainings = [
  { id: "1", name: "Anna Schmidt", completedTrainings: 5, plannedTrainings: 2, certificates: 3, hoursThisYear: 48 },
  { id: "2", name: "Thomas Müller", completedTrainings: 3, plannedTrainings: 1, certificates: 2, hoursThisYear: 32 },
  { id: "3", name: "Lisa Weber", completedTrainings: 4, plannedTrainings: 2, certificates: 1, hoursThisYear: 40 },
  { id: "4", name: "Michael Braun", completedTrainings: 6, plannedTrainings: 1, certificates: 4, hoursThisYear: 56 },
  { id: "5", name: "Sarah Koch", completedTrainings: 2, plannedTrainings: 3, certificates: 1, hoursThisYear: 24 },
];

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

const stats = [
  { title: "Schulungen 2024", value: "12", icon: GraduationCap },
  { title: "Teilnehmer", value: "44", icon: Users },
  { title: "Ø Stunden/MA", value: "40h", icon: Clock },
  { title: "Budget genutzt", value: "68%", icon: Euro },
];

const Training = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTrainings = trainings.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Schulungen</h1>
          <p className="text-muted-foreground">Verwalten Sie Weiterbildungen und Zertifizierungen</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schulung planen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weiterbildungsbudget 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">€8.200 von €12.000 verwendet</span>
            <span className="text-sm font-medium">68%</span>
          </div>
          <Progress value={68} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Verbleibend: €3.800</span>
            <span>5 geplante Schulungen: €7.700</span>
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
                    const TypeIcon = type.icon;
                    return (
                      <TableRow key={training.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{training.title}</p>
                            <p className="text-sm text-muted-foreground">{training.trainer}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={type.color}>
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
                          {training.cost > 0 ? `€${training.cost.toLocaleString()}` : "Kostenlos"}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>{training.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                              <DropdownMenuItem>Teilnehmer verwalten</DropdownMenuItem>
                              <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Absagen</DropdownMenuItem>
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
                      <TableRow key={emp.id}>
                        <TableCell>
                          <Link to={`/hr/${emp.id}`} className="font-medium hover:text-primary">
                            {emp.name}
                          </Link>
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
              { title: "Projektmanagement Basics", category: "Management", duration: "1 Tag", provider: "Haufe Akademie" },
              { title: "TypeScript für Fortgeschrittene", category: "Entwicklung", duration: "2 Tage", provider: "Codecademy" },
              { title: "Kommunikationstraining", category: "Soft Skills", duration: "1 Tag", provider: "Intern" },
              { title: "AWS Solutions Architect", category: "Cloud", duration: "5 Tage", provider: "AWS" },
              { title: "Scrum Master Zertifizierung", category: "Agile", duration: "2 Tage", provider: "Scrum.org" },
              { title: "Design Thinking Workshop", category: "Innovation", duration: "1 Tag", provider: "IDEO" },
            ].map((course, index) => (
              <Card key={index} className="hover:border-primary/30 transition-colors cursor-pointer">
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
