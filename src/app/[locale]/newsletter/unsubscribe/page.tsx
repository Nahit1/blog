import Link from "next/link";
import { unsubscribe } from "../../actions";
import { localePath, t, type Locale } from "@/lib/i18n";

export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ token?: string; done?: string }>;
}) {
  const [{ locale }, { token, done }] = await Promise.all([params, searchParams]);
  const d = t(locale);

  return (
    <div className="mx-auto max-w-md pt-20 text-center">
      <h1 className="font-serif text-3xl font-semibold">{d.unsubscribeTitle}</h1>
      {done ? (
        <p className="mt-4 text-muted">{d.unsubscribedText}</p>
      ) : token ? (
        <form action={unsubscribe} className="mt-6 space-y-6">
          <p className="text-muted">{d.unsubscribeText}</p>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="locale" value={locale} />
          <button className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:opacity-90">{d.unsubscribeButton}</button>
        </form>
      ) : (
        <p className="mt-4 text-muted">{d.invalidLink}</p>
      )}
      <Link href={localePath(locale)} className="mt-8 inline-block text-sm underline underline-offset-4">{d.backHome}</Link>
    </div>
  );
}
