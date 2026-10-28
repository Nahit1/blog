"use client";

import { useState, useTransition } from "react";
import { notifySubscribers } from "@/app/admin/actions";

export function NotifyButton({ postId, title }: { postId: string; title: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`"${title}" yazısı için tüm onaylı abonelere e-posta gönderilsin mi? Bu işlem geri alınamaz.`)) return;
          start(async () => {
            const res = await notifySubscribers(postId);
            setMessage(res.error ?? res.ok ?? null);
          });
        }}
        className="text-xs font-medium text-accent underline disabled:opacity-50"
      >
        {pending ? "Gönderiliyor…" : "Abonelere bildir"}
      </button>
      {message && <span className="text-xs text-muted">{message}</span>}
    </span>
  );
}
