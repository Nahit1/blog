import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getProfile } from "@/lib/profile";
import { deleteSkillGroup, saveSkillGroup, saveSkillsHeading } from "../../actions";

export const dynamic = "force-dynamic";

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

export default async function SkillsAdminPage() {
  const [groups, profile] = await Promise.all([db.skillGroup.findMany({ orderBy: { order: "asc" } }), getProfile()]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Yetenekler</h1>
        <p className="mt-1 text-sm text-muted">Ana sayfada kartlar halinde gösterilir. Hiç grup yoksa bölüm gizlenir.</p>
      </div>

      <form action={saveSkillsHeading} className="space-y-3 rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-medium">Bölüm başlığı ve açıklaması</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Başlık (TR)</span>
            <input name="skillsTitleTr" defaultValue={profile.skillsTitleTr} placeholder={t("tr").skills} className="input mt-1" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Title (EN)</span>
            <input name="skillsTitleEn" defaultValue={profile.skillsTitleEn} placeholder={t("en").skills} className="input mt-1" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Açıklama (TR)</span>
            <input name="skillsSubtitleTr" defaultValue={profile.skillsSubtitleTr} placeholder={t("tr").skillsSubtitle} className="input mt-1" />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Description (EN)</span>
            <input name="skillsSubtitleEn" defaultValue={profile.skillsSubtitleEn} placeholder={t("en").skillsSubtitle} className="input mt-1" />
          </label>
        </div>
        <p className="text-xs text-muted">Boş bırakılan alanlarda soluk görünen varsayılan metin kullanılır.</p>
        <button className="btn-secondary">Kaydet</button>
      </form>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Gruplar</h2>
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
                <ConfirmSubmit message={`"${g.titleTr}" grubu silinsin mi?`} className="text-xs text-red-400 underline">Sil</ConfirmSubmit>
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

    </div>
  );
}
