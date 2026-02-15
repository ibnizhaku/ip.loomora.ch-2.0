import { useParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useQuote, useUpdateQuote } from "@/hooks/use-sales";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function QuoteEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: quote, isLoading } = useQuote(id || "");
  const updateQuote = useUpdateQuote();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = async (data: any) => {
    if (!id) return;
    const result = await updateQuote.mutateAsync({ id, data });
    toast.success("Angebot aktualisiert");
    return result;
  };

  return (
    <DocumentForm
      type="quote"
      editMode
      onSave={handleSave}
      defaultCustomerId={quote?.customerId}
      initialData={quote}
    />
  );
}
