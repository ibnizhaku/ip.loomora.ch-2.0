import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Plus,
  Clock,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  duration: number; // in minutes
  date: string;
  status: "running" | "completed";
}

const projects = [
  { id: "ecommerce", name: "E-Commerce Platform" },
  { id: "banking", name: "Mobile Banking App" },
  { id: "dashboard", name: "Dashboard Redesign" },
  { id: "crm", name: "CRM Integration" },
  { id: "internal", name: "Interne Aufgaben" },
];

const initialEntries: TimeEntry[] = [
  {
    id: "1",
    project: "E-Commerce Platform",
    task: "Frontend Development",
    duration: 240,
    date: format(new Date(), "yyyy-MM-dd"),
    status: "completed",
  },
  {
    id: "2",
    project: "Mobile Banking App",
    task: "API Integration",
    duration: 180,
    date: format(new Date(), "yyyy-MM-dd"),
    status: "completed",
  },
  {
    id: "3",
    project: "Dashboard Redesign",
    task: "UI Design",
    duration: 300,
    date: format(addDays(new Date(), -1), "yyyy-MM-dd"),
    status: "completed",
  },
  {
    id: "4",
    project: "CRM Integration",
    task: "Testing",
    duration: 120,
    date: format(addDays(new Date(), -1), "yyyy-MM-dd"),
    status: "completed",
  },
  {
    id: "5",
    project: "E-Commerce Platform",
    task: "Bug Fixing",
    duration: 90,
    date: format(addDays(new Date(), -2), "yyyy-MM-dd"),
    status: "completed",
  },
];

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function TimeTracking() {
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [currentProject, setCurrentProject] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    task: "",
    project: "",
    hours: "",
    minutes: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (isTracking) {
      startTimeRef.current = Date.now() - elapsedSeconds * 1000;
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedSeconds(elapsed);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking]);

  const handleStartStop = () => {
    if (isTracking) {
      // Stop tracking and save entry
      if (elapsedSeconds >= 60 && currentTask && currentProject) {
        const projectName = projects.find((p) => p.id === currentProject)?.name || currentProject;
        const newEntry: TimeEntry = {
          id: Date.now().toString(),
          project: projectName,
          task: currentTask,
          duration: Math.floor(elapsedSeconds / 60),
          date: format(new Date(), "yyyy-MM-dd"),
          status: "completed",
        };
        setEntries((prev) => [newEntry, ...prev]);
        toast.success("Zeiteintrag gespeichert", {
          description: `${currentTask} - ${formatDuration(Math.floor(elapsedSeconds / 60))}`,
        });
        setCurrentTask("");
        setCurrentProject("");
        setElapsedSeconds(0);
      } else if (elapsedSeconds < 60) {
        toast.error("Mindestens 1 Minute erforderlich");
        return;
      } else {
        toast.error("Bitte Aufgabe und Projekt angeben");
        return;
      }
    } else {
      // Start tracking
      if (!currentTask || !currentProject) {
        toast.error("Bitte Aufgabe und Projekt angeben");
        return;
      }
    }
    setIsTracking(!isTracking);
  };

  const handleAddManualEntry = () => {
    const hours = parseInt(manualEntry.hours) || 0;
    const minutes = parseInt(manualEntry.minutes) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes < 1) {
      toast.error("Bitte gültige Zeit eingeben");
      return;
    }
    if (!manualEntry.task || !manualEntry.project) {
      toast.error("Bitte Aufgabe und Projekt angeben");
      return;
    }

    const projectName = projects.find((p) => p.id === manualEntry.project)?.name || manualEntry.project;
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      project: projectName,
      task: manualEntry.task,
      duration: totalMinutes,
      date: manualEntry.date,
      status: "completed",
    };

    setEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));

    toast.success("Eintrag hinzugefügt", {
      description: `${manualEntry.task} - ${formatDuration(totalMinutes)}`,
    });

    setManualEntry({
      task: "",
      project: "",
      hours: "",
      minutes: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setDialogOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Eintrag gelöscht");
  };

  // Calculate stats
  const today = format(new Date(), "yyyy-MM-dd");
  const todayTotal = entries
    .filter((e) => e.date === today)
    .reduce((acc, e) => acc + e.duration, 0);

  // Week calculation
  const currentWeekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  const weekHours = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayMinutes = entries
      .filter((e) => e.date === dayStr)
      .reduce((acc, e) => acc + e.duration, 0);
    return Math.round((dayMinutes / 60) * 10) / 10;
  });

  const weekTotal = weekHours.reduce((acc, h) => acc + h, 0);

  // Monthly overtime (simplified calculation)
  const monthTotal = entries
    .filter((e) => {
      const entryDate = parseISO(e.date);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    })
    .reduce((acc, e) => acc + e.duration, 0);
  
  const workingDaysThisMonth = 22; // Simplified
  const expectedHours = workingDaysThisMonth * 8;
  const overtime = Math.round(((monthTotal / 60) - expectedHours) * 10) / 10;

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Eintrag hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Zeiteintrag hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Aufgabe</Label>
                <Input
                  placeholder="Was hast du gearbeitet?"
                  value={manualEntry.task}
                  onChange={(e) => setManualEntry({ ...manualEntry, task: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Projekt</Label>
                <Select
                  value={manualEntry.project}
                  onValueChange={(value) => setManualEntry({ ...manualEntry, project: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stunden</Label>
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    placeholder="0"
                    value={manualEntry.hours}
                    onChange={(e) => setManualEntry({ ...manualEntry, hours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minuten</Label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={manualEntry.minutes}
                    onChange={(e) => setManualEntry({ ...manualEntry, minutes: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={manualEntry.date}
                  onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleAddManualEntry} className="gap-2">
                  <Save className="h-4 w-4" />
                  Speichern
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                disabled={isTracking}
              />
              <Select value={currentProject} onValueChange={setCurrentProject} disabled={isTracking}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Projekt wählen" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isTracking && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                Aufnahme läuft für "{currentTask}"
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display text-4xl font-bold tabular-nums font-mono">
                {formatTime(elapsedSeconds)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isTracking ? "Läuft..." : "Bereit"}
              </p>
            </div>
            <Button
              size="lg"
              className={cn(
                "h-14 w-14 rounded-full transition-all",
                isTracking
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-success hover:bg-success/90"
              )}
              onClick={handleStartStop}
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
          <Progress value={Math.min((todayTotal / 480) * 100, 100)} className="h-2" />
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
              <p className="text-2xl font-bold">{weekTotal.toFixed(1)}h</p>
            </div>
          </div>
          <Progress value={Math.min((weekTotal / 40) * 100, 100)} className="h-2" />
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
              <p className={cn("text-2xl font-bold", overtime >= 0 ? "text-success" : "text-destructive")}>
                {overtime >= 0 ? "+" : ""}{overtime}h
              </p>
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
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset((prev) => prev - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[180px] text-center">
              {format(weekDays[0], "d. MMM", { locale: de })} - {format(weekDays[6], "d. MMM yyyy", { locale: de })}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setWeekOffset((prev) => prev + 1)}
              disabled={weekOffset >= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {weekOffset !== 0 && (
              <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
                Heute
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={index} className="text-center">
                <p className={cn(
                  "text-sm mb-2",
                  isToday ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {format(day, "EEE", { locale: de })}
                </p>
                <p className={cn(
                  "text-xs mb-2",
                  isToday ? "text-primary" : "text-muted-foreground"
                )}>
                  {format(day, "d.M.")}
                </p>
                <div
                  className={cn(
                    "h-24 rounded-lg flex items-end justify-center pb-2 transition-colors",
                    isToday ? "bg-primary/20 ring-2 ring-primary" : weekHours[index] > 0 ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <div
                    className="w-8 rounded bg-primary transition-all"
                    style={{
                      height: `${Math.min((weekHours[index] / 10) * 100, 100)}%`,
                      minHeight: weekHours[index] > 0 ? "8px" : "0",
                    }}
                  />
                </div>
                <p className={cn(
                  "text-sm font-medium mt-2",
                  isToday && "text-primary"
                )}>
                  {weekHours[index] > 0 ? `${weekHours[index]}h` : "-"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">
          Letzte Einträge
        </h3>

        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Noch keine Einträge vorhanden</p>
            <p className="text-sm">Starte den Timer oder füge einen Eintrag hinzu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 10).map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-all animate-fade-in group"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      entry.status === "running" ? "bg-success/10" : "bg-muted"
                    )}
                  >
                    <Clock
                      className={cn(
                        "h-5 w-5",
                        entry.status === "running" ? "text-success" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{entry.task}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.project} • {format(parseISO(entry.date), "d. MMM yyyy", { locale: de })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge
                    variant={entry.status === "running" ? "default" : "secondary"}
                    className={
                      entry.status === "running" ? "bg-success text-success-foreground" : ""
                    }
                  >
                    {entry.status === "running" ? "Läuft" : "Abgeschlossen"}
                  </Badge>
                  <p className="font-display font-semibold tabular-nums min-w-[80px] text-right">
                    {formatDuration(entry.duration)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
