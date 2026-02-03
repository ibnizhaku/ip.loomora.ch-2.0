import { useState, useEffect } from "react";
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { de } from "date-fns/locale";

interface TimeSlot {
  time: string;
  available: boolean;
  booking?: string;
}

interface TechnicianData {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface TechnicianScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technicianId: string;
  onSchedule: (date: Date, time: string) => void;
}

const technicians: Record<string, TechnicianData> = {
  mueller: { id: "mueller", name: "Thomas Müller", role: "Senior Techniker", avatar: "TM" },
  schmidt: { id: "schmidt", name: "Peter Schmidt", role: "Techniker", avatar: "PS" },
  weber: { id: "weber", name: "Michael Weber", role: "Techniker", avatar: "MW" },
  bauer: { id: "bauer", name: "Stefan Bauer", role: "Junior Techniker", avatar: "SB" },
};

// Mock schedule data - in reality this would come from an API
const getScheduleForTechnician = (technicianId: string, date: Date): TimeSlot[] => {
  const dayOfWeek = date.getDay();
  const baseSlots: TimeSlot[] = [
    { time: "07:00", available: true },
    { time: "08:00", available: true },
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "12:00", available: false, booking: "Mittagspause" },
    { time: "13:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
  ];

  // Add some mock bookings based on technician and day
  if (technicianId === "mueller") {
    if (dayOfWeek === 1) {
      baseSlots[1].available = false;
      baseSlots[1].booking = "Wartung Logistik Center";
      baseSlots[2].available = false;
      baseSlots[2].booking = "Wartung Logistik Center";
    }
    if (dayOfWeek === 3) {
      baseSlots[6].available = false;
      baseSlots[6].booking = "Reparatur Müller AG";
      baseSlots[7].available = false;
      baseSlots[7].booking = "Reparatur Müller AG";
    }
  }
  if (technicianId === "schmidt") {
    if (dayOfWeek === 2) {
      baseSlots[0].available = false;
      baseSlots[0].booking = "Installation Tech GmbH";
      baseSlots[1].available = false;
      baseSlots[1].booking = "Installation Tech GmbH";
      baseSlots[2].available = false;
      baseSlots[2].booking = "Installation Tech GmbH";
    }
  }
  if (technicianId === "weber") {
    if (dayOfWeek === 4) {
      baseSlots[3].available = false;
      baseSlots[3].booking = "Beratung Precision Tools";
    }
    if (dayOfWeek === 5) {
      baseSlots[7].available = false;
      baseSlots[7].booking = "Abnahme Carport";
      baseSlots[8].available = false;
      baseSlots[8].booking = "Abnahme Carport";
    }
  }

  // Weekend: no availability
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return baseSlots.map(slot => ({ ...slot, available: false, booking: "Wochenende" }));
  }

  return baseSlots;
};

export function TechnicianScheduleDialog({
  open,
  onOpenChange,
  technicianId,
  onSchedule,
}: TechnicianScheduleDialogProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const technician = technicians[technicianId];
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    // Reset selection when dialog opens
    if (open) {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [open]);

  const handlePrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onSchedule(selectedDate, selectedTime);
      onOpenChange(false);
    }
  };

  const getAvailabilityForDay = (date: Date) => {
    const slots = getScheduleForTechnician(technicianId, date);
    const available = slots.filter(s => s.available).length;
    return available;
  };

  if (!technician) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-medium">{technician.avatar}</span>
            </div>
            <div>
              <span>{technician.name}</span>
              <p className="text-sm font-normal text-muted-foreground">{technician.role}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Week Navigation */}
        <div className="flex items-center justify-between border-b pb-3">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {format(currentWeekStart, "d. MMMM", { locale: de })} - {format(addDays(currentWeekStart, 4), "d. MMMM yyyy", { locale: de })}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-5 gap-2">
          {weekDays.map((day) => {
            const availableSlots = getAvailabilityForDay(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "rounded-lg border p-3 transition-all cursor-pointer",
                  isSelected && "border-primary ring-2 ring-primary/20",
                  isPast && "opacity-50 cursor-not-allowed",
                  !isPast && !isSelected && "hover:border-primary/50"
                )}
                onClick={() => !isPast && setSelectedDate(day)}
              >
                <div className="text-center mb-2">
                  <p className="text-xs text-muted-foreground">
                    {format(day, "EEE", { locale: de })}
                  </p>
                  <p className="text-lg font-bold">{format(day, "d")}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "w-full justify-center",
                    availableSlots === 0 ? "bg-destructive/10 text-destructive" :
                    availableSlots <= 3 ? "bg-warning/10 text-warning" :
                    "bg-success/10 text-success"
                  )}
                >
                  {availableSlots} frei
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Verfügbare Zeiten am {format(selectedDate, "EEEE, d. MMMM", { locale: de })}
            </h4>
            <ScrollArea className="h-[200px]">
              <div className="grid grid-cols-5 gap-2">
                {getScheduleForTechnician(technicianId, selectedDate).map((slot) => (
                  <div
                    key={slot.time}
                    className={cn(
                      "rounded-lg border p-3 text-center transition-all",
                      slot.available 
                        ? "cursor-pointer hover:border-primary/50" 
                        : "opacity-50 cursor-not-allowed bg-muted/30",
                      selectedTime === slot.time && slot.available && "border-primary ring-2 ring-primary/20 bg-primary/5"
                    )}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                  >
                    <p className={cn(
                      "font-mono text-sm font-medium",
                      selectedTime === slot.time && "text-primary"
                    )}>
                      {slot.time}
                    </p>
                    {slot.booking && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {slot.booking}
                      </p>
                    )}
                    {slot.available && selectedTime === slot.time && (
                      <Check className="h-4 w-4 mx-auto mt-1 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Summary & Confirm */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            {selectedDate && selectedTime ? (
              <p className="text-sm">
                <span className="text-muted-foreground">Geplant für: </span>
                <span className="font-medium">
                  {format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })} um {selectedTime} Uhr
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Wählen Sie einen Tag und eine Uhrzeit
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedTime}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Termin einplanen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
