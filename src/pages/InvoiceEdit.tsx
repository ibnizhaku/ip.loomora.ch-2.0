import { useParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useInvoice, useUpdateInvoice } from "@/hooks/use-invoices";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function InvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading } = useInvoice(id || "");
  const updateInvoice = useUpdateInvoice();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = async (data: any) => {
    if (!id) return;
    const result = await updateInvoice.mutateAsync({ id, data });
    toast.success("Rechnung aktualisiert");
    return result;
  };

  return (
    <DocumentForm
      type="invoice"
      editMode
      onSave={handleSave}
      defaultCustomerId={invoice?.customerId}
      initialData={invoice}
    />
  );
}
