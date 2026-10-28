import Link from "next/link";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SectionsAdminPage() {
  const sections = await db.section.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Bölümler</h1>
          <p className="mt-1 text-sm text-muted">Deneyim, projeler, eğitim, konuşmalar… istediğin her şey. Ana sayfada yazılardan sonra, yeteneklerden önce gösterilir.</p>
        </div>
        <Link href="/admin/sections/new" className="btn-primary">Yeni bölüm</Link>
      </div>
      {sections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">Henüz bölüm yok.</p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
          {sections.map((s, i) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <Link href={`/admin/sections/${s.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-accent">
                {s.titleTr || s.titleEn}
                {s.titleEn && s.titleTr && <span className="font-normal text-muted"> · {s.titleEn}</span>}
              </Link>
              {!s.visible && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">Gizli</span>}
              <MoveButtons model="section" id={s.id} first={i === 0} last={i === sections.length - 1} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
