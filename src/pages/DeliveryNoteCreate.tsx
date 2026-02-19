import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useCreateDeliveryNote } from "@/hooks/use-delivery-notes";
import { toast } from "sonner";

export default function DeliveryNoteCreate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultCustomerId = searchParams.get("customerId") || undefined;
  const orderId = searchParams.get("orderId") || undefined;
  const createDeliveryNote = useCreateDeliveryNote();

  // Lieferschein kann nur aus einem Auftrag heraus erstellt werden
  useEffect(() => {
    if (!orderId) {
      toast.error("Lieferscheine können nur aus einem Auftrag heraus erstellt werden.", {
        description: "Bitte öffnen Sie den gewünschten Auftrag und klicken Sie auf 'Lieferschein erstellen'.",
        duration: 6000,
      });
      navigate("/orders");
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  const handleSave = async (data: any) => {
    const result = await createDeliveryNote.mutateAsync({ ...data, orderId });
    toast.success("Lieferschein erstellt");
    return result;
  };

  return (
    <DocumentForm
      type="delivery-note"
      onSave={handleSave}
      defaultCustomerId={defaultCustomerId}
    />
  );
}
