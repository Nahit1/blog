import Link from "next/link";
import { LinkedInShareButton } from "@/components/admin/LinkedInShare";
import { NotifyButton } from "@/components/admin/NotifyButton";
import { db } from "@/lib/db";
import { formatDate, localePath } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const posts = await db.post.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: { id: true, title: true, slug: true, locale: true, status: true, publishedAt: true, notifiedAt: true, updatedAt: true, _count: { select: { likes: true, comments: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Yazılar</h1>
        <Link href="/admin/posts/new" className="btn-primary">Yeni yazı</Link>
      </div>
      {posts.length === 0 ? (
        <p className="text-sm text-muted">Henüz yazı yok.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Başlık</th>
                <th className="px-4 py-3 font-medium">Dil</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">Etkileşim</th>
                <th className="px-4 py-3 font-medium">Bildirim</th>
                <th className="px-4 py-3 font-medium">Paylaş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-xs px-4 py-3">
                    <Link href={`/admin/posts/${p.id}`} className="block truncate font-medium hover:text-accent">{p.title}</Link>
                    <span className="text-xs text-muted">Güncellendi: {formatDate(p.updatedAt, "tr")}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{p.locale.toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${p.status === "PUBLISHED" ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"}`}>
                      {p.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    <span title="Beğeni">♥ {p._count.likes}</span>
                    <Link href="/admin/comments" title="Yorum" className="ml-3 hover:text-ink">💬 {p._count.comments}</Link>
                  </td>
                  <td className="px-4 py-3">
                    {p.notifiedAt ? (
                      <span className="text-xs text-muted">Gönderildi · {formatDate(p.notifiedAt, "tr")}</span>
                    ) : p.status === "PUBLISHED" ? (
                      <NotifyButton postId={p.id} title={p.title} />
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "PUBLISHED" ? <LinkedInShareButton postUrl={absoluteUrl(localePath(p.locale, `/blog/${p.slug}`))} compact /> : <span className="text-xs text-muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
