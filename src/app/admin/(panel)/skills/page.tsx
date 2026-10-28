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
        <textarea name="items" defaultValue={items} rows={2} required className="input mt-1" placeholder="Node.js, PostgreSQL, Docker" />
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
        <p className="mt-1 text-sm text-muted">Her grup ana sayfada bir kart olarak gösterilir (örn. Backend, Frontend, Araçlar).</p>
      </div>

      {groups.length === 0 && (
        <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Henüz grup yok. Yetenekler bölümünün ana sayfada görünmesi için en az bir grup ekle.
        </p>
      )}

      <form action={saveSkillGroup} className="space-y-3 rounded-xl border border-accent/40 bg-surface p-4">
        <p className="text-sm font-medium">Yeni grup ekle</p>
        <SkillGroupFields />
        <button className="btn-primary">Ekle</button>
      </form>

      {groups.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Gruplar ({groups.length})</h2>
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
        </section>
      )}

      <details className="group rounded-xl border border-line bg-surface p-4" open={Boolean(profile.skillsTitleTr || profile.skillsTitleEn || profile.skillsSubtitleTr || profile.skillsSubtitleEn)}>
        <summary className="cursor-pointer text-sm font-medium">Bölüm başlığı ve açıklaması <span className="font-normal text-muted">(isteğe bağlı)</span></summary>
        <form action={saveSkillsHeading} className="mt-4 space-y-3">
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
          <p className="text-xs text-muted">Ana sayfadaki bölüm başlığını değiştirir. Boş alanlarda soluk görünen varsayılan metin kullanılır; İngilizce başlık boşsa Türkçe başlık gösterilir.</p>
          <button className="btn-secondary">Kaydet</button>
        </form>
      </details>
    </div>
  );
}
