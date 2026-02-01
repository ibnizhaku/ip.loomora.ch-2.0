import { useParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";

export default function InvoiceEdit() {
  const { id } = useParams();
  return <DocumentForm type="invoice" editMode initialData={{ id }} />;
}
