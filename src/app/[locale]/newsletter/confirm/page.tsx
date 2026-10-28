import Link from "next/link";
import { db } from "@/lib/db";
import { localePath, t, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ locale }, { token }] = await Promise.all([params, searchParams]);
  const d = t(locale);
  const subscriber = token ? await db.subscriber.findUnique({ where: { token } }) : null;
  if (subscriber && !subscriber.confirmed) {
    await db.subscriber.update({ where: { id: subscriber.id }, data: { confirmed: true, confirmedAt: new Date() } });
  }

  return (
    <div className="mx-auto max-w-md pt-20 text-center">
      <h1 className="font-serif text-3xl font-semibold">{subscriber ? d.confirmedTitle : "—"}</h1>
      <p className="mt-4 text-muted">{subscriber ? d.confirmedText : d.invalidLink}</p>
      <Link href={localePath(locale)} className="mt-8 inline-block text-sm underline underline-offset-4">{d.backHome}</Link>
    </div>
  );
}
