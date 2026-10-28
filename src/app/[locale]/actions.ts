"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { confirmMail, sendMails } from "@/lib/mail";
import { localePath } from "@/lib/i18n";

export type SubscribeState = { status: "idle" | "sent" | "error" };

const schema = z.object({
  email: z.email().max(254).transform((e) => e.trim().toLowerCase()),
  locales: z.array(z.enum(["tr", "en"])).min(1),
  locale: z.enum(["tr", "en"]),
});

export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    locales: formData.getAll("locales"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { status: "error" };
  const { email, locales, locale } = parsed.data;

  const existing = await db.subscriber.findUnique({ where: { email } });
  if (existing?.confirmed) {
    // Zaten abone: yalnızca dil tercihini güncelle, adresin kayıtlı olduğunu belli etme.
    await db.subscriber.update({ where: { email }, data: { locales: Array.from(new Set([...existing.locales, ...locales])) } });
    return { status: "sent" };
  }

  const token = existing?.token ?? randomBytes(24).toString("base64url");
  await db.subscriber.upsert({
    where: { email },
    update: { locales },
    create: { email, locales, token },
  });
  await sendMails([confirmMail(email, token, locale)]);
  return { status: "sent" };
}

export async function unsubscribe(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const locale = formData.get("locale") === "en" ? "en" : "tr";
  if (token) await db.subscriber.deleteMany({ where: { token } });
  redirect(`${localePath(locale, "/newsletter/unsubscribe")}?done=1`);
}
