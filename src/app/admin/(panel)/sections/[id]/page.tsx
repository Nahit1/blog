import type { JSONContent } from "@tiptap/react";
import { notFound } from "next/navigation";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { SectionForm } from "@/components/admin/SectionForm";
import { db } from "@/lib/db";
import { uploadMode } from "@/lib/upload-mode";
import { deleteSection } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await db.section.findUnique({ where: { id } });
  if (!s) notFound();

  return (
    <div className="space-y-12">
      <SectionForm
        uploadMode={uploadMode()}
        initial={{
          id: s.id,
          titleTr: s.titleTr,
          titleEn: s.titleEn,
          bodyTrJson: (s.bodyTrJson as JSONContent | null) ?? null,
          bodyTrHtml: s.bodyTrHtml,
          bodyEnJson: (s.bodyEnJson as JSONContent | null) ?? null,
          bodyEnHtml: s.bodyEnHtml,
          visible: s.visible,
        }}
      />
      <form action={deleteSection} className="border-t border-line pt-6">
        <input type="hidden" name="id" value={s.id} />
        <ConfirmSubmit message="Bu bölüm silinsin mi?" className="text-sm text-red-400 underline">Bu bölümü sil</ConfirmSubmit>
      </form>
    </div>
  );
}
