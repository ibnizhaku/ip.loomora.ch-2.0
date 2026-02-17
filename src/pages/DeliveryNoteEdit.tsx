import { useParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useDeliveryNote, useUpdateDeliveryNote } from "@/hooks/use-delivery-notes";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function DeliveryNoteEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: deliveryNote, isLoading } = useDeliveryNote(id || "");
  const updateDeliveryNote = useUpdateDeliveryNote();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = async (data: any) => {
    if (!id) return;
    const result = await updateDeliveryNote.mutateAsync({ id, data });
    toast.success("Lieferschein aktualisiert");
    return result;
  };

  return (
    <DocumentForm
      type="delivery-note"
      editMode
      onSave={handleSave}
      defaultCustomerId={deliveryNote?.customerId}
      initialData={deliveryNote}
    />
  );
}
