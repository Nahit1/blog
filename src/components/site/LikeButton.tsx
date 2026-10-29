"use client";

import { useState, useTransition } from "react";
import { toggleLike } from "@/app/[locale]/actions";

export function LikeButton({ postId, initialCount, initialLiked, labels }: { postId: string; initialCount: number; initialLiked: boolean; labels: { like: string; unlike: string; likes: string } }) {
  const [state, setState] = useState({ liked: initialLiked, count: initialCount });
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={state.liked}
      aria-label={state.liked ? labels.unlike : labels.like}
      onClick={() => {
        // İyimser güncelleme: sunucu yanıtı gelince kesin değerle düzeltilir.
        setState((s) => ({ liked: !s.liked, count: s.count + (s.liked ? -1 : 1) }));
        start(async () => setState(await toggleLike(postId)));
      }}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        state.liked ? "border-accent/60 bg-accent/10 text-accent" : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
      }`}
    >
      <svg viewBox="0 0 24 24" className={`size-5 transition group-active:scale-90 ${state.liked ? "fill-current" : "fill-none"}`} stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinejoin="round" d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 3.5 0 5.6 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />
      </svg>
      <span className="tabular-nums">{state.count}</span>
      <span className="sr-only">{labels.likes}</span>
    </button>
  );
}
