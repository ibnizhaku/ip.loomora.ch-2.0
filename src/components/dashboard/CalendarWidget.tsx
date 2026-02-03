import { useState } from "react";
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
import { CalendarDays, Clock, MapPin, Users, MoreHorizontal, Edit, Trash2, Copy, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "meeting" | "deadline" | "reminder" | "appointment";
  location?: string;
  attendees?: number;
}

const events: Event[] = [
  {
    id: "1",
    title: "Projektbesprechung E-Commerce",
    date: new Date(2026, 1, 1),
    time: "09:00",
    type: "meeting",
    location: "Konferenzraum A",
    attendees: 5,
  },
  {
    id: "2",
    title: "Kundenpräsentation",
    date: new Date(2026, 1, 1),
    time: "14:00",
    type: "appointment",
    location: "Zoom",
    attendees: 3,
  },
  {
    id: "3",
    title: "Rechnung RE-2024-089 fällig",
    date: new Date(2026, 1, 3),
    time: "23:59",
    type: "deadline",
  },
  {
    id: "4",
    title: "Sprint Review",
    date: new Date(2026, 1, 5),
    time: "10:00",
    type: "meeting",
    location: "Konferenzraum B",
    attendees: 8,
  },
  {
    id: "5",
    title: "Lieferantentermin",
    date: new Date(2026, 1, 7),
    time: "11:30",
    type: "appointment",
    location: "Büro",
    attendees: 2,
  },
  {
    id: "6",
    title: "MwSt-Abgabe Q4",
    date: new Date(2026, 1, 10),
    time: "23:59",
    type: "deadline",
  },
  {
    id: "7",
    title: "Team-Meeting",
    date: new Date(2026, 1, 12),
    time: "09:30",
    type: "meeting",
    location: "Konferenzraum A",
    attendees: 12,
  },
];

const typeConfig = {
  meeting: { label: "Meeting", color: "bg-info/10 text-info border-info/20" },
  deadline: { label: "Frist", color: "bg-destructive/10 text-destructive border-destructive/20" },
  reminder: { label: "Erinnerung", color: "bg-warning/10 text-warning border-warning/20" },
  appointment: { label: "Termin", color: "bg-success/10 text-success border-success/20" },
};

export function CalendarWidget() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventsList, setEventsList] = useState<Event[]>(events);

  const eventDates = eventsList.map((e) => e.date);
  
  const selectedDayEvents = selectedDate
    ? eventsList.filter((e) => isSameDay(e.date, selectedDate))
    : [];

  const upcomingEvents = eventsList
    .filter((e) => e.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const handleEditEvent = (event: Event) => {
    toast.info(`Termin "${event.title}" bearbeiten`);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventsList(prev => prev.filter(e => e.id !== eventId));
    toast.success("Termin wurde gelöscht");
  };

  const handleDuplicateEvent = (event: Event) => {
    const newEvent: Event = {
      ...event,
      id: `${event.id}-copy-${Date.now()}`,
      title: `${event.title} (Kopie)`,
    };
    setEventsList(prev => [...prev, newEvent]);
    toast.success("Termin wurde dupliziert");
  };

  const handleSetReminder = (event: Event) => {
    toast.success(`Erinnerung für "${event.title}" gesetzt`);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-5 w-5" />
          Kalender
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

        {/* Selected Day Events */}
        {selectedDate && selectedDayEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {format(selectedDate, "EEEE, d. MMMM", { locale: de })}
            </h4>
            <div className="space-y-2">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "group p-3 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer",
                    typeConfig[event.type].color
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
                        {event.attendees && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees}
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

        {selectedDate && selectedDayEvents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Keine Termine am {format(selectedDate, "d. MMMM", { locale: de })}
          </p>
        )}

        {/* Upcoming Events */}
        <div className="pt-2 border-t">
          <h4 className="text-sm font-medium mb-3">Kommende Termine</h4>
          <ScrollArea className="h-[180px]">
            <div className="space-y-2 pr-4">
              {upcomingEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn("h-2 w-2 rounded-full shrink-0", typeConfig[event.type].color.split(" ")[0].replace("/10", ""))} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(event.date, "EEE, d. MMM", { locale: de })} · {event.time}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {typeConfig[event.type].label}
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
        </div>
      </CardContent>
    </Card>
  );
}
