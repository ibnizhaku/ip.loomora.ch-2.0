import { useSearchParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { toast } from "sonner";

export default function InvoiceCreate() {
  const [searchParams] = useSearchParams();
  const defaultCustomerId = searchParams.get("customerId") || undefined;
  const createInvoice = useCreateInvoice();

  const handleSave = async (data: any) => {
    const result = await createInvoice.mutateAsync(data);
    toast.success("Rechnung erstellt");
    return result;
  };

  return <DocumentForm type="invoice" onSave={handleSave} defaultCustomerId={defaultCustomerId} />;
}
