import Image from "next/image";
import Link from "next/link";
import { PostList } from "@/components/site/PostList";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { db } from "@/lib/db";
import { localePath, t, type Locale } from "@/lib/i18n";
import { getProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const d = t(locale);
  const [profile, posts] = await Promise.all([
    getProfile(),
    db.post.findMany({
      where: { locale, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true, readingMinutes: true },
    }),
  ]);
  const headline = locale === "en" ? profile.headlineEn : profile.headlineTr;
  const intro = locale === "en" ? profile.introEn : profile.introTr;

  return (
    <div className="space-y-20 pt-10 sm:pt-16">
      <section className="flex flex-col-reverse gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{profile.name}</h1>
          {headline && <p className="mt-3 text-lg text-accent">{headline}</p>}
          {intro && <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted">{intro}</p>}
          <Link href={localePath(locale, "/about")} className="mt-6 inline-block text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-ink">
            {d.about} →
          </Link>
        </div>
        {profile.avatarUrl && (
          <Image
            src={profile.avatarUrl}
            alt={profile.name}
            width={160}
            height={160}
            priority
            className="size-28 rounded-full object-cover sm:size-40"
          />
        )}
      </section>

      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{d.latestPosts}</h2>
          <Link href={localePath(locale, "/blog")} className="text-sm text-muted hover:text-ink">{d.allPosts} →</Link>
        </div>
        <PostList posts={posts} locale={locale} />
      </section>

      <SubscribeForm locale={locale} d={d} />
    </div>
  );
}
