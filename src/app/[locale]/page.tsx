import Image from "next/image";
import Link from "next/link";
import { PostCard } from "@/components/site/PostCard";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SocialLinks } from "@/components/site/SocialIcon";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { db } from "@/lib/db";
import { localePath, t, type Locale } from "@/lib/i18n";
import { getProfile } from "@/lib/profile";
import { slugify } from "@/lib/text";

export const dynamic = "force-dynamic";

const container = "mx-auto max-w-5xl px-5 sm:px-6";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const d = t(locale);
  const en = locale === "en";
  const [profile, skillGroups, sections, posts] = await Promise.all([
    getProfile(),
    db.skillGroup.findMany({ orderBy: { order: "asc" } }),
    db.section.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.post.findMany({
      where: { locale, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true, readingMinutes: true, tags: true },
    }),
  ]);

  const headline = en ? profile.headlineEn : profile.headlineTr;
  const intro = en ? profile.introEn : profile.introTr;
  const status = en ? profile.statusEn : profile.statusTr;
  const nameParts = profile.name.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.pop() : "";
  const visibleSections = sections.filter((s) => (en ? s.titleEn : s.titleTr) && (en ? s.bodyEnHtml : s.bodyTrHtml));

  // Bölüm numaraları ("01", "02"…) sayfadaki sıraya göre verilir.
  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  return (
    <>
      {/* Karşılama */}
      <section className="relative isolate overflow-hidden">
        <div className="hero-backdrop absolute inset-0 -z-10" aria-hidden />
        <div className="blob -z-10 left-[8%] top-16 size-72" aria-hidden />
        <div className="blob -z-10 right-[6%] top-48 size-80 [animation-delay:-7s]" style={{ background: "color-mix(in oklab, var(--accent-2) 16%, transparent)" }} aria-hidden />

        <div className={`${container} grid items-center gap-10 pb-20 pt-12 sm:pt-20 md:grid-cols-[1fr_auto] md:pb-28`}>
          <div>
            {status && (
              <div className="fade-up">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-sm text-muted backdrop-blur">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                  </span>
                  {status}
                </p>
              </div>
            )}
            <div className="fade-up" style={{ "--delay": "60ms" } as React.CSSProperties}>
              <p className="text-lg text-muted">{d.hello}</p>
              <h1 className="mt-1 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                {nameParts.join(" ")} {lastName && <span className="text-gradient">{lastName}</span>}
              </h1>
            </div>
            {headline && (
              <div className="fade-up" style={{ "--delay": "140ms" } as React.CSSProperties}>
                <p className="mt-5 text-xl font-medium sm:text-2xl">{headline}</p>
              </div>
            )}
            {intro && (
              <div className="fade-up" style={{ "--delay": "200ms" } as React.CSSProperties}>
                <p className="mt-4 max-w-xl whitespace-pre-line text-lg leading-relaxed text-muted">{intro}</p>
              </div>
            )}
            <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ "--delay": "260ms" } as React.CSSProperties}>
              <Link href={localePath(locale, "/blog")} className="bg-gradient-accent rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--glow)] transition hover:-translate-y-0.5 hover:shadow-xl">
                {d.readPosts}
              </Link>
              <a href="#contact" className="rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-ink">
                {d.getInTouch}
              </a>
              {profile.resumeUrl && (
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-3 text-sm font-semibold text-muted transition hover:text-ink">
                  {d.downloadCv} ↓
                </a>
              )}
            </div>
            <div className="fade-up" style={{ "--delay": "320ms" } as React.CSSProperties}>
              <SocialLinks links={profile.links} className="mt-8" />
            </div>
          </div>

          <div className="fade-up order-first md:order-none" style={{ "--delay": "120ms" } as React.CSSProperties}>
            <div className="relative size-36 sm:size-52 lg:size-64">
              <div className="avatar-ring absolute inset-0 rounded-full opacity-90" aria-hidden />
              <div className="absolute inset-[5px] overflow-hidden rounded-full bg-paper p-[5px]">
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt={profile.name} width={256} height={256} priority className="size-full rounded-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center rounded-full bg-surface">
                    <span className="text-gradient font-serif text-5xl font-semibold sm:text-7xl">
                      {profile.name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yetenekler */}
      {skillGroups.length > 0 && (
        <section id="skills" className={`${container} py-16 sm:py-20`}>
          <SectionHeading index={next()} title={d.skills} subtitle={d.skillsSubtitle} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((g, i) => (
              <Reveal key={g.id} delay={i * 80} className="card-hover rounded-2xl border border-line bg-surface p-6">
                <h3 className="font-semibold">{en ? g.titleEn : g.titleTr}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li key={item} className="rounded-full border border-line bg-paper px-3 py-1 text-sm transition hover:border-accent hover:text-accent">
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Panelden eklenen bölümler */}
      {visibleSections.map((s) => {
        const title = en ? s.titleEn : s.titleTr;
        return (
          <section key={s.id} id={slugify(title)} className={`${container} py-16 sm:py-20`}>
            <SectionHeading index={next()} title={title} />
            <Reveal className="rounded-2xl border border-line bg-surface p-6 sm:p-10">
              <div className="article prose prose-lg max-w-none font-serif" dangerouslySetInnerHTML={{ __html: en ? s.bodyEnHtml : s.bodyTrHtml }} />
            </Reveal>
          </section>
        );
      })}

      {/* Yazılar */}
      <section id="writing" className={`${container} py-16 sm:py-20`}>
        <SectionHeading
          index={`${next()} — ${d.blog}`}
          title={d.latestPosts}
          subtitle={d.writingSubtitle}
          action={posts.length > 0 && <Link href={localePath(locale, "/blog")} className="text-sm font-medium text-muted transition hover:text-accent">{d.allPosts} →</Link>}
        />
        {posts.length === 0 ? (
          <Reveal><p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">{d.noPosts}</p></Reveal>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 100}>
                <PostCard post={p} locale={locale} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* İletişim */}
      <section id="contact" className={`${container} py-16 sm:py-20`}>
        <Reveal className="bg-gradient-accent relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:px-12">
          <div className="hero-backdrop absolute inset-0 opacity-40 [--dot:rgba(255,255,255,0.25)]" aria-hidden />
          <div className="relative">
            <p className="font-mono text-xs tracking-widest text-white/80">{next()} — {d.contact}</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-semibold tracking-tight sm:text-5xl">{d.contactTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">{d.contactText}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:-translate-y-0.5">
                  {d.sendEmail}
                </a>
              )}
              <Link href={localePath(locale, "/about")} className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold transition hover:bg-white/10">
                {d.moreAbout} →
              </Link>
            </div>
            {profile.links.length > 0 && (
              <div className="mt-8 flex justify-center [&_a]:border-white/30 [&_a]:bg-white/10 [&_a]:text-white [&_a:hover]:border-white [&_a:hover]:text-white">
                <SocialLinks links={profile.links} />
              </div>
            )}
          </div>
        </Reveal>
        <Reveal className="mx-auto mt-10 max-w-3xl">
          <SubscribeForm locale={locale} d={d} />
        </Reveal>
      </section>
    </>
  );
}
