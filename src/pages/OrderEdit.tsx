import { useParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useOrder, useUpdateOrder } from "@/hooks/use-sales";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OrderEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id || "");
  const updateOrder = useUpdateOrder();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = async (data: any) => {
    if (!id) return;
    const result = await updateOrder.mutateAsync({ id, data });
    toast.success("Auftrag aktualisiert");
    return result;
  };

  return (
    <DocumentForm
      type="order"
      editMode
      onSave={handleSave}
      defaultCustomerId={order?.customerId}
      initialData={order}
    />
  );
}
