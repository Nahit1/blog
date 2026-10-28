import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { localePath } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, locale: true, updatedAt: true } });
  const pages = ["/", "/blog", "/about"].flatMap((p) => (["tr", "en"] as const).map((l) => ({ url: absoluteUrl(localePath(l, p)) })));
  return [...pages, ...posts.map((p) => ({ url: absoluteUrl(localePath(p.locale, `/blog/${p.slug}`)), lastModified: p.updatedAt }))];
}
