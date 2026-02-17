import { useParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useCreditNote, useUpdateCreditNote } from "@/hooks/use-credit-notes";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CreditNoteEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: creditNote, isLoading } = useCreditNote(id || "");
  const updateCreditNote = useUpdateCreditNote();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = async (data: any) => {
    if (!id) return;
    const result = await updateCreditNote.mutateAsync({ id, data });
    toast.success("Gutschrift aktualisiert");
    return result;
  };

  return (
    <DocumentForm
      type="credit-note"
      editMode
      onSave={handleSave}
      defaultCustomerId={creditNote?.customerId}
      initialData={creditNote}
    />
  );
}
