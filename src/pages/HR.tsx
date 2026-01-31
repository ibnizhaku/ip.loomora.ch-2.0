import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: "active" | "vacation" | "sick" | "inactive";
  startDate: string;
  avatar?: string;
}

const employees: Employee[] = [
  {
    id: "1",
    name: "Max Keller",
    position: "CEO",
    department: "Geschäftsführung",
    email: "m.keller@loomora.de",
    phone: "+49 170 1234567",
    status: "active",
    startDate: "15.01.2020",
  },
  {
    id: "2",
    name: "Anna Schmidt",
    position: "Senior Developer",
    department: "Entwicklung",
    email: "a.schmidt@loomora.de",
    phone: "+49 171 2345678",
    status: "active",
    startDate: "01.03.2021",
  },
  {
    id: "3",
    name: "Thomas Müller",
    position: "Project Manager",
    department: "Projektmanagement",
    email: "t.mueller@loomora.de",
    phone: "+49 172 3456789",
    status: "vacation",
    startDate: "15.06.2021",
  },
  {
    id: "4",
    name: "Lisa Weber",
    position: "UX Designer",
    department: "Design",
    email: "l.weber@loomora.de",
    phone: "+49 173 4567890",
    status: "active",
    startDate: "01.09.2022",
  },
  {
    id: "5",
    name: "Sarah Koch",
    position: "Marketing Manager",
    department: "Marketing",
    email: "s.koch@loomora.de",
    phone: "+49 174 5678901",
    status: "sick",
    startDate: "01.02.2023",
  },
  {
    id: "6",
    name: "Michael Braun",
    position: "Backend Developer",
    department: "Entwicklung",
    email: "m.braun@loomora.de",
    phone: "+49 175 6789012",
    status: "active",
    startDate: "15.04.2023",
  },
];

const statusConfig = {
  active: { label: "Aktiv", color: "bg-success/10 text-success" },
  vacation: { label: "Urlaub", color: "bg-info/10 text-info" },
  sick: { label: "Krank", color: "bg-warning/10 text-warning" },
  inactive: { label: "Inaktiv", color: "bg-muted text-muted-foreground" },
};

const departments = ["Alle", "Entwicklung", "Design", "Marketing", "Projektmanagement", "Geschäftsführung"];

export default function HR() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Alle");

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "Alle" || e.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Personalverwaltung
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Mitarbeiter und Teams
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Mitarbeiter hinzufügen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{employees.length}</p>
              <p className="text-sm text-muted-foreground">Mitarbeiter</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <UserCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {employees.filter((e) => e.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Aktiv</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Calendar className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {employees.filter((e) => e.status === "vacation").length}
              </p>
              <p className="text-sm text-muted-foreground">Im Urlaub</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <UserX className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {employees.filter((e) => e.status === "sick").length}
              </p>
              <p className="text-sm text-muted-foreground">Krank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Mitarbeiter suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {departments.map((dept) => (
            <Button
              key={dept}
              variant={selectedDepartment === dept ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDepartment(dept)}
              className="whitespace-nowrap"
            >
              {dept}
            </Button>
          ))}
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee, index) => (
          <div
            key={employee.id}
            className={cn(
              "group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-soft animate-fade-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-border">
                  <AvatarImage src={employee.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {employee.position}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profil anzeigen</DropdownMenuItem>
                  <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                  <DropdownMenuItem>Urlaub eintragen</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Deaktivieren
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={statusConfig[employee.status].color}>
                  {statusConfig[employee.status].label}
                </Badge>
                <Badge variant="outline">{employee.department}</Badge>
              </div>

              <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">
                    {employee.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Seit {employee.startDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
