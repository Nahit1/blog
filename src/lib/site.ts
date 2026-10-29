export const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Paylaşım (LinkedIn, X…) görseli: kapak varsa o, yoksa otomatik üretilen başlıklı görsel. */
export function shareImageUrl(post: { id: string; coverImage: string | null; updatedAt?: Date }) {
  if (post.coverImage) return post.coverImage.startsWith("http") ? post.coverImage : absoluteUrl(post.coverImage);
  return absoluteUrl(`/api/og/${post.id}${post.updatedAt ? `?v=${post.updatedAt.getTime()}` : ""}`);
}
