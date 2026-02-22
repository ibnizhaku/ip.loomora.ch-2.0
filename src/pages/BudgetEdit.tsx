import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useBudget, useUpdateBudget } from "@/hooks/use-budgets";

export default function BudgetEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: budget, isLoading } = useBudget(id || "");
  const updateMutation = useUpdateBudget();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (budget) {
      const b = budget as any;
      setName(b.name ?? "");
      setDescription(b.description ?? "");
    }
  }, [budget]);

  const handleSubmit = async () => {
    if (!id) return;
    if (!name.trim()) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        data: { name: name.trim(), description: description.trim() || undefined },
      });
      toast.success("Budget aktualisiert");
      navigate(`/budgets/${id}`);
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Speichern");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/budgets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <p className="text-muted-foreground">Budget nicht gefunden</p>
      </div>
    );
  }

  const b = budget as any;
  const canEdit = b.status === "DRAFT";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/budgets/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Budget bearbeiten</h1>
          <p className="text-muted-foreground">
            {b.year} • {b.period}
          </p>
        </div>
      </div>

      {!canEdit && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-200">
          Nur Budgets im Status &quot;Entwurf&quot; können bearbeitet werden. Aktueller Status: {b.status}
        </div>
      )}

      <div className="max-w-2xl space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={!canEdit}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(`/budgets/${id}`)}>
          Abbrechen
        </Button>
        <Button
          className="gap-2"
          onClick={handleSubmit}
          disabled={!canEdit || updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Speichern
        </Button>
      </div>
    </div>
  );
}
