import Link from "next/link";
import { localePath, t, type Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./LanguageSwitch";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toLocaleUpperCase("tr");
}

export function SiteHeader({ locale, name }: { locale: Locale; name: string }) {
  const d = t(locale);
  const home = localePath(locale);
  const nav = [
    { href: localePath(locale, "/about"), label: d.about },
    { href: `${home === "/" ? "" : home}/#skills`, label: d.skills, desktopOnly: true },
    { href: localePath(locale, "/blog"), label: d.blog },
    { href: `${home === "/" ? "" : home}/#contact`, label: d.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-paper/70 backdrop-blur-md supports-[backdrop-filter]:bg-paper/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <Link href={home} className="group flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="bg-gradient-accent grid size-9 place-items-center rounded-xl font-mono text-sm text-white shadow-sm transition group-hover:rotate-6">
            {initials(name)}
          </span>
          <span className="hidden font-serif text-lg sm:inline">{name}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted sm:gap-6">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={`transition hover:text-ink ${n.desktopOnly ? "hidden md:inline" : ""}`}>
              {n.label}
            </Link>
          ))}
          <LanguageSwitch locale={locale} />
        </nav>
      </div>
    </header>
  );
}
