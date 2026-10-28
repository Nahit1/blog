import { db } from "./db";
import type { Locale } from "./i18n";

const listSelect = {
  id: true,
  locale: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  readingMinutes: true,
  tags: true,
  translationKey: true,
} as const;

/**
 * Bir dilin sayfalarında listelenecek yazılar: o dildeki yazılar, artı bu dilde
 * çevirisi olmayan diğer dildeki yazılar (kartta dil etiketiyle gösterilir).
 */
export async function listPosts(locale: Locale, take?: number) {
  const posts = await db.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: listSelect,
  });
  const translatedKeys = new Set(posts.filter((p) => p.locale === locale && p.translationKey).map((p) => p.translationKey));
  const visible = posts.filter((p) => p.locale === locale || !p.translationKey || !translatedKeys.has(p.translationKey));
  return take ? visible.slice(0, take) : visible;
}

export type ListedPost = Awaited<ReturnType<typeof listPosts>>[number];
