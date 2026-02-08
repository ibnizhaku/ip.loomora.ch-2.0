import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  Video,
  Phone,
  MapPin,
  MoreHorizontal,
  X,
  Edit,
  Trash2,
  Copy,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Event {
  id: string;
  title: string;
  type: "meeting" | "call" | "deadline" | "reminder" | "vacation";
  startTime: string;
  endTime?: string;
  date: string;
  attendees?: string[];
  location?: string;
  description?: string;
}


const typeConfig = {
  meeting: { label: "Meeting", color: "bg-primary", icon: Users },
  call: { label: "Anruf", color: "bg-info", icon: Phone },
  deadline: { label: "Deadline", color: "bg-destructive", icon: Clock },
  reminder: { label: "Erinnerung", color: "bg-warning", icon: Clock },
  vacation: { label: "Urlaub", color: "bg-success", icon: MapPin },
};

const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function Calendar() {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2024, 1, 1));

  // Fetch calendar events from API
  const { data: calendarData } = useQuery({
    queryKey: ['calendar'],
    queryFn: () => api.get<any>('/calendar'),
  });
  const initialEvents = calendarData?.data || [];
  
  // Update events when API data changes
  useEffect(() => {
    if (initialEvents.length > 0) {
      setEvents(initialEvents);
    }
  }, [initialEvents]);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2024, 1, 1));

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/calendar/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success("Termin erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen des Termins");
    },
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEventForReminder, setSelectedEventForReminder] = useState<Event | null>(null);
  const [selectedEventForDuplicate, setSelectedEventForDuplicate] = useState<Event | null>(null);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<Event | null>(null);
  const [duplicateDate, setDuplicateDate] = useState<Date>(new Date());
  const [editDate, setEditDate] = useState<Date>(new Date());
  const [reminderSettings, setReminderSettings] = useState({
    time: "15min",
    method: "notification",
  });
  const [eventReminders, setEventReminders] = useState<Record<string, { time: string; method: string }>>({});
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "meeting" as Event["type"],
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    description: "",
  });
  const [editEvent, setEditEvent] = useState({
    title: "",
    type: "meeting" as Event["type"],
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    description: "",
  });

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const todayEvents = events.filter((e) => e.date === selectedDateKey);
  const upcomingEvents = events.slice(0, 5);

  // Generate week view dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(selectedDate);

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
    setCurrentMonth(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
    setCurrentMonth(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) {
      toast.error("Bitte geben Sie einen Titel ein");
      return;
    }

    const event: Event = {
      id: String(Date.now()),
      title: newEvent.title,
      type: newEvent.type,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      date: formatDateKey(selectedDate),
      location: newEvent.location || undefined,
      description: newEvent.description || undefined,
    };

    setEvents([...events, event]);
    setIsDialogOpen(false);
    setNewEvent({
      title: "",
      type: "meeting",
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      description: "",
    });
    toast.success("Termin wurde erstellt");
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEventForEdit(event);
    const [year, month, day] = event.date.split("-").map(Number);
    setEditDate(new Date(year, month - 1, day));
    setEditEvent({
      title: event.title,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime || "",
      location: event.location || "",
      description: event.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (selectedEventForEdit && editEvent.title.trim()) {
      setEvents(prev => prev.map(e => 
        e.id === selectedEventForEdit.id
          ? {
              ...e,
              title: editEvent.title,
              type: editEvent.type,
              startTime: editEvent.startTime,
              endTime: editEvent.endTime || undefined,
              date: formatDateKey(editDate),
              location: editEvent.location || undefined,
              description: editEvent.description || undefined,
            }
          : e
      ));
      toast.success("Termin wurde aktualisiert");
      setIsEditDialogOpen(false);
    } else {
      toast.error("Bitte geben Sie einen Titel ein");
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteMutation.mutate(eventId);
  };

  const handleDuplicateEvent = (event: Event) => {
    setSelectedEventForDuplicate(event);
    // Parse the event date to set as initial duplicate date
    const [year, month, day] = event.date.split("-").map(Number);
    setDuplicateDate(new Date(year, month - 1, day));
    setIsDuplicateDialogOpen(true);
  };

  const handleConfirmDuplicate = () => {
    if (selectedEventForDuplicate) {
      const newEventCopy: Event = {
        ...selectedEventForDuplicate,
        id: String(Date.now()),
        title: `${selectedEventForDuplicate.title} (Kopie)`,
        date: formatDateKey(duplicateDate),
      };
      setEvents(prev => [...prev, newEventCopy]);
      toast.success(`Termin wurde auf ${format(duplicateDate, "d. MMMM yyyy", { locale: de })} dupliziert`);
      setIsDuplicateDialogOpen(false);
    }
  };

  const handleSetReminder = (event: Event) => {
    setSelectedEventForReminder(event);
    // Pre-fill with existing reminder if available
    if (eventReminders[event.id]) {
      setReminderSettings(eventReminders[event.id]);
    } else {
      setReminderSettings({ time: "15min", method: "notification" });
    }
    setIsReminderDialogOpen(true);
  };

  const handleSaveReminder = () => {
    if (selectedEventForReminder) {
      setEventReminders(prev => ({
        ...prev,
        [selectedEventForReminder.id]: reminderSettings,
      }));
      
      const timeLabels: Record<string, string> = {
        "5min": "5 Minuten",
        "15min": "15 Minuten",
        "30min": "30 Minuten",
        "1h": "1 Stunde",
        "1d": "1 Tag",
      };
      
      const methodLabels: Record<string, string> = {
        "notification": "Browser-Benachrichtigung",
        "email": "E-Mail",
        "both": "Beide",
      };
      
      toast.success(
        `Erinnerung gesetzt: ${timeLabels[reminderSettings.time]} vorher per ${methodLabels[reminderSettings.method]}`
      );
      setIsReminderDialogOpen(false);
    }
  };

  const handleRemoveReminder = (eventId: string) => {
    setEventReminders(prev => {
      const updated = { ...prev };
      delete updated[eventId];
      return updated;
    });
    toast.success("Erinnerung wurde entfernt");
    setIsReminderDialogOpen(false);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Kalender
          </h1>
          <p className="text-muted-foreground">
            Termine und Ereignisse verwalten
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Neuer Termin
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Calendar View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Week Navigation */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">
                {format(currentMonth, "MMMM yyyy", { locale: de })}
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Heute
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDates.map((date) => {
                const hasEvents = events.some((e) => e.date === formatDateKey(date));
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                      isToday(date) && "bg-primary text-primary-foreground",
                      isSameDay(date, selectedDate) && !isToday(date) && "bg-secondary",
                      !isToday(date) && !isSameDay(date, selectedDate) && "hover:bg-muted"
                    )}
                  >
                    <span className="text-xs font-medium">
                      {format(date, "EEE", { locale: de })}
                    </span>
                    <span className="text-lg font-bold">{date.getDate()}</span>
                    <span className="text-xs opacity-70">
                      {format(date, "MMM", { locale: de })}
                    </span>
                    {hasEvents && (
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isToday(date) ? "bg-primary-foreground" : "bg-primary"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-lg mb-4">
              Termine für {format(selectedDate, "d. MMMM", { locale: de })}
            </h3>

            {todayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Keine Termine an diesem Tag</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Termin hinzufügen
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event, index) => {
                  const TypeIcon = typeConfig[event.type].icon;
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "group flex gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-all animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div
                        className={cn(
                          "w-1 rounded-full",
                          typeConfig[event.type].color
                        )}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{event.title}</h4>
                              {eventReminders[event.id] && (
                                <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30 gap-1">
                                  <Bell className="h-3 w-3" />
                                  Erinnerung
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {event.startTime}
                                {event.endTime && ` - ${event.endTime}`}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {event.location}
                                </div>
                              )}
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
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateEvent(event)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplizieren
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetReminder(event)}>
                                <Bell className="h-4 w-4 mr-2" />
                                {eventReminders[event.id] ? "Erinnerung bearbeiten" : "Erinnerung setzen"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex -space-x-2">
                              {event.attendees.slice(0, 4).map((attendee) => (
                                <Avatar
                                  key={attendee}
                                  className="h-7 w-7 ring-2 ring-card"
                                >
                                  <AvatarFallback className="text-xs bg-secondary">
                                    {attendee}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {event.attendees.length > 4 && (
                              <span className="text-xs text-muted-foreground">
                                +{event.attendees.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <CalendarPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={de}
              className="pointer-events-auto"
              modifiers={{
                hasEvent: (date) => events.some((e) => e.date === formatDateKey(date)),
              }}
              modifiersStyles={{
                hasEvent: { fontWeight: "bold" },
              }}
            />
          </div>

          {/* Upcoming Events */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Kommende Termine</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => {
                    const [year, month, day] = event.date.split("-").map(Number);
                    setSelectedDate(new Date(year, month - 1, day));
                  }}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      `${typeConfig[event.type].color}/10`
                    )}
                  >
                    {(() => {
                      const TypeIcon = typeConfig[event.type].icon;
                      return (
                        <TypeIcon
                          className={cn(
                            "h-4 w-4",
                            typeConfig[event.type].color.replace("bg-", "text-")
                          )}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.startTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neuer Termin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                placeholder="Terminbezeichnung"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {format(selectedDate, "PPP", { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={de}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Von</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Bis</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Typ</Label>
              <Select
                value={newEvent.type}
                onValueChange={(value) => setNewEvent({ ...newEvent, type: value as Event["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Anruf</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="reminder">Erinnerung</SelectItem>
                  <SelectItem value="vacation">Urlaub</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ort (optional)</Label>
              <Input
                id="location"
                placeholder="z.B. Konferenzraum A"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                placeholder="Weitere Details..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateEvent}>
              Termin erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Erinnerung setzen
            </DialogTitle>
          </DialogHeader>
          {selectedEventForReminder && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">{selectedEventForReminder.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedEventForReminder.date} um {selectedEventForReminder.startTime}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Erinnern vor</Label>
                <Select
                  value={reminderSettings.time}
                  onValueChange={(value) => setReminderSettings({ ...reminderSettings, time: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5min">5 Minuten vorher</SelectItem>
                    <SelectItem value="15min">15 Minuten vorher</SelectItem>
                    <SelectItem value="30min">30 Minuten vorher</SelectItem>
                    <SelectItem value="1h">1 Stunde vorher</SelectItem>
                    <SelectItem value="1d">1 Tag vorher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Benachrichtigungsart</Label>
                <Select
                  value={reminderSettings.method}
                  onValueChange={(value) => setReminderSettings({ ...reminderSettings, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notification">Browser-Benachrichtigung</SelectItem>
                    <SelectItem value="email">E-Mail</SelectItem>
                    <SelectItem value="both">Beide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {eventReminders[selectedEventForReminder.id] && (
                <div className="p-3 rounded-lg border border-warning/30 bg-warning/10">
                  <p className="text-sm text-warning font-medium">
                    Aktive Erinnerung vorhanden
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-auto py-1 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleRemoveReminder(selectedEventForReminder.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Erinnerung entfernen
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveReminder}>
              <Bell className="h-4 w-4 mr-2" />
              Erinnerung speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Termin duplizieren
            </DialogTitle>
          </DialogHeader>
          {selectedEventForDuplicate && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">{selectedEventForDuplicate.title}</p>
                <p className="text-sm text-muted-foreground">
                  Original: {selectedEventForDuplicate.date} um {selectedEventForDuplicate.startTime}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Neues Datum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {format(duplicateDate, "PPP", { locale: de })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={duplicateDate}
                      onSelect={(date) => date && setDuplicateDate(date)}
                      locale={de}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <p className="text-sm text-muted-foreground">
                Zeit und andere Einstellungen bleiben unverändert.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleConfirmDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplizieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Termin bearbeiten
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel</Label>
              <Input
                id="edit-title"
                placeholder="Terminbezeichnung"
                value={editEvent.title}
                onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {format(editDate, "PPP", { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={editDate}
                    onSelect={(date) => date && setEditDate(date)}
                    locale={de}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Von</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={editEvent.startTime}
                  onChange={(e) => setEditEvent({ ...editEvent, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">Bis</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={editEvent.endTime}
                  onChange={(e) => setEditEvent({ ...editEvent, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Typ</Label>
              <Select
                value={editEvent.type}
                onValueChange={(value) => setEditEvent({ ...editEvent, type: value as Event["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Anruf</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="reminder">Erinnerung</SelectItem>
                  <SelectItem value="vacation">Urlaub</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Ort (optional)</Label>
              <Input
                id="edit-location"
                placeholder="z.B. Konferenzraum A"
                value={editEvent.location}
                onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschreibung (optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Weitere Details..."
                value={editEvent.description}
                onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleConfirmEdit}>
              Änderungen speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
