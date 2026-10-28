"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; type: "success" | "error"; message: string };

/** Sunucunun bıraktığı flash mesajını sağ altta toast olarak gösterir ve çerezi temizler. */
export function Toaster({ flash }: { flash: Toast | null }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const flashId = flash?.id;

  useEffect(() => {
    if (!flash) return;
    document.cookie = "nf_flash=; Max-Age=0; path=/admin";
    setToasts((list) => (list.some((t) => t.id === flash.id) ? list : [...list, flash]));
    const timer = setTimeout(() => setToasts((list) => list.filter((t) => t.id !== flash.id)), flash.type === "error" ? 6000 : 3500);
    return () => clearTimeout(timer);
    // Aynı mesaj tekrar render edildiğinde değil, yalnızca yeni bir flash geldiğinde çalışır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashId]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === "error" ? "alert" : "status"}
          className={`toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface px-4 py-3 text-sm shadow-2xl shadow-black/40 ${
            t.type === "error" ? "border-red-500/40" : "border-green-500/40"
          }`}
        >
          <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold text-black ${t.type === "error" ? "bg-red-400" : "bg-green-400"}`}>
            {t.type === "error" ? "!" : "✓"}
          </span>
          <p className="flex-1 leading-snug">{t.message}</p>
          <button type="button" aria-label="Kapat" onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))} className="text-muted hover:text-ink">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
