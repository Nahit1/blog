"use client";

import { useActionState } from "react";
import { addComment, type CommentState } from "@/app/[locale]/actions";
import type { Dictionary } from "@/lib/i18n";

export function CommentForm({ postId, d }: { postId: string; d: Dictionary }) {
  const [state, action, pending] = useActionState<CommentState, FormData>(addComment, { status: "idle" });
  const message = state.status === "sent" ? d.commentSent : state.status === "invalid" ? d.commentInvalid : state.status === "tooMany" ? d.commentTooMany : null;

  return (
    // Başarılı gönderimden sonra key değişir ve form temizlenir; hatada yazılanlar korunur.
    <form key={state.status === "sent" ? state.key : "form"} action={action} className="space-y-3 rounded-2xl border border-line bg-surface p-5">
      <input type="hidden" name="postId" value={postId} />
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input name="name" required minLength={2} maxLength={60} placeholder={d.commentName} aria-label={d.commentName} autoComplete="name" className="input" />
      <textarea name="body" required minLength={2} maxLength={2000} rows={4} placeholder={d.commentBody} aria-label={d.commentBody} className="input resize-y" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        {message ? (
          <p role="status" className={`text-sm ${state.status === "sent" ? "text-green-300" : "text-red-400"}`}>{message}</p>
        ) : (
          <span />
        )}
        <button disabled={pending} className="bg-gradient-accent rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
          {d.commentSubmit}
        </button>
      </div>
    </form>
  );
}
