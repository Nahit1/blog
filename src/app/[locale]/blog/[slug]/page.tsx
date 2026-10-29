import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Comments } from "@/components/site/Comments";
import { LikeButton } from "@/components/site/LikeButton";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { db } from "@/lib/db";
import { formatDate, localePath, t, type Locale } from "@/lib/i18n";
import { shareImageUrl } from "@/lib/site";
import { getVisitorId } from "@/lib/visitor";

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
      images: [{ url: shareImageUrl(post), width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt ?? undefined, images: [shareImageUrl(post)] },
  };
}

export default async function PostPage({ params }: Params) {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) notFound();
  const d = t(locale);

  const visitorId = await getVisitorId();
  const [translation, likeCount, liked, commentCount] = await Promise.all([
    post.translationKey
      ? db.post.findFirst({
          where: { translationKey: post.translationKey, locale: { not: locale }, status: "PUBLISHED" },
          select: { slug: true, locale: true },
        })
      : null,
    db.postLike.count({ where: { postId: post.id } }),
    visitorId ? db.postLike.findUnique({ where: { postId_visitorId: { postId: post.id, visitorId } } }).then(Boolean) : false,
    db.comment.count({ where: { postId: post.id } }),
  ]);

  return (
    <article className="mx-auto max-w-3xl px-5 sm:px-6 pt-10">
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
        <ul className="mt-10 flex flex-wrap gap-2" aria-label={d.tags}>
          {post.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-surface px-3 py-1 text-xs text-muted ring-1 ring-line">#{tag}</li>
          ))}
        </ul>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <LikeButton postId={post.id} initialCount={likeCount} initialLiked={liked} labels={{ like: d.like, unlike: d.unlike, likes: d.likes }} />
        <a href="#comments" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinejoin="round" d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5v-9Z" />
          </svg>
          <span className="tabular-nums">{commentCount}</span>
          <span className="sr-only">{d.comments}</span>
        </a>
      </div>

      <Comments postId={post.id} locale={locale} />

      <div className="mt-16">
        <SubscribeForm locale={locale} d={d} />
      </div>
    </article>
  );
}
