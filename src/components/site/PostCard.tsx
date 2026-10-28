import Link from "next/link";
import { formatDate, localePath, t, type Locale } from "@/lib/i18n";

export type PostCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  readingMinutes: number;
  tags: string[];
};

export function PostCard({ post, locale }: { post: PostCardData; locale: Locale }) {
  const d = t(locale);
  return (
    <Link href={localePath(locale, `/blog/${post.slug}`)} className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative aspect-[16/10] overflow-hidden bg-paper">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- harici depolama adresleri değişken
          <img src={post.coverImage} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="bg-gradient-accent grid size-full place-items-center opacity-90">
            <span className="font-serif text-6xl font-semibold text-white/90">{post.title.match(/[\p{L}\p{N}]/u)?.[0]?.toLocaleUpperCase(locale) ?? "✦"}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted">
          {post.publishedAt && formatDate(post.publishedAt, locale)} · {post.readingMinutes} {d.minRead}
        </p>
        <h3 className="mt-2 font-serif text-xl font-semibold leading-snug transition group-hover:text-accent">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
        {post.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <li key={tag} className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-muted">#{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
