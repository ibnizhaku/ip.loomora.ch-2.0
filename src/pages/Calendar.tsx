import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

const events: Event[] = [
  {
    id: "1",
    title: "Projekt-Kickoff E-Commerce",
    type: "meeting",
    startTime: "09:00",
    endTime: "10:30",
    date: "2024-02-01",
    attendees: ["MK", "AS", "TM"],
    location: "Konferenzraum A",
  },
  {
    id: "2",
    title: "Call mit FinTech Solutions",
    type: "call",
    startTime: "11:00",
    endTime: "11:30",
    date: "2024-02-01",
    attendees: ["MK"],
  },
  {
    id: "3",
    title: "Sprint Review",
    type: "meeting",
    startTime: "14:00",
    endTime: "15:00",
    date: "2024-02-01",
    attendees: ["AS", "LW", "SK", "TM"],
    location: "Online (Zoom)",
  },
  {
    id: "4",
    title: "Deadline: API Dokumentation",
    type: "deadline",
    startTime: "18:00",
    date: "2024-02-01",
  },
  {
    id: "5",
    title: "Team-Meeting",
    type: "meeting",
    startTime: "10:00",
    endTime: "11:00",
    date: "2024-02-02",
    attendees: ["MK", "AS", "TM", "LW", "SK"],
    location: "Konferenzraum B",
  },
  {
    id: "6",
    title: "Urlaub Thomas",
    type: "vacation",
    startTime: "Ganztägig",
    date: "2024-02-05",
  },
];

const typeConfig = {
  meeting: { label: "Meeting", color: "bg-primary", icon: Users },
  call: { label: "Anruf", color: "bg-info", icon: Phone },
  deadline: { label: "Deadline", color: "bg-destructive", icon: Clock },
  reminder: { label: "Erinnerung", color: "bg-warning", icon: Clock },
  vacation: { label: "Urlaub", color: "bg-success", icon: MapPin },
};

const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const currentWeek = [
  { day: "Mo", date: 29, month: "Jan" },
  { day: "Di", date: 30, month: "Jan" },
  { day: "Mi", date: 31, month: "Jan" },
  { day: "Do", date: 1, month: "Feb", isToday: true },
  { day: "Fr", date: 2, month: "Feb" },
  { day: "Sa", date: 3, month: "Feb" },
  { day: "So", date: 4, month: "Feb" },
];

const upcomingEvents = events.slice(0, 5);

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(1);

  const todayEvents = events.filter((e) => e.date === "2024-02-01");

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
        <Button className="gap-2">
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
                Februar 2024
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  Heute
                </Button>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {currentWeek.map((day) => (
                <button
                  key={`${day.day}-${day.date}`}
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                    day.isToday && "bg-primary text-primary-foreground",
                    selectedDate === day.date && !day.isToday && "bg-secondary",
                    !day.isToday && selectedDate !== day.date && "hover:bg-muted"
                  )}
                >
                  <span className="text-xs font-medium">{day.day}</span>
                  <span className="text-lg font-bold">{day.date}</span>
                  <span className="text-xs opacity-70">{day.month}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-lg mb-4">
              Termine für den 1. Februar
            </h3>

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
                          <h4 className="font-medium">{event.title}</h4>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Februar 2024</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
              {[...Array(3)].map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              {[...Array(29)].map((_, i) => (
                <button
                  key={i + 1}
                  className={cn(
                    "p-2 rounded-lg hover:bg-muted transition-colors",
                    i + 1 === 1 && "bg-primary text-primary-foreground hover:bg-primary",
                    [1, 2, 5].includes(i + 1) && i + 1 !== 1 && "font-medium"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Kommende Termine</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
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
    </div>
  );
}
