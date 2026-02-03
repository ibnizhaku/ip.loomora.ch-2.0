import { useState } from "react";
import { Calendar, Clock, Wrench, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface MaintenanceTask {
  id: string;
  name: string;
  interval: string;
  lastDone: string;
  nextDue: string;
  completed: boolean;
}

interface MaintenancePlanDialogProps {
  ticketId: string;
  customerName: string;
}

const initialTasks: MaintenanceTask[] = [
  { id: "1", name: "Sichtprüfung Schweissnähte", interval: "monatlich", lastDone: "15.01.2024", nextDue: "15.02.2024", completed: false },
  { id: "2", name: "Schraubenverbindungen prüfen", interval: "quartalsweise", lastDone: "01.01.2024", nextDue: "01.04.2024", completed: false },
  { id: "3", name: "Korrosionsschutz kontrollieren", interval: "jährlich", lastDone: "28.06.2023", nextDue: "28.06.2024", completed: false },
  { id: "4", name: "Schmierung beweglicher Teile", interval: "monatlich", lastDone: "15.01.2024", nextDue: "15.02.2024", completed: true },
];

export function MaintenancePlanDialog({ ticketId, customerName }: MaintenancePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskInterval, setNewTaskInterval] = useState("");

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = () => {
    if (!newTaskName || !newTaskInterval) {
      toast.error("Bitte Name und Intervall angeben");
      return;
    }
    const today = new Date().toLocaleDateString("de-CH");
    setTasks([...tasks, {
      id: crypto.randomUUID(),
      name: newTaskName,
      interval: newTaskInterval,
      lastDone: "-",
      nextDue: today,
      completed: false,
    }]);
    setNewTaskName("");
    setNewTaskInterval("");
    toast.success("Wartungsaufgabe hinzugefügt");
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleSave = () => {
    const completedCount = tasks.filter(t => t.completed).length;
    toast.success(`Wartungsplan gespeichert (${completedCount}/${tasks.length} erledigt)`);
    setOpen(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Wartungsplan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Wartungsplan - {ticketId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{customerName}</p>

          {/* Progress */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm font-medium">Fortschritt</span>
            <Badge variant={completedCount === tasks.length ? "default" : "secondary"}>
              {completedCount} / {tasks.length} erledigt
            </Badge>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  task.completed ? "bg-success/5 border-success/20" : "hover:border-primary/30"
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.interval}
                    </span>
                    <span>Zuletzt: {task.lastDone}</span>
                    <span>Fällig: {task.nextDue}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new task */}
          <div className="flex gap-2 p-3 rounded-lg border border-dashed">
            <Input
              placeholder="Neue Wartungsaufgabe..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="flex-1"
            />
            <Select value={newTaskInterval} onValueChange={setNewTaskInterval}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Intervall" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wöchentlich">Wöchentlich</SelectItem>
                <SelectItem value="monatlich">Monatlich</SelectItem>
                <SelectItem value="quartalsweise">Quartalsweise</SelectItem>
                <SelectItem value="halbjährlich">Halbjährlich</SelectItem>
                <SelectItem value="jährlich">Jährlich</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={addTask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
