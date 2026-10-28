import Link from "next/link";
import { formatDate, localePath, t, type Locale } from "@/lib/i18n";

type Item = { id: string; slug: string; title: string; excerpt: string | null; publishedAt: Date | null; readingMinutes: number };

export function PostList({ posts, locale }: { posts: Item[]; locale: Locale }) {
  const d = t(locale);
  if (posts.length === 0) return <p className="text-muted">{d.noPosts}</p>;
  return (
    <ul className="divide-y divide-line">
      {posts.map((p) => (
        <li key={p.id} className="py-6 first:pt-0">
          <Link href={localePath(locale, `/blog/${p.slug}`)} className="group block">
            <p className="text-xs uppercase tracking-wider text-muted">
              {p.publishedAt && formatDate(p.publishedAt, locale)} · {p.readingMinutes} {d.minRead}
            </p>
            <h3 className="mt-1.5 font-serif text-xl font-semibold leading-snug group-hover:text-accent">{p.title}</h3>
            {p.excerpt && <p className="mt-2 leading-relaxed text-muted">{p.excerpt}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
