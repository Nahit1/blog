import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { db } from "@/lib/db";
import { formatDate, localePath, t, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ locale: Locale; slug: string }> };

async function getPost(locale: Locale, slug: string) {
  const post = await db.post.findUnique({ where: { locale_slug: { locale, slug: decodeURIComponent(slug) } } });
  return post?.status === "PUBLISHED" ? post : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: localePath(locale, `/blog/${post.slug}`) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) notFound();
  const d = t(locale);

  const translation = post.translationKey
    ? await db.post.findFirst({
        where: { translationKey: post.translationKey, locale: { not: locale }, status: "PUBLISHED" },
        select: { slug: true, locale: true },
      })
    : null;

  return (
    <article className="pt-10">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-wider text-muted">
          {post.publishedAt && formatDate(post.publishedAt, locale)} · {post.readingMinutes} {d.minRead}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-xl leading-relaxed text-muted">{post.excerpt}</p>}
        {translation && (
          <Link
            href={localePath(translation.locale, `/blog/${translation.slug}`)}
            className="mt-5 inline-block rounded-full border border-line px-3 py-1 text-sm text-muted hover:border-ink hover:text-ink"
          >
            {d.readThisIn} →
          </Link>
        )}
      </header>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element -- harici depolama adresleri değişken
        <img src={post.coverImage} alt="" className="mb-10 w-full rounded-xl object-cover" />
      )}

      <div
        className="article prose prose-lg max-w-none font-serif prose-headings:font-serif prose-headings:tracking-tight"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {post.tags.length > 0 && (
        <ul className="mt-12 flex flex-wrap gap-2" aria-label={d.tags}>
          {post.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-surface px-3 py-1 text-xs text-muted ring-1 ring-line">#{tag}</li>
          ))}
        </ul>
      )}

      <div className="mt-16">
        <SubscribeForm locale={locale} d={d} />
      </div>
    </article>
  );
}
