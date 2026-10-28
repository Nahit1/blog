import Link from "next/link";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { db } from "@/lib/db";
import { deleteSkillGroup, moveItem, saveSkillGroup } from "../../actions";

export const dynamic = "force-dynamic";

function MoveButtons({ model, id, first, last }: { model: "skillGroup" | "section"; id: string; first: boolean; last: boolean }) {
  return (
    <div className="flex gap-1">
      {(["up", "down"] as const).map((dir) => (
        <form key={dir} action={moveItem}>
          <input type="hidden" name="model" value={model} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="dir" value={dir} />
          <button
            disabled={dir === "up" ? first : last}
            aria-label={dir === "up" ? "Yukarı taşı" : "Aşağı taşı"}
            className="grid size-8 place-items-center rounded-md border border-line text-sm text-muted hover:border-ink hover:text-ink disabled:opacity-30"
          >
            {dir === "up" ? "↑" : "↓"}
          </button>
        </form>
      ))}
    </div>
  );
}

function SkillGroupFields({ titleTr = "", titleEn = "", items = "" }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm">
        <span className="text-muted">Grup adı (TR)</span>
        <input name="titleTr" defaultValue={titleTr} required className="input mt-1" placeholder="Backend" />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Group name (EN)</span>
        <input name="titleEn" defaultValue={titleEn} className="input mt-1" placeholder="Backend" />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="text-muted">Yetenekler — virgülle ayır</span>
        <textarea name="items" defaultValue={items} rows={2} className="input mt-1" placeholder="Node.js, PostgreSQL, Docker" />
      </label>
    </div>
  );
}

export default async function HomeAdminPage() {
  const [groups, sections] = await Promise.all([
    db.skillGroup.findMany({ orderBy: { order: "asc" } }),
    db.section.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-14">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Ana sayfa</h1>
        <p className="mt-1 text-sm text-muted">
          Karşılama alanındaki ad, unvan, durum rozeti, fotoğraf ve CV <Link href="/admin/profile" className="underline">Hakkımda</Link> sayfasından düzenlenir.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Yetenekler</h2>
          <p className="text-sm text-muted">Ana sayfada kartlar halinde gösterilir. Hiç grup yoksa bölüm gizlenir.</p>
        </div>
        {groups.map((g, i) => (
          <div key={g.id} className="rounded-xl border border-line bg-surface p-4">
            <form action={saveSkillGroup} className="space-y-3">
              <input type="hidden" name="id" value={g.id} />
              <SkillGroupFields titleTr={g.titleTr} titleEn={g.titleEn} items={g.items.join(", ")} />
              <button className="btn-secondary">Kaydet</button>
            </form>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <MoveButtons model="skillGroup" id={g.id} first={i === 0} last={i === groups.length - 1} />
              <form action={deleteSkillGroup}>
                <input type="hidden" name="id" value={g.id} />
                <ConfirmSubmit message={`"${g.titleTr}" grubu silinsin mi?`} className="text-xs text-red-600 underline">Sil</ConfirmSubmit>
              </form>
            </div>
          </div>
        ))}
        <form action={saveSkillGroup} className="space-y-3 rounded-xl border border-dashed border-line p-4">
          <p className="text-sm font-medium">Yeni grup ekle</p>
          <SkillGroupFields />
          <button className="btn-primary">Ekle</button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Özel bölümler</h2>
            <p className="text-sm text-muted">Deneyim, projeler, eğitim, konuşmalar… istediğin her şey. Yeteneklerden sonra, yazılardan önce gösterilir.</p>
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
                {!s.visible && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Gizli</span>}
                <MoveButtons model="section" id={s.id} first={i === 0} last={i === sections.length - 1} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
