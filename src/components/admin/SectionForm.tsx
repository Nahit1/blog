"use client";

import type { JSONContent } from "@tiptap/react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveSection, type FormState } from "@/app/admin/actions";
import { RichEditor } from "./RichEditor";
import type { UploadMode } from "./upload";
import { preservingSubmit } from "./use-preserving-submit";

export type SectionValues = {
  id?: string;
  titleTr: string;
  titleEn: string;
  bodyTrJson: JSONContent | null;
  bodyTrHtml: string;
  bodyEnJson: JSONContent | null;
  bodyEnHtml: string;
  visible: boolean;
};

export function SectionForm({ initial, uploadMode, savedNotice }: { initial: SectionValues; uploadMode: UploadMode; savedNotice?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSection, savedNotice ? { ok: "Bölüm oluşturuldu." } : {});
  const [bodyTr, setBodyTr] = useState({ json: initial.bodyTrJson, html: initial.bodyTrHtml });
  const [bodyEn, setBodyEn] = useState({ json: initial.bodyEnJson, html: initial.bodyEnHtml });
  const [tab, setTab] = useState<"tr" | "en">("tr");

  return (
    <form onSubmit={preservingSubmit(action)} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="bodyTrJson" value={JSON.stringify(bodyTr.json)} />
      <input type="hidden" name="bodyTrHtml" value={bodyTr.html} />
      <input type="hidden" name="bodyEnJson" value={JSON.stringify(bodyEn.json)} />
      <input type="hidden" name="bodyEnHtml" value={bodyEn.html} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/sections" className="text-sm text-muted hover:text-ink">← Bölümler</Link>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="visible" defaultChecked={initial.visible} className="accent-[var(--accent)]" /> Sitede göster
          </label>
          <button disabled={pending} className="btn-primary">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
        </div>
      </div>
      {(state.error || state.ok) && (
        <p role="status" className={`rounded-lg px-4 py-2.5 text-sm ${state.error ? "bg-red-500/10 text-red-300" : "bg-green-500/10 text-green-300"}`}>
          {state.error ?? state.ok}
        </p>
      )}

      <div className="flex gap-1 rounded-lg bg-surface p-1 ring-1 ring-line sm:w-fit">
        {(["tr", "en"] as const).map((l) => (
          <button key={l} type="button" onClick={() => setTab(l)} className={`flex-1 rounded-md px-4 py-1.5 text-sm ${tab === l ? "bg-ink text-paper" : "text-muted"}`}>
            {l === "tr" ? "Türkçe" : "English"}
          </button>
        ))}
      </div>
      {(["tr", "en"] as const).map((l) => (
        <div key={l} className={tab === l ? "space-y-4" : "hidden"}>
          <input
            name={l === "tr" ? "titleTr" : "titleEn"}
            defaultValue={l === "tr" ? initial.titleTr : initial.titleEn}
            placeholder={l === "tr" ? "Bölüm başlığı (örn. Deneyim)" : "Section title (e.g. Experience)"}
            className="w-full bg-transparent font-serif text-3xl font-semibold tracking-tight outline-none placeholder:text-line"
          />
          <RichEditor
            initialContent={l === "tr" ? initial.bodyTrJson : initial.bodyEnJson}
            onChange={l === "tr" ? setBodyTr : setBodyEn}
            uploadMode={uploadMode}
            placeholder={l === "tr" ? "Bölüm içeriği…" : "Section content…"}
          />
        </div>
      ))}
      <p className="text-xs text-muted">Bir dilde başlık ya da içerik boş kalırsa bölüm o dilde gösterilmez.</p>
    </form>
  );
}
