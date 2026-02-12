import { DocumentForm } from "@/components/documents/DocumentForm";
import { useCreateQuote } from "@/hooks/use-sales";
import { toast } from "sonner";

export default function QuoteCreate() {
  const createQuote = useCreateQuote();

  const handleSave = async (data: any) => {
    const result = await createQuote.mutateAsync(data);
    toast.success("Angebot erstellt");
    return result;
  };

  return <DocumentForm type="quote" onSave={handleSave} />;
}
