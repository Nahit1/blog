import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/i18n";
import { deleteSubscriber } from "../../actions";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  const confirmed = subscribers.filter((s) => s.confirmed).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Aboneler</h1>
        <p className="mt-1 text-sm text-muted">{confirmed} onaylı · {subscribers.length - confirmed} onay bekliyor</p>
      </div>
      {subscribers.length === 0 ? (
        <p className="text-sm text-muted">Henüz abone yok.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">E-posta</th>
                <th className="px-4 py-3 font-medium">Diller</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">Kayıt</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-xs">{s.locales.map((l) => l.toUpperCase()).join(", ")}</td>
                  <td className="px-4 py-3 text-xs">{s.confirmed ? "Onaylı" : "Bekliyor"}</td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(s.createdAt, "tr")}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteSubscriber}>
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmSubmit message={`${s.email} silinsin mi?`} className="text-xs text-red-400 underline">Sil</ConfirmSubmit>
                    </form>
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
