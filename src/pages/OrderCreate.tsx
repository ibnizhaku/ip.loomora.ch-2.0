import { useSearchParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { useCreateOrder } from "@/hooks/use-sales";
import { toast } from "sonner";

export default function OrderCreate() {
  const [searchParams] = useSearchParams();
  const defaultCustomerId = searchParams.get("customerId") || undefined;
  const createOrder = useCreateOrder();

  const handleSave = async (data: any) => {
    const result = await createOrder.mutateAsync(data);
    toast.success("Auftrag erstellt");
    return result;
  };

  return <DocumentForm type="order" onSave={handleSave} defaultCustomerId={defaultCustomerId} />;
}
