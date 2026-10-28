"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { newPostMail, sendMails } from "@/lib/mail";
import { sanitizeContent } from "@/lib/sanitize";
import { readingMinutes, slugify } from "@/lib/text";

export type FormState = { error?: string; ok?: string };

// ---------- Giriş ----------

// Basit kaba kuvvet koruması: IP başına 15 dakikada 10 deneme.
const attempts = new Map<string, { count: number; resetAt: number }>();

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.resetAt > now && entry.count >= 10) return { error: "Çok fazla deneme. Biraz sonra tekrar dene." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !valid) {
    attempts.set(ip, entry && entry.resetAt > now ? { ...entry, count: entry.count + 1 } : { count: 1, resetAt: now + 15 * 60_000 });
    return { error: "E-posta ya da şifre hatalı." };
  }
  attempts.delete(ip);
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

// ---------- Yazılar ----------

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Başlık gerekli").max(200),
  slug: z.string().trim().max(80),
  locale: z.enum(["tr", "en"]),
  excerpt: z.string().trim().max(400),
  coverImage: z.string().trim().max(1000),
  tags: z.string(),
  contentJson: z.string(),
  contentHtml: z.string(),
  translationOf: z.string(),
  intent: z.enum(["draft", "publish", "unpublish"]),
});

export async function savePost(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Form geçersiz" };
  const input = parsed.data;

  const slug = slugify(input.slug || input.title);
  if (!slug) return { error: "Geçerli bir adres (slug) gir." };
  const clash = await db.post.findFirst({ where: { locale: input.locale, slug, NOT: input.id ? { id: input.id } : undefined } });
  if (clash) return { error: `Bu dilde "${slug}" adresli başka bir yazı var.` };

  let contentJson: Prisma.InputJsonValue;
  try {
    contentJson = JSON.parse(input.contentJson || '{"type":"doc","content":[]}');
  } catch {
    return { error: "İçerik okunamadı." };
  }
  const contentHtml = sanitizeContent(input.contentHtml);
  const existing = input.id ? await db.post.findUnique({ where: { id: input.id } }) : null;
  if (input.id && !existing) return { error: "Yazı bulunamadı." };

  const status = input.intent === "publish" ? "PUBLISHED" : input.intent === "unpublish" ? "DRAFT" : (existing?.status ?? "DRAFT");

  // Çeviri bağlantısı: iki yazı aynı translationKey değerini paylaşır.
  let translationKey: string | null = null;
  if (input.translationOf) {
    const other = await db.post.findUnique({ where: { id: input.translationOf } });
    if (other && other.locale !== input.locale) {
      translationKey = other.translationKey ?? other.id;
      if (!other.translationKey) await db.post.update({ where: { id: other.id }, data: { translationKey } });
    }
  }

  const data = {
    title: input.title,
    slug,
    locale: input.locale,
    excerpt: input.excerpt || null,
    coverImage: input.coverImage || null,
    tags: input.tags.split(",").map((t) => t.trim()).filter(Boolean),
    contentJson,
    contentHtml,
    readingMinutes: readingMinutes(contentHtml),
    status,
    publishedAt: status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null,
    translationKey,
  } satisfies Prisma.PostUncheckedCreateInput;

  const post = existing ? await db.post.update({ where: { id: existing.id }, data }) : await db.post.create({ data });

  revalidatePath("/", "layout");
  if (!existing) redirect(`/admin/posts/${post.id}?saved=1`);
  return { ok: status === "PUBLISHED" ? "Kaydedildi ve yayında." : "Taslak kaydedildi." };
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  await db.post.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/", "layout");
  redirect("/admin/posts");
}

export async function notifySubscribers(postId: string): Promise<FormState> {
  await requireAdmin();
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post || post.status !== "PUBLISHED") return { error: "Önce yazıyı yayınlaman gerekiyor." };
  if (post.notifiedAt) return { error: "Bu yazı için abonelere zaten bildirim gönderildi." };

  const subscribers = await db.subscriber.findMany({ where: { confirmed: true, locales: { has: post.locale } } });
  if (subscribers.length === 0) return { error: "Bu dilde onaylı abone yok." };

  // Önce işaretle: aynı anda iki kez tıklanırsa ikinci gönderim engellenir.
  const { count } = await db.post.updateMany({ where: { id: post.id, notifiedAt: null }, data: { notifiedAt: new Date() } });
  if (count === 0) return { error: "Bu yazı için abonelere zaten bildirim gönderildi." };
  try {
    await sendMails(subscribers.map((s) => newPostMail(s.email, s.token, post)));
  } catch (e) {
    await db.post.update({ where: { id: post.id }, data: { notifiedAt: null } });
    return { error: (e as Error).message };
  }
  revalidatePath("/admin", "layout");
  return { ok: `${subscribers.length} aboneye e-posta gönderildi.` };
}

// ---------- Profil ----------

const linksSchema = z.array(z.object({ label: z.string().trim().min(1), url: z.url() }));

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const links = linksSchema.safeParse(
    get("links")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, ...rest] = line.split("|");
        return { label: label.trim(), url: rest.join("|").trim() };
      }),
  );
  if (!links.success) return { error: "Linkler satır başına \"Ad | https://adres\" biçiminde olmalı." };

  const parseJson = (k: string) => {
    try {
      return JSON.parse(get(k) || "null") ?? undefined;
    } catch {
      return undefined;
    }
  };

  const data = {
    name: get("name") || "Nahit Ferhat Ektaş",
    email: get("email") || null,
    location: get("location") || null,
    avatarUrl: get("avatarUrl") || null,
    headlineTr: get("headlineTr"),
    headlineEn: get("headlineEn"),
    introTr: get("introTr"),
    introEn: get("introEn"),
    bioTrJson: parseJson("bioTrJson"),
    bioTrHtml: sanitizeContent(get("bioTrHtml")),
    bioEnJson: parseJson("bioEnJson"),
    bioEnHtml: sanitizeContent(get("bioEnHtml")),
    links: links.data,
  };
  await db.profile.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidatePath("/", "layout");
  return { ok: "Profil kaydedildi." };
}

// ---------- Aboneler ----------

export async function deleteSubscriber(formData: FormData) {
  await requireAdmin();
  await db.subscriber.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/subscribers");
}
