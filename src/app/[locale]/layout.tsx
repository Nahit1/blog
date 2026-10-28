import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { db } from "@/lib/db";
import { inter, serif } from "@/lib/fonts";
import { isLocale, locales } from "@/lib/i18n";
import { getProfile } from "@/lib/profile";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const profile = await getProfile();
  const description = (locale === "en" ? profile.headlineEn : profile.headlineTr) || undefined;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: profile.name, template: `%s · ${profile.name}` },
    description,
    alternates: { languages: { tr: "/", en: "/en" } },
    openGraph: { siteName: profile.name, locale: locale === "en" ? "en_US" : "tr_TR", type: "website" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [profile, skillCount] = await Promise.all([getProfile(), db.skillGroup.count()]);

  return (
    <html lang={locale} className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader locale={locale} name={profile.name} hasSkills={skillCount > 0} />
        <main>{children}</main>
        <SiteFooter name={profile.name} links={profile.links} />
      </body>
    </html>
  );
}
