import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Building2,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  type Department,
} from "@/hooks/use-departments";

export default function Departments() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const { data: apiData, isLoading, error } = useDepartments({ search: searchQuery || undefined });
  const departments = apiData?.data || [];

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const openCreateDialog = () => {
    setEditingDept(null);
    setFormName("");
    setFormDescription("");
    setDialogOpen(true);
  };

  const openEditDialog = (dept: Department) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormDescription(dept.description || "");
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }

    try {
      if (editingDept) {
        await updateMutation.mutateAsync({
          id: editingDept.id,
          data: { name: formName.trim(), description: formDescription.trim() || undefined },
        });
        toast.success("Abteilung aktualisiert");
      } else {
        await createMutation.mutateAsync({
          name: formName.trim(),
          description: formDescription.trim() || undefined,
        });
        toast.success("Abteilung erstellt");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Speichern");
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`Abteilung "${dept.name}" wirklich löschen?`)) return;
    try {
      await deleteMutation.mutateAsync(dept.id);
      toast.success("Abteilung gelöscht");
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Löschen — möglicherweise sind noch Mitarbeiter zugeordnet");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-destructive">Fehler beim Laden der Abteilungen</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Abteilungen
          </h1>
          <p className="text-muted-foreground">
            Abteilungen verwalten und Mitarbeiter zuordnen
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/departments/new")}>
          <Plus className="h-4 w-4" />
          Neue Abteilung
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Abteilungen</p>
              <p className="text-2xl font-bold">{departments.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Users className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mitarbeiter zugeordnet</p>
              <p className="text-2xl font-bold">
                {departments.reduce((sum, d) => sum + (d.employeeCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Abteilung suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Beschreibung</TableHead>
              <TableHead className="text-center">Mitarbeiter</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Keine Abteilungen vorhanden. Erstellen Sie Ihre erste Abteilung.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept, index) => (
                <TableRow
                  key={dept.id}
                  className="animate-fade-in cursor-pointer hover:bg-muted/50"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {dept.description || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{dept.employeeCount || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(dept)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(dept)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDept ? "Abteilung bearbeiten" : "Neue Abteilung"}
            </DialogTitle>
            <DialogDescription>
              {editingDept
                ? "Ändern Sie die Abteilungsdaten."
                : "Erstellen Sie eine neue Abteilung für Ihre Firma."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Name *</Label>
              <Input
                id="dept-name"
                placeholder="z.B. Produktion"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-desc">Beschreibung</Label>
              <Input
                id="dept-desc"
                placeholder="Optionale Beschreibung"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingDept ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
