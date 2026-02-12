import { DocumentForm } from "@/components/documents/DocumentForm";
import { useCreateDeliveryNote } from "@/hooks/use-delivery-notes";
import { toast } from "sonner";

export default function DeliveryNoteCreate() {
  const createDeliveryNote = useCreateDeliveryNote();

  const handleSave = async (data: any) => {
    const result = await createDeliveryNote.mutateAsync(data);
    toast.success("Lieferschein erstellt");
    return result;
  };

  return <DocumentForm type="delivery-note" onSave={handleSave} />;
}
