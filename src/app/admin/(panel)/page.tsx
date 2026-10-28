import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [published, drafts, subscribers, pending, recent] = await Promise.all([
    db.post.count({ where: { status: "PUBLISHED" } }),
    db.post.count({ where: { status: "DRAFT" } }),
    db.subscriber.count({ where: { confirmed: true } }),
    db.subscriber.count({ where: { confirmed: false } }),
    db.post.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, locale: true, status: true } }),
  ]);

  const stats = [
    { label: "Yayındaki yazı", value: published },
    { label: "Taslak", value: drafts },
    { label: "Onaylı abone", value: subscribers },
    { label: "Onay bekleyen", value: pending },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Genel bakış</h1>
        <Link href="/admin/posts/new" className="btn-primary">Yeni yazı</Link>
      </div>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
            <dt className="text-xs text-muted">{s.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Son düzenlenenler</h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Henüz yazı yok. İlk yazını oluşturarak başla.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/posts/${p.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-paper">
                  <span className="truncate">{p.title}</span>
                  <span className="shrink-0 text-xs text-muted">{p.locale.toUpperCase()} · {p.status === "PUBLISHED" ? "Yayında" : "Taslak"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
