import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, Clock, MapPin, Users, MoreHorizontal, Edit, Trash2, Copy, Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCalendarEvents, useDeleteCalendarEvent, useCreateCalendarEvent } from "@/hooks/use-calendar";

const typeConfig: Record<string, { label: string; color: string }> = {
  meeting: { label: "Meeting", color: "bg-info/10 text-info border-info/20" },
  deadline: { label: "Frist", color: "bg-destructive/10 text-destructive border-destructive/20" },
  reminder: { label: "Erinnerung", color: "bg-warning/10 text-warning border-warning/20" },
  appointment: { label: "Termin", color: "bg-success/10 text-success border-success/20" },
  task: { label: "Aufgabe", color: "bg-primary/10 text-primary border-primary/20" },
  other: { label: "Sonstiges", color: "bg-muted text-muted-foreground border-muted" },
};

export function CalendarWidget() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Calculate date range for current view
  const dateRange = useMemo(() => {
    const now = new Date();
    return {
      startDate: startOfMonth(now).toISOString(),
      endDate: endOfMonth(new Date(now.getFullYear(), now.getMonth() + 2, 0)).toISOString(),
    };
  }, []);

  const { data, isLoading } = useCalendarEvents(dateRange);
  const deleteEvent = useDeleteCalendarEvent();
  const duplicateEvent = useCreateCalendarEvent();

  const events = useMemo(() => {
    return (data?.data || []).map(event => ({
      ...event,
      date: parseISO(event.startDate),
      time: format(parseISO(event.startDate), 'HH:mm'),
      type: (event.type?.toLowerCase() || 'other') as keyof typeof typeConfig,
    }));
  }, [data]);

  const eventDates = events.map((e) => e.date);
  
  const selectedDayEvents = selectedDate
    ? events.filter((e) => isSameDay(e.date, selectedDate))
    : [];

  const upcomingEvents = events
    .filter((e) => e.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const handleEditEvent = (eventId: string) => {
    navigate(`/calendar?edit=${eventId}`);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent.mutate(eventId, {
      onSuccess: () => toast.success("Termin wurde gelöscht"),
      onError: () => toast.error("Fehler beim Löschen"),
    });
  };

  const handleDuplicateEvent = (event: typeof events[0]) => {
    duplicateEvent.mutate({
      title: `${event.title} (Kopie)`,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      allDay: event.allDay,
      location: event.location,
    }, {
      onSuccess: () => toast.success("Termin wurde dupliziert"),
      onError: () => toast.error("Fehler beim Duplizieren"),
    });
  };

  const handleSetReminder = (event: typeof events[0]) => {
    toast.success(`Erinnerung für "${event.title}" gesetzt`);
  };

  const getTypeConfig = (type: string) => {
    return typeConfig[type] || typeConfig.other;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base">
            <CalendarDays className="h-5 w-5" />
            Kalender
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/calendar')}
            className="text-xs text-primary"
          >
            Alle anzeigen
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={de}
          className="rounded-md border mx-auto pointer-events-auto"
          modifiers={{
            hasEvent: eventDates,
          }}
          modifiersStyles={{
            hasEvent: {
              fontWeight: "bold",
              backgroundColor: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))",
            },
          }}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Selected Day Events */}
        {!isLoading && selectedDate && selectedDayEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {format(selectedDate, "EEEE, d. MMMM", { locale: de })}
            </h4>
            <div className="space-y-2">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/calendar?event=${event.id}`)}
                  className={cn(
                    "group p-3 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer",
                    getTypeConfig(event.type).color
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{event.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs opacity-80">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateEvent(event)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSetReminder(event)}>
                          <Bell className="h-4 w-4 mr-2" />
                          Erinnerung setzen
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
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && selectedDate && selectedDayEvents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Keine Termine am {format(selectedDate, "d. MMMM", { locale: de })}
          </p>
        )}

        {/* Upcoming Events */}
        {!isLoading && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-3">Kommende Termine</h4>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine anstehenden Termine
              </p>
            ) : (
              <ScrollArea className="h-[180px]">
                <div className="space-y-2 pr-4">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/calendar?event=${event.id}`)}
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={cn("h-2 w-2 rounded-full shrink-0", getTypeConfig(event.type).color.split(" ")[0].replace("/10", ""))} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.date, "EEE, d. MMM", { locale: de })} · {event.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {getTypeConfig(event.type).label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateEvent(event)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplizieren
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSetReminder(event)}>
                            <Bell className="h-4 w-4 mr-2" />
                            Erinnerung setzen
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
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
