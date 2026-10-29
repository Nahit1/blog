import { db } from "@/lib/db";
import { formatDate, t, type Locale } from "@/lib/i18n";
import { CommentForm } from "./CommentForm";

export async function Comments({ postId, locale }: { postId: string; locale: Locale }) {
  const d = t(locale);
  const comments = await db.comment.findMany({ where: { postId }, orderBy: { createdAt: "asc" }, select: { id: true, name: true, body: true, createdAt: true } });

  return (
    <section id="comments" className="mt-16 scroll-mt-24">
      <h2 className="font-serif text-2xl font-semibold">
        {d.comments} <span className="text-base font-normal text-muted">({comments.length})</span>
      </h2>
      {comments.length === 0 ? (
        <p className="mt-4 text-muted">{d.noComments}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <span className="bg-gradient-accent grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold uppercase text-white" aria-hidden>
                {c.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3">
                <p className="text-sm">
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-muted"> · {formatDate(c.createdAt, locale)}</span>
                </p>
                <p className="mt-1.5 whitespace-pre-line break-words leading-relaxed">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8">
        <CommentForm postId={postId} d={d} />
      </div>
    </section>
  );
}
