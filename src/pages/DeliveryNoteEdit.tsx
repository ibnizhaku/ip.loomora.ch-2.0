import { useParams } from "react-router-dom";
import { DocumentForm } from "@/components/documents/DocumentForm";

export default function DeliveryNoteEdit() {
  const { id } = useParams();
  return <DocumentForm type="delivery-note" editMode initialData={{ id }} />;
}
