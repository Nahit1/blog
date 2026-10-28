"use client";

import { useActionState } from "react";
import { subscribe, type SubscribeState } from "@/app/[locale]/actions";
import type { Dictionary, Locale } from "@/lib/i18n";

export function SubscribeForm({ locale, d }: { locale: Locale; d: Dictionary }) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, { status: "idle" });

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h2 className="font-serif text-xl font-semibold">{d.subscribeTitle}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{d.subscribeText}</p>
      {state.status === "sent" ? (
        <p className="mt-5 rounded-lg bg-paper px-4 py-3 text-sm" role="status">{d.subscribeSent}</p>
      ) : (
        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              name="email"
              required
              placeholder={d.emailPlaceholder}
              aria-label={d.emailPlaceholder}
              className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
            <button
              disabled={pending}
              className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
            >
              {d.subscribe}
            </button>
          </div>
          <fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            <legend className="sr-only">{d.languagesLabel}</legend>
            <span>{d.languagesLabel}</span>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="locales" value="tr" defaultChecked={locale === "tr"} className="accent-[var(--accent)]" /> {d.turkish}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="locales" value="en" defaultChecked={locale === "en"} className="accent-[var(--accent)]" /> {d.english}
            </label>
          </fieldset>
          {state.status === "error" && <p className="text-sm text-red-400" role="alert">{d.subscribeInvalid}</p>}
        </form>
      )}
    </section>
  );
}
