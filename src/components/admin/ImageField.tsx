"use client";

import { useState } from "react";
import { pickFile, uploadFile, type UploadMode } from "./upload";

/** Tek bir dosya adresini (kapak, profil fotoğrafı, CV) yükleyip gizli input'ta tutar. */
export function ImageField({ name, label, defaultValue, uploadMode, rounded, accept = "image/*" }: { name: string; label: string; defaultValue?: string | null; uploadMode: UploadMode; rounded?: boolean; accept?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);

  async function choose() {
    const file = await pickFile(accept);
    if (!file) return;
    setBusy(true);
    try {
      setUrl(await uploadFile(file, uploadMode));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-sm">
      <span className="text-muted">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="mt-1 flex items-center gap-3">
        {url && !accept.startsWith("image") ? (
          <a href={url} target="_blank" className="max-w-40 truncate text-xs underline">{url.split("/").pop()}</a>
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element -- yüklenen dosyanın önizlemesi
          <img src={url} alt="" className={`object-cover ring-1 ring-line ${rounded ? "size-16 rounded-full" : "h-16 w-28 rounded-lg"}`} />
        ) : (
          <div className={`grid place-items-center bg-surface text-xs text-muted ring-1 ring-line ${rounded ? "size-16 rounded-full" : "h-16 w-28 rounded-lg"}`}>Yok</div>
        )}
        <button type="button" onClick={choose} disabled={busy} className="btn-secondary">{busy ? "Yükleniyor…" : url ? "Değiştir" : "Yükle"}</button>
        {url && <button type="button" onClick={() => setUrl("")} className="text-xs text-muted underline">Kaldır</button>}
      </div>
    </div>
  );
}
