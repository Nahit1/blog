import Link from "next/link";
import { localePath, t, type Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./LanguageSwitch";

export function SiteHeader({ locale, name }: { locale: Locale; name: string }) {
  const d = t(locale);
  return (
    <header className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-6 sm:px-6">
      <Link href={localePath(locale)} className="font-serif text-lg font-semibold tracking-tight">
        {name}
      </Link>
      <nav className="flex items-center gap-5 text-sm text-muted">
        <Link href={localePath(locale, "/blog")} className="hover:text-ink">{d.blog}</Link>
        <Link href={localePath(locale, "/about")} className="hover:text-ink">{d.about}</Link>
        <LanguageSwitch locale={locale} />
      </nav>
    </header>
  );
}
