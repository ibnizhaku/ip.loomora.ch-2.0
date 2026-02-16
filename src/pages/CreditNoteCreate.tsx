import { useSearchParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useCreateCreditNote } from "@/hooks/use-credit-notes";
import { toast } from "sonner";

export default function CreditNoteCreate() {
  const [searchParams] = useSearchParams();
  const defaultCustomerId = searchParams.get("customerId") || undefined;
  const createCreditNote = useCreateCreditNote();

  const handleSave = async (data: any) => {
    const result = await createCreditNote.mutateAsync(data);
    toast.success("Gutschrift erstellt");
    return result;
  };

  return <DocumentForm type="credit-note" onSave={handleSave} defaultCustomerId={defaultCustomerId} />;
}
