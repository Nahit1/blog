"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { confirmMail, sendMails } from "@/lib/mail";
import { localePath } from "@/lib/i18n";
import { getIpHash, getVisitorId } from "@/lib/visitor";

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

// ---------- Yorumlar ----------

export type CommentState = { status: "idle" | "sent" | "invalid" | "tooMany"; key?: number };

const commentSchema = z.object({
  postId: z.string().min(1),
  name: z.string().trim().min(2).max(60),
  body: z.string().trim().min(2).max(2000),
});

export async function addComment(_prev: CommentState, formData: FormData): Promise<CommentState> {
  // Bot tuzağı: insanlar bu gizli alanı görmez ve doldurmaz.
  if (String(formData.get("website") ?? "")) return { status: "sent", key: Date.now() };

  const parsed = commentSchema.safeParse({ postId: formData.get("postId"), name: formData.get("name"), body: formData.get("body") });
  if (!parsed.success) return { status: "invalid" };

  const ipHash = await getIpHash();
  const recent = await db.comment.count({ where: { ipHash, createdAt: { gt: new Date(Date.now() - 10 * 60_000) } } });
  if (recent >= 5) return { status: "tooMany" };

  const post = await db.post.findFirst({ where: { id: parsed.data.postId, status: "PUBLISHED" }, select: { id: true } });
  if (!post) return { status: "invalid" };

  await db.comment.create({ data: { postId: post.id, name: parsed.data.name, body: parsed.data.body, ipHash } });
  revalidatePath("/[locale]/blog/[slug]", "page");
  return { status: "sent", key: Date.now() };
}

// ---------- Beğeniler ----------

export async function toggleLike(postId: string): Promise<{ liked: boolean; count: number }> {
  const post = await db.post.findFirst({ where: { id: postId, status: "PUBLISHED" }, select: { id: true } });
  if (!post) return { liked: false, count: 0 };
  const visitorId = await getVisitorId(true);
  const key = { postId_visitorId: { postId, visitorId } };

  const existing = await db.postLike.findUnique({ where: key });
  if (existing) await db.postLike.delete({ where: key });
  else await db.postLike.createMany({ data: [{ postId, visitorId }], skipDuplicates: true });

  const count = await db.postLike.count({ where: { postId } });
  return { liked: !existing, count };
}
