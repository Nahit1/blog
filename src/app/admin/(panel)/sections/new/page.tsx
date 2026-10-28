import { SectionForm } from "@/components/admin/SectionForm";
import { uploadMode } from "@/lib/upload-mode";

export default function NewSectionPage() {
  return (
    <SectionForm
      uploadMode={uploadMode()}
      initial={{ titleTr: "", titleEn: "", bodyTrJson: null, bodyTrHtml: "", bodyEnJson: null, bodyEnHtml: "", visible: true }}
    />
  );
}
