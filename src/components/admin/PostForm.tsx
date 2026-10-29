"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { savePost, type FormState } from "@/app/admin/actions";
import { slugify } from "@/lib/text";
import { ImageField } from "./ImageField";
import { LinkedInSharePanel } from "./LinkedInShare";
import { RichEditor } from "./RichEditor";
import { preservingSubmit } from "./use-preserving-submit";
import type { UploadMode } from "./upload";

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  locale: "tr" | "en";
  excerpt: string;
  coverImage: string;
  tags: string;
  contentJson: JSONContent | null;
  contentHtml: string;
  translationOf: string;
  status: "DRAFT" | "PUBLISHED";
};

type TranslationOption = { id: string; title: string; locale: "tr" | "en" };

export function PostForm({
  initial,
  translations,
  uploadMode,
  share,
}: {
  initial: PostFormValues;
  translations: TranslationOption[];
  uploadMode: UploadMode;
  /** Yayındaki yazılar için mutlak yazı adresi ve paylaşım görseli */
  share?: { postUrl: string; imageUrl: string };
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePost, {});
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [locale, setLocale] = useState(initial.locale);
  const [content, setContent] = useState({ json: initial.contentJson, html: initial.contentHtml });
  const published = initial.status === "PUBLISHED";
  const otherLocale = translations.filter((t) => t.locale !== locale);
  const publicUrl = `${locale === "en" ? "/en" : ""}/blog/${slug}`;

  return (
    <form onSubmit={preservingSubmit(action)} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="contentJson" value={JSON.stringify(content.json ?? { type: "doc", content: [] })} />
      <input type="hidden" name="contentHtml" value={content.html} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin/posts" className="text-muted hover:text-ink">← Yazılar</Link>
          <span className={`rounded-full px-2.5 py-0.5 text-xs ${published ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"}`}>
            {published ? "Yayında" : "Taslak"}
          </span>
          {published && <a href={publicUrl} target="_blank" className="text-muted underline hover:text-ink">Görüntüle ↗</a>}
        </div>
        <div className="flex gap-2">
          {published ? (
            <>
              <button name="intent" value="unpublish" disabled={pending} className="btn-secondary">Yayından kaldır</button>
              <button name="intent" value="draft" disabled={pending} className="btn-primary">Güncelle</button>
            </>
          ) : (
            <>
              <button name="intent" value="draft" disabled={pending} className="btn-secondary">Taslak kaydet</button>
              <button name="intent" value="publish" disabled={pending} className="btn-primary">Yayınla</button>
            </>
          )}
        </div>
      </div>

      {state.error && <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{state.error}</p>}

      <input
        name="title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (!slugTouched) setSlug(slugify(e.target.value));
        }}
        placeholder="Başlık"
        required
        className="w-full bg-transparent font-serif text-4xl font-semibold tracking-tight outline-none placeholder:text-muted/50"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <RichEditor
          initialContent={initial.contentJson}
          onChange={(v) => setContent(v)}
          uploadMode={uploadMode}
        />

        <aside className="space-y-5">
          <label className="block text-sm">
            <span className="text-muted">Dil</span>
            <select name="locale" value={locale} onChange={(e) => setLocale(e.target.value as "tr" | "en")} className="input mt-1">
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Adres (slug)</span>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              className="input mt-1 font-mono text-xs"
            />
            <span className="mt-1 block truncate text-xs text-muted">nahitferhat.com{publicUrl}</span>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Kısa özet</span>
            <textarea name="excerpt" defaultValue={initial.excerpt} rows={3} maxLength={400} className="input mt-1" placeholder="Listelerde ve bildirim mailinde görünür" />
          </label>
          <ImageField name="coverImage" label="Kapak görseli" defaultValue={initial.coverImage} uploadMode={uploadMode} />
          <label className="block text-sm">
            <span className="text-muted">Etiketler</span>
            <input name="tags" defaultValue={initial.tags} className="input mt-1" placeholder="yazılım, kariyer" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Bu yazının çevirisi</span>
            <select name="translationOf" defaultValue={initial.translationOf} className="input mt-1">
              <option value="">— Yok —</option>
              {otherLocale.map((t) => (
                <option key={t.id} value={t.id}>{t.locale.toUpperCase()} · {t.title}</option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-muted">Seçersen okuyucular yazının diğer dildeki haline geçebilir.</span>
          </label>
          {published && share && <LinkedInSharePanel postUrl={share.postUrl} imageUrl={share.imageUrl} title={initial.title} />}
        </aside>
      </div>
    </form>
  );
}
