import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const jobPostings = [
  { id: 1, title: "Senior Frontend Developer", department: "Entwicklung", location: "Berlin / Remote", applicants: 23, status: "Aktiv", postedDate: "10.01.2024", deadline: "28.02.2024" },
  { id: 2, title: "UX/UI Designer", department: "Design", location: "Berlin", applicants: 15, status: "Aktiv", postedDate: "15.01.2024", deadline: "15.03.2024" },
  { id: 3, title: "Project Manager", department: "Projektmanagement", location: "München", applicants: 8, status: "Entwurf", postedDate: "-", deadline: "-" },
  { id: 4, title: "DevOps Engineer", department: "IT", location: "Remote", applicants: 31, status: "Geschlossen", postedDate: "01.12.2023", deadline: "31.01.2024" },
];

const applicants = [
  { id: 1, name: "Julia Meier", position: "Senior Frontend Developer", rating: 4.5, status: "Neu", appliedDate: "28.01.2024", experience: "5 Jahre", source: "LinkedIn" },
  { id: 2, name: "Markus Hoffmann", position: "Senior Frontend Developer", rating: 4.0, status: "In Prüfung", appliedDate: "25.01.2024", experience: "7 Jahre", source: "Direktbewerbung" },
  { id: 3, name: "Sandra Klein", position: "UX/UI Designer", rating: 4.8, status: "Interview geplant", appliedDate: "22.01.2024", experience: "4 Jahre", source: "Indeed" },
  { id: 4, name: "Peter Wagner", position: "Senior Frontend Developer", rating: 3.5, status: "Abgelehnt", appliedDate: "20.01.2024", experience: "3 Jahre", source: "StepStone" },
  { id: 5, name: "Laura Fischer", position: "UX/UI Designer", rating: 4.2, status: "Angebot gesendet", appliedDate: "15.01.2024", experience: "6 Jahre", source: "Empfehlung" },
];

const interviews = [
  { id: 1, applicant: "Sandra Klein", position: "UX/UI Designer", date: "05.02.2024", time: "10:00", type: "Video-Interview", interviewer: "Lisa Weber" },
  { id: 2, applicant: "Markus Hoffmann", position: "Senior Frontend Developer", date: "06.02.2024", time: "14:00", type: "Vor-Ort", interviewer: "Anna Schmidt" },
];

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

const stats = [
  { title: "Offene Stellen", value: "2", icon: Briefcase },
  { title: "Bewerber gesamt", value: "46", icon: Users },
  { title: "In Bearbeitung", value: "12", icon: Clock },
  { title: "Diese Woche", value: "+8", icon: UserPlus },
];

const Recruiting = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplicants = applicants.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Recruiting</h1>
          <p className="text-muted-foreground">Verwalten Sie Stellenausschreibungen und Bewerber</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Stelle ausschreiben
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
                <div key={interview.id} className="flex items-center gap-4 p-4 rounded-lg bg-background border">
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
                      <TableRow key={applicant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {applicant.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{applicant.name}</span>
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
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Bewerbung anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Interview planen
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                E-Mail senden
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-success">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Angebot senden
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <XCircle className="h-4 w-4 mr-2" />
                                Ablehnen
                              </DropdownMenuItem>
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
                      <TableRow key={job.id}>
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
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Stellenanzeige öffnen
                              </DropdownMenuItem>
                              <DropdownMenuItem>Duplizieren</DropdownMenuItem>
                              {job.status === "Aktiv" && (
                                <DropdownMenuItem className="text-destructive">Schließen</DropdownMenuItem>
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
              { stage: "Neu", count: 8, color: "bg-info" },
              { stage: "In Prüfung", count: 5, color: "bg-warning" },
              { stage: "Interview", count: 3, color: "bg-primary" },
              { stage: "Angebot", count: 2, color: "bg-success" },
              { stage: "Eingestellt", count: 1, color: "bg-success" },
            ].map((stage) => (
              <Card key={stage.stage}>
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
