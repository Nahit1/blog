"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const rest = locale === "en" ? pathname.replace(/^\/en/, "") || "/" : pathname;
  // Yazı adresleri dile göre farklıdır; çeviri linki yazının kendi sayfasında gösterilir.
  const target = rest.startsWith("/blog/") ? "/blog" : rest;
  const href = locale === "tr" ? `/en${target === "/" ? "" : target}` : target;

  return (
    <Link
      href={href}
      className="rounded-full border border-line px-2.5 py-1 text-xs font-medium tracking-wide text-muted transition hover:border-ink hover:text-ink"
      aria-label={locale === "tr" ? "Switch to English" : "Türkçeye geç"}
    >
      {locale === "tr" ? "EN" : "TR"}
    </Link>
  );
}
