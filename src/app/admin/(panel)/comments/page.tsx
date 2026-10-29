import Link from "next/link";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { db } from "@/lib/db";
import { localePath } from "@/lib/i18n";
import { deleteComment } from "../../actions";

export const dynamic = "force-dynamic";

const dateTime = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function CommentsAdminPage() {
  const comments = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { post: { select: { id: true, title: true, slug: true, locale: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Yorumlar</h1>
        <p className="mt-1 text-sm text-muted">Yorumlar gönderildiği anda yayınlanır. Uygun olmayanları buradan silebilirsin.</p>
      </div>
      {comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">Henüz yorum yok.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 text-sm">
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-muted"> · {dateTime.format(c.createdAt)} · </span>
                  <a href={`${localePath(c.post.locale, `/blog/${c.post.slug}`)}#comments`} target="_blank" className="text-accent hover:underline">
                    {c.post.title}
                  </a>
                </div>
                <form action={deleteComment}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmSubmit message={`${c.name} adlı kişinin yorumu silinsin mi?`} className="text-xs text-red-400 underline">Sil</ConfirmSubmit>
                </form>
              </div>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">{c.body}</p>
              <Link href={`/admin/posts/${c.post.id}`} className="mt-2 inline-block text-xs text-muted hover:text-ink">Yazıyı düzenle →</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
