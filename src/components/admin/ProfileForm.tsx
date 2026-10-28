"use client";

import type { JSONContent } from "@tiptap/react";
import { useActionState, useState } from "react";
import { saveProfile, type FormState } from "@/app/admin/actions";
import { ImageField } from "./ImageField";
import { RichEditor } from "./RichEditor";
import { preservingSubmit } from "./use-preserving-submit";
import type { UploadMode } from "./upload";

export type ProfileValues = {
  name: string;
  email: string;
  location: string;
  avatarUrl: string;
  resumeUrl: string;
  statusTr: string;
  statusEn: string;
  headlineTr: string;
  headlineEn: string;
  introTr: string;
  introEn: string;
  bioTrJson: JSONContent | null;
  bioTrHtml: string;
  bioEnJson: JSONContent | null;
  bioEnHtml: string;
  links: string;
};

export function ProfileForm({ initial, uploadMode }: { initial: ProfileValues; uploadMode: UploadMode }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, {});
  const [bioTr, setBioTr] = useState({ json: initial.bioTrJson, html: initial.bioTrHtml });
  const [bioEn, setBioEn] = useState({ json: initial.bioEnJson, html: initial.bioEnHtml });
  const [tab, setTab] = useState<"tr" | "en">("tr");

  return (
    <form onSubmit={preservingSubmit(action)} className="space-y-8">
      <input type="hidden" name="bioTrJson" value={JSON.stringify(bioTr.json)} />
      <input type="hidden" name="bioTrHtml" value={bioTr.html} />
      <input type="hidden" name="bioEnJson" value={JSON.stringify(bioEn.json)} />
      <input type="hidden" name="bioEnHtml" value={bioEn.html} />

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Hakkımda</h1>
        <button disabled={pending} className="btn-primary">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
      </div>
      {(state.error || state.ok) && (
        <p role="status" className={`rounded-lg px-4 py-2.5 text-sm ${state.error ? "bg-red-500/10 text-red-300" : "bg-green-500/10 text-green-300"}`}>
          {state.error ?? state.ok}
        </p>
      )}

      <section className="grid gap-5 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ImageField name="avatarUrl" label="Profil fotoğrafı" defaultValue={initial.avatarUrl} uploadMode={uploadMode} rounded />
        </div>
        <div className="sm:col-span-2">
          <ImageField name="resumeUrl" label="CV (PDF) — ana sayfada indirme butonu çıkar" defaultValue={initial.resumeUrl} uploadMode={uploadMode} accept="application/pdf" />
        </div>
        <label className="block text-sm">
          <span className="text-muted">Ad soyad</span>
          <input name="name" defaultValue={initial.name} className="input mt-1" />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Konum</span>
          <input name="location" defaultValue={initial.location} className="input mt-1" placeholder="İstanbul, Türkiye" />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted">İletişim e-postası (sitede görünür)</span>
          <input name="email" type="email" defaultValue={initial.email} className="input mt-1" />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted">Linkler — her satıra bir tane: <code>Ad | https://adres</code></span>
          <textarea name="links" defaultValue={initial.links} rows={4} className="input mt-1 font-mono text-xs" placeholder={"LinkedIn | https://linkedin.com/in/...\nGitHub | https://github.com/..."} />
        </label>
      </section>

      <section className="space-y-4">
        <div className="flex gap-1 rounded-lg bg-surface p-1 ring-1 ring-line sm:w-fit">
          {(["tr", "en"] as const).map((l) => (
            <button key={l} type="button" onClick={() => setTab(l)} className={`flex-1 rounded-md px-4 py-1.5 text-sm ${tab === l ? "bg-ink text-paper" : "text-muted"}`}>
              {l === "tr" ? "Türkçe" : "English"}
            </button>
          ))}
        </div>
        {(["tr", "en"] as const).map((l) => (
          <div key={l} className={tab === l ? "space-y-4" : "hidden"}>
            <label className="block text-sm">
              <span className="text-muted">Unvan / kısa tanım</span>
              <input name={l === "tr" ? "headlineTr" : "headlineEn"} defaultValue={l === "tr" ? initial.headlineTr : initial.headlineEn} className="input mt-1" placeholder={l === "tr" ? "Yazılım geliştirici" : "Software developer"} />
            </label>
            <label className="block text-sm">
              <span className="text-muted">Durum rozeti (boş bırakılırsa görünmez)</span>
              <input name={l === "tr" ? "statusTr" : "statusEn"} defaultValue={l === "tr" ? initial.statusTr : initial.statusEn} className="input mt-1" placeholder={l === "tr" ? "Yeni projelere açığım" : "Open to new opportunities"} />
            </label>
            <label className="block text-sm">
              <span className="text-muted">Ana sayfa tanıtım metni</span>
              <textarea name={l === "tr" ? "introTr" : "introEn"} defaultValue={l === "tr" ? initial.introTr : initial.introEn} rows={3} className="input mt-1" />
            </label>
            <div className="text-sm">
              <span className="text-muted">Hakkımda sayfası</span>
              <div className="mt-1">
                <RichEditor
                  initialContent={l === "tr" ? initial.bioTrJson : initial.bioEnJson}
                  onChange={l === "tr" ? setBioTr : setBioEn}
                  uploadMode={uploadMode}
                  placeholder={l === "tr" ? "Kendini anlat…" : "Tell your story…"}
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </form>
  );
}
