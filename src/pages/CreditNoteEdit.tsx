import { useParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";

export default function CreditNoteEdit() {
  const { id } = useParams();
  return <DocumentForm type="credit-note" editMode initialData={{ id }} />;
}
