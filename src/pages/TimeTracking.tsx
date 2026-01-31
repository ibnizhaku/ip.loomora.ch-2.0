import { useState } from "react";
import {
  Play,
  Pause,
  Plus,
  Clock,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  duration: number; // in minutes
  date: string;
  status: "running" | "completed";
}

const timeEntries: TimeEntry[] = [
  {
    id: "1",
    project: "E-Commerce Platform",
    task: "Frontend Development",
    duration: 240,
    date: "2024-02-01",
    status: "completed",
  },
  {
    id: "2",
    project: "Mobile Banking App",
    task: "API Integration",
    duration: 180,
    date: "2024-02-01",
    status: "completed",
  },
  {
    id: "3",
    project: "E-Commerce Platform",
    task: "Bug Fixing",
    duration: 90,
    date: "2024-02-01",
    status: "running",
  },
  {
    id: "4",
    project: "Dashboard Redesign",
    task: "UI Design",
    duration: 300,
    date: "2024-01-31",
    status: "completed",
  },
  {
    id: "5",
    project: "CRM Integration",
    task: "Testing",
    duration: 120,
    date: "2024-01-31",
    status: "completed",
  },
];

const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const weekHours = [6.5, 8, 7.5, 8, 4, 0, 0];

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export default function TimeTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [currentProject, setCurrentProject] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  const todayTotal = timeEntries
    .filter((e) => e.date === "2024-02-01")
    .reduce((acc, e) => acc + e.duration, 0);

  const weekTotal = weekHours.reduce((acc, h) => acc + h, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Zeiterfassung
          </h1>
          <p className="text-muted-foreground">
            Erfassen und verwalten Sie Ihre Arbeitszeit
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Eintrag hinzufügen
        </Button>
      </div>

      {/* Timer Card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Was arbeitest du gerade?"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                className="flex-1"
              />
              <Select value={currentProject} onValueChange={setCurrentProject}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Projekt wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecommerce">E-Commerce Platform</SelectItem>
                  <SelectItem value="banking">Mobile Banking App</SelectItem>
                  <SelectItem value="dashboard">Dashboard Redesign</SelectItem>
                  <SelectItem value="crm">CRM Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display text-4xl font-bold tabular-nums">
                {formatDuration(elapsedTime)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Aktuelle Zeit</p>
            </div>
            <Button
              size="lg"
              className={cn(
                "h-14 w-14 rounded-full",
                isTracking
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-success hover:bg-success/90"
              )}
              onClick={() => setIsTracking(!isTracking)}
            >
              {isTracking ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Heute</p>
              <p className="text-2xl font-bold">{formatDuration(todayTotal)}</p>
            </div>
          </div>
          <Progress value={(todayTotal / 480) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round((todayTotal / 480) * 100)}% von 8h Ziel
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Calendar className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Diese Woche</p>
              <p className="text-2xl font-bold">{weekTotal}h</p>
            </div>
          </div>
          <Progress value={(weekTotal / 40) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round((weekTotal / 40) * 100)}% von 40h Ziel
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <BarChart3 className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Überstunden</p>
              <p className="text-2xl font-bold">+2.5h</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Diesen Monat</p>
        </div>
      </div>

      {/* Week Overview */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">Wochenübersicht</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">29. Jan - 4. Feb 2024</span>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => (
            <div key={day} className="text-center">
              <p className="text-sm text-muted-foreground mb-2">{day}</p>
              <div
                className={cn(
                  "h-24 rounded-lg flex items-end justify-center pb-2 transition-colors",
                  weekHours[index] > 0
                    ? "bg-primary/10"
                    : "bg-muted"
                )}
              >
                <div
                  className="w-8 rounded bg-primary transition-all"
                  style={{
                    height: `${(weekHours[index] / 8) * 100}%`,
                    minHeight: weekHours[index] > 0 ? "8px" : "0",
                  }}
                />
              </div>
              <p className="text-sm font-medium mt-2">
                {weekHours[index] > 0 ? `${weekHours[index]}h` : "-"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">
          Letzte Einträge
        </h3>

        <div className="space-y-3">
          {timeEntries.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-all animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    entry.status === "running"
                      ? "bg-success/10"
                      : "bg-muted"
                  )}
                >
                  <Clock
                    className={cn(
                      "h-5 w-5",
                      entry.status === "running"
                        ? "text-success"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <p className="font-medium">{entry.task}</p>
                  <p className="text-sm text-muted-foreground">{entry.project}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge
                  variant={entry.status === "running" ? "default" : "secondary"}
                  className={
                    entry.status === "running"
                      ? "bg-success text-success-foreground"
                      : ""
                  }
                >
                  {entry.status === "running" ? "Läuft" : "Abgeschlossen"}
                </Badge>
                <p className="font-display font-semibold tabular-nums">
                  {formatDuration(entry.duration)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
