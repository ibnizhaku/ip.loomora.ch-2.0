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
  Save,
  FileText,
  Eye,
  Users,
  User,
  Download,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { TimeEntriesTable, type TimeEntryRow, type ApprovalStatus } from "@/components/time-tracking/TimeEntriesTable";
import { TimeEntriesPDFPreview } from "@/components/time-tracking/TimeEntriesPDFPreview";
import { TimeEntriesPDFData, downloadTimeEntriesPDF } from "@/lib/pdf/time-entries";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  duration: number;
  date: string;
  status: "running" | "completed";
  approvalStatus: ApprovalStatus;
  employeeName?: string;
  employeeId?: string;
}

const projects = [
  { id: "ecommerce", name: "E-Commerce Platform" },
  { id: "banking", name: "Mobile Banking App" },
  { id: "dashboard", name: "Dashboard Redesign" },
  { id: "crm", name: "CRM Integration" },
  { id: "internal", name: "Interne Aufgaben" },
];

const employees = [
  { id: "1", name: "Max Mustermann" },
  { id: "2", name: "Anna Schmidt" },
  { id: "3", name: "Thomas Meier" },
  { id: "4", name: "Julia Weber" },
];

const mockTimeEntrys: TimeEntry[] = [
  {
    id: "1",
    project: "E-Commerce Platform",
    task: "Frontend Development",
    duration: 240,
    date: format(new Date(), "yyyy-MM-dd"),
    status: "completed",
    approvalStatus: "pending",
    employeeName: "Max Mustermann",
    employeeId: "1",
  },
  {
    id: "2",
    project: "Mobile Banking App",
    task: "API Integration",
    duration: 180,
    date: format(new Date(), "yyyy-MM-dd"),
    status: "completed",
    approvalStatus: "approved",
    employeeName: "Anna Schmidt",
    employeeId: "2",
  },
  {
    id: "3",
    project: "Dashboard Redesign",
    task: "UI Design",
    duration: 300,
    date: format(addDays(new Date(), -1), "yyyy-MM-dd"),
    status: "completed",
    approvalStatus: "approved",
    employeeName: "Max Mustermann",
    employeeId: "1",
  },
  {
    id: "4",
    project: "CRM Integration",
    task: "Testing",
    duration: 120,
    date: format(addDays(new Date(), -1), "yyyy-MM-dd"),
    status: "completed",
    approvalStatus: "rejected",
    employeeName: "Thomas Meier",
    employeeId: "3",
  },
  {
    id: "5",
    project: "E-Commerce Platform",
    task: "Bug Fixing",
    duration: 90,
    date: format(addDays(new Date(), -2), "yyyy-MM-dd"),
    status: "completed",
    approvalStatus: "pending",
    employeeName: "Julia Weber",
    employeeId: "4",
  },
  {
    id: "6",
    project: "Mobile Banking App",
    task: "Security Audit",
    duration: 360,
    date: format(addDays(new Date(), -3), "yyyy-MM-dd"),
    status: "completed",
    approvalStatus: "pending",
    employeeName: "Anna Schmidt",
    employeeId: "2",
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

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/time-entries"],
    queryFn: () => api.get<any>("/time-entries"),
  });
  const initialEntries = apiData?.data || mockTimeEntrys;
  const [currentTask, setCurrentTask] = useState("");
  const [currentProject, setCurrentProject] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my-entries");
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfEmployeeId, setPdfEmployeeId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [manualEntry, setManualEntry] = useState({
    task: "",
    project: "",
    hours: "",
    minutes: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Simulated current user (would come from auth context)
  const currentUserId = "1";
  const isAdmin = true; // Would be determined by user role

  // Filter entries
  const myEntries = entries.filter(e => e.employeeId === currentUserId);
  const allEntries = entries;

  const getFilteredEntries = (entriesList: TimeEntry[], forEmployeeId?: string | null) => {
    let filtered = entriesList;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(e => e.approvalStatus === statusFilter);
    }
    
    // Use specific employee filter if provided, otherwise use general filter
    const empFilter = forEmployeeId !== undefined ? forEmployeeId : employeeFilter;
    if (empFilter && empFilter !== "all") {
      filtered = filtered.filter(e => e.employeeId === empFilter);
    }
    
    return filtered;
  };

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
      if (elapsedSeconds >= 60 && currentTask && currentProject) {
        const projectName = projects.find((p) => p.id === currentProject)?.name || currentProject;
        const currentEmployee = employees.find(e => e.id === currentUserId);
        const newEntry: TimeEntry = {
          id: Date.now().toString(),
          project: projectName,
          task: currentTask,
          duration: Math.floor(elapsedSeconds / 60),
          date: format(new Date(), "yyyy-MM-dd"),
          status: "completed",
          approvalStatus: "pending",
          employeeName: currentEmployee?.name,
          employeeId: currentUserId,
        };
        setEntries((prev) => [newEntry, ...prev]);
        toast.success("Zeiteintrag gespeichert", {
          description: `${currentTask} - ${formatDuration(Math.floor(elapsedSeconds / 60))} (Genehmigung ausstehend)`,
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
    const currentEmployee = employees.find(e => e.id === currentUserId);
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      project: projectName,
      task: manualEntry.task,
      duration: totalMinutes,
      date: manualEntry.date,
      status: "completed",
      approvalStatus: "pending",
      employeeName: currentEmployee?.name,
      employeeId: currentUserId,
    };

    setEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));

    toast.success("Eintrag hinzugefügt", {
      description: `${manualEntry.task} - ${formatDuration(totalMinutes)} (Genehmigung ausstehend)`,
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
  };

  const handleApproveEntries = (ids: string[]) => {
    setEntries(prev => prev.map(e => 
      ids.includes(e.id) ? { ...e, approvalStatus: 'approved' as ApprovalStatus } : e
    ));
  };

  const handleRejectEntries = (ids: string[]) => {
    setEntries(prev => prev.map(e => 
      ids.includes(e.id) ? { ...e, approvalStatus: 'rejected' as ApprovalStatus } : e
    ));
  };

  // Calculate stats
  const today = format(new Date(), "yyyy-MM-dd");
  const todayTotal = myEntries
    .filter((e) => e.date === today)
    .reduce((acc, e) => acc + e.duration, 0);

  const currentWeekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  const weekHours = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayMinutes = myEntries
      .filter((e) => e.date === dayStr)
      .reduce((acc, e) => acc + e.duration, 0);
    return Math.round((dayMinutes / 60) * 10) / 10;
  });

  const weekTotal = weekHours.reduce((acc, h) => acc + h, 0);

  const monthTotal = myEntries
    .filter((e) => {
      const entryDate = parseISO(e.date);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    })
    .reduce((acc, e) => acc + e.duration, 0);
  
  const workingDaysThisMonth = 22;
  const expectedHours = workingDaysThisMonth * 8;
  const overtime = Math.round(((monthTotal / 60) - expectedHours) * 10) / 10;

  // Approval stats for admin
  const pendingCount = allEntries.filter(e => e.approvalStatus === 'pending').length;
  const approvedCount = allEntries.filter(e => e.approvalStatus === 'approved').length;
  const rejectedCount = allEntries.filter(e => e.approvalStatus === 'rejected').length;

  // PDF Data preparation
  const preparePDFData = (entriesForPdf: TimeEntry[], showEmployee: boolean, employeeId?: string | null): TimeEntriesPDFData => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    
    const totalMinutes = entriesForPdf.reduce((acc, e) => acc + e.duration, 0);
    const approvedMinutes = entriesForPdf.filter(e => e.approvalStatus === 'approved').reduce((acc, e) => acc + e.duration, 0);
    const pendingMinutes = entriesForPdf.filter(e => e.approvalStatus === 'pending').reduce((acc, e) => acc + e.duration, 0);
    const rejectedMinutes = entriesForPdf.filter(e => e.approvalStatus === 'rejected').reduce((acc, e) => acc + e.duration, 0);

    // Determine title based on context
    let title = "Meine Zeiterfassung";
    let subtitle: string | undefined;
    
    if (employeeId) {
      const employee = employees.find(e => e.id === employeeId);
      title = `Zeiterfassung - ${employee?.name || 'Mitarbeiter'}`;
      subtitle = `${entriesForPdf.length} Einträge`;
    } else if (showEmployee) {
      title = "Zeiterfassung - Alle Mitarbeiter";
      subtitle = `${entriesForPdf.length} Einträge`;
    }

    return {
      title,
      subtitle,
      dateRange: {
        start: format(monthStart, 'yyyy-MM-dd'),
        end: format(monthEnd, 'yyyy-MM-dd'),
      },
      entries: entriesForPdf.map(e => ({
        id: e.id,
        date: e.date,
        project: e.project,
        task: e.task,
        duration: e.duration,
        approvalStatus: e.approvalStatus,
        employeeName: e.employeeName,
      })),
      totalMinutes,
      approvedMinutes,
      pendingMinutes,
      rejectedMinutes,
      company: {
        name: "Loomora GmbH",
        address: "Musterstrasse 123, 8001 Zürich",
      },
      generatedBy: "Admin",
      showEmployee: showEmployee && !employeeId,
    };
  };

  const handleDownloadPDF = (employeeId?: string | null) => {
    let entriesForPdf: TimeEntry[];
    let showEmployee = false;
    
    if (employeeId) {
      // Single employee export
      entriesForPdf = getFilteredEntries(allEntries, employeeId);
      showEmployee = false;
    } else if (activeTab === "all-entries") {
      entriesForPdf = getFilteredEntries(allEntries);
      showEmployee = true;
    } else {
      entriesForPdf = getFilteredEntries(myEntries);
      showEmployee = false;
    }
    
    const pdfData = preparePDFData(entriesForPdf, showEmployee, employeeId);
    const employee = employeeId ? employees.find(e => e.id === employeeId) : null;
    const filename = employee 
      ? `Zeiterfassung_${employee.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`
      : undefined;
    downloadTimeEntriesPDF(pdfData, filename);
    toast.success("PDF heruntergeladen", {
      description: employee ? `Bericht für ${employee.name}` : undefined,
    });
  };

  const handlePreviewPDF = (employeeId?: string | null) => {
    setPdfEmployeeId(employeeId || null);
    setPdfPreviewOpen(true);
  };

  const getCurrentPDFData = () => {
    let entriesForPdf: TimeEntry[];
    let showEmployee = false;
    
    if (pdfEmployeeId) {
      entriesForPdf = getFilteredEntries(allEntries, pdfEmployeeId);
      showEmployee = false;
    } else if (activeTab === "all-entries") {
      entriesForPdf = getFilteredEntries(allEntries);
      showEmployee = true;
    } else {
      entriesForPdf = getFilteredEntries(myEntries);
      showEmployee = false;
    }
    
    return preparePDFData(entriesForPdf, showEmployee, pdfEmployeeId);
  };

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
        <div className="flex items-center gap-2">
          {/* PDF Vorschau Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Vorschau
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handlePreviewPDF(null)}>
                <FileText className="h-4 w-4 mr-2" />
                {activeTab === "all-entries" ? "Alle Mitarbeiter" : "Meine Einträge"}
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Einzelner Mitarbeiter
                  </DropdownMenuLabel>
                  {employees.map(emp => {
                    const empEntryCount = allEntries.filter(e => e.employeeId === emp.id).length;
                    return (
                      <DropdownMenuItem 
                        key={emp.id} 
                        onClick={() => handlePreviewPDF(emp.id)}
                        disabled={empEntryCount === 0}
                      >
                        <User className="h-4 w-4 mr-2" />
                        {emp.name}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {empEntryCount}
                        </Badge>
                      </DropdownMenuItem>
                    );
                  })}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* PDF Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                PDF Export
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleDownloadPDF(null)}>
                <FileText className="h-4 w-4 mr-2" />
                {activeTab === "all-entries" ? "Alle Mitarbeiter" : "Meine Einträge"}
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Einzelner Mitarbeiter
                  </DropdownMenuLabel>
                  {employees.map(emp => {
                    const empEntryCount = allEntries.filter(e => e.employeeId === emp.id).length;
                    return (
                      <DropdownMenuItem 
                        key={emp.id} 
                        onClick={() => handleDownloadPDF(emp.id)}
                        disabled={empEntryCount === 0}
                      >
                        <User className="h-4 w-4 mr-2" />
                        {emp.name}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {empEntryCount}
                        </Badge>
                      </DropdownMenuItem>
                    );
                  })}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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

      {/* Entries with Tabs */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="my-entries" className="gap-2">
                <User className="h-4 w-4" />
                Meine Einträge
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="all-entries" className="gap-2">
                  <Users className="h-4 w-4" />
                  Alle Mitarbeiter
                  {pendingCount > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-warning/20 text-warning">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                    {(statusFilter !== "all" || employeeFilter !== "all") && (
                      <Badge variant="secondary" className="ml-1">
                        {[statusFilter !== "all", employeeFilter !== "all"].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Status</SelectItem>
                          <SelectItem value="pending">Ausstehend</SelectItem>
                          <SelectItem value="approved">Genehmigt</SelectItem>
                          <SelectItem value="rejected">Abgelehnt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {activeTab === "all-entries" && (
                      <div className="space-y-2">
                        <Label className="text-sm">Mitarbeiter</Label>
                        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                            {employees.map(emp => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setStatusFilter("all");
                        setEmployeeFilter("all");
                      }}
                    >
                      Filter zurücksetzen
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Admin Stats */}
          {isAdmin && activeTab === "all-entries" && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div 
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  statusFilter === "pending" ? "border-warning bg-warning/10" : "border-border hover:border-warning/50"
                )}
                onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
              >
                <p className="text-sm text-muted-foreground">Ausstehend</p>
                <p className="text-2xl font-bold text-warning">{pendingCount}</p>
              </div>
              <div 
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  statusFilter === "approved" ? "border-success bg-success/10" : "border-border hover:border-success/50"
                )}
                onClick={() => setStatusFilter(statusFilter === "approved" ? "all" : "approved")}
              >
                <p className="text-sm text-muted-foreground">Genehmigt</p>
                <p className="text-2xl font-bold text-success">{approvedCount}</p>
              </div>
              <div 
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  statusFilter === "rejected" ? "border-destructive bg-destructive/10" : "border-border hover:border-destructive/50"
                )}
                onClick={() => setStatusFilter(statusFilter === "rejected" ? "all" : "rejected")}
              >
                <p className="text-sm text-muted-foreground">Abgelehnt</p>
                <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
              </div>
            </div>
          )}

          <TabsContent value="my-entries" className="mt-0">
            <TimeEntriesTable
              entries={getFilteredEntries(myEntries).map(e => ({
                id: e.id,
                date: e.date,
                project: e.project,
                task: e.task,
                duration: e.duration,
                approvalStatus: e.approvalStatus,
              }))}
              showEmployee={false}
              isAdmin={false}
              onDelete={handleDeleteEntry}
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="all-entries" className="mt-0">
              <TimeEntriesTable
                entries={getFilteredEntries(allEntries).map(e => ({
                  id: e.id,
                  date: e.date,
                  project: e.project,
                  task: e.task,
                  duration: e.duration,
                  approvalStatus: e.approvalStatus,
                  employeeName: e.employeeName,
                  employeeId: e.employeeId,
                }))}
                showEmployee={true}
                isAdmin={true}
                onApprove={handleApproveEntries}
                onReject={handleRejectEntries}
                onDelete={handleDeleteEntry}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* PDF Preview Dialog */}
      <TimeEntriesPDFPreview
        open={pdfPreviewOpen}
        onOpenChange={setPdfPreviewOpen}
        pdfData={getCurrentPDFData()}
      />
    </div>
  );
}
