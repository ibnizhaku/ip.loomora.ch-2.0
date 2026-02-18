import { useState } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { 
  Check, 
  X, 
  Clock, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface TimeEntryRow {
  id: string;
  date: string;
  project: string;
  task: string;
  duration: number;
  employeeName?: string;
  employeeId?: string;
  approvalStatus: ApprovalStatus;
  notes?: string;
}

interface TimeEntriesTableProps {
  entries: TimeEntryRow[];
  showEmployee?: boolean;
  isAdmin?: boolean;
  onApprove?: (ids: string[]) => void;
  onReject?: (ids: string[]) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const statusConfig: Record<ApprovalStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: {
    label: 'Ausstehend',
    icon: AlertCircle,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  approved: {
    label: 'Genehmigt',
    icon: CheckCircle2,
    className: 'bg-success/10 text-success border-success/20',
  },
  rejected: {
    label: 'Abgelehnt',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
}

export function TimeEntriesTable({
  entries,
  showEmployee = false,
  isAdmin = false,
  onApprove,
  onReject,
  onDelete,
  onEdit,
}: TimeEntriesTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const pendingEntries = entries.filter(e => e.approvalStatus === 'pending');
  const allSelected = pendingEntries.length > 0 && 
    pendingEntries.every(e => selectedIds.includes(e.id));
  const someSelected = selectedIds.length > 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pendingEntries.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkApprove = () => {
    if (onApprove && selectedIds.length > 0) {
      onApprove(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkReject = () => {
    if (onReject && selectedIds.length > 0) {
      onReject(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleDeleteClick = (id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete && onDelete) {
      onDelete(entryToDelete);
      toast.success("Eintrag gelöscht");
    }
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Keine Einträge vorhanden</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {isAdmin && someSelected && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg animate-fade-in">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} ausgewählt
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2 text-success border-success/30 hover:bg-success/10"
            onClick={handleBulkApprove}
          >
            <Check className="h-4 w-4" />
            Genehmigen
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleBulkReject}
          >
            <X className="h-4 w-4" />
            Ablehnen
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setSelectedIds([])}
          >
            Auswahl aufheben
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {isAdmin && (
                <th className="px-4 py-3 text-left w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Alle auswählen"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium">Datum</th>
              {showEmployee && (
                <th className="px-4 py-3 text-left text-sm font-medium">Mitarbeiter</th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium">Projekt</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Aufgabe</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Dauer</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium w-20">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry, index) => {
              const statusInfo = statusConfig[entry.approvalStatus];
              const StatusIcon = statusInfo.icon;
              const isSelected = selectedIds.includes(entry.id);
              const canSelect = entry.approvalStatus === 'pending';

              return (
                <tr 
                  key={entry.id}
                  className={cn(
                    "transition-colors hover:bg-muted/30",
                    isSelected && "bg-primary/5"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {canSelect && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(entry.id, !!checked)}
                          aria-label={`Eintrag ${entry.task} auswählen`}
                        />
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm">
                    {format(parseISO(entry.date), 'd. MMM yyyy', { locale: de })}
                  </td>
                  {showEmployee && (
                    <td className="px-4 py-3 text-sm font-medium">
                      {entry.employeeName || '-'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm">{entry.project}</td>
                  <td className="px-4 py-3 text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-left">
                          <span className="truncate max-w-[200px] block">{entry.task}</span>
                        </TooltipTrigger>
                        {entry.notes && (
                          <TooltipContent>
                            <p className="max-w-xs">{entry.notes}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-medium">
                    {formatDuration(entry.duration)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("gap-1", statusInfo.className)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isAdmin && entry.approvalStatus === 'pending' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => onApprove?.([entry.id])}
                              className="text-success"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Genehmigen
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onReject?.([entry.id])}
                              className="text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Ablehnen
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(entry.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(entry.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dieser Zeiteintrag wird unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
