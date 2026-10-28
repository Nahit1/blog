import type { Metadata } from "next";
import Image from "next/image";
import { t, type Locale } from "@/lib/i18n";
import { getProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: t(locale).about, alternates: { languages: { tr: "/about", en: "/en/about" } } };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const d = t(locale);
  const profile = await getProfile();
  const headline = locale === "en" ? profile.headlineEn : profile.headlineTr;
  const bio = locale === "en" ? profile.bioEnHtml : profile.bioTrHtml;

  return (
    <div className="pt-10">
      <div className="mb-10 flex items-center gap-5">
        {profile.avatarUrl && (
          <Image src={profile.avatarUrl} alt={profile.name} width={96} height={96} className="size-20 rounded-full object-cover sm:size-24" />
        )}
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{profile.name}</h1>
          {headline && <p className="mt-1 text-accent">{headline}</p>}
          {profile.location && <p className="mt-1 text-sm text-muted">{profile.location}</p>}
        </div>
      </div>

      {bio && <div className="article prose prose-lg max-w-none font-serif" dangerouslySetInnerHTML={{ __html: bio }} />}

      {(profile.email || profile.links.length > 0) && (
        <section className="mt-14 border-t border-line pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{d.contact}</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {profile.email && (
              <li>
                <a href={`mailto:${profile.email}`} className="rounded-full border border-line px-4 py-1.5 text-sm hover:border-ink">{profile.email}</a>
              </li>
            )}
            {profile.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-4 py-1.5 text-sm hover:border-ink">{l.label}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
