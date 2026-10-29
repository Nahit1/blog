import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";

const VISITOR_COOKIE = "nf_vid";

/** Beğenileri ziyaretçiye bağlayan anonim kimlik; yoksa oluşturulur. */
export async function getVisitorId(create: true): Promise<string>;
export async function getVisitorId(create?: false): Promise<string | null>;
export async function getVisitorId(create = false) {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing || !create) return existing ?? null;
  const id = randomUUID();
  store.set(VISITOR_COOKIE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return id;
}

/** IP adresinin tuzlu özeti: hız sınırı için yeterli, IP'nin kendisi saklanmaz. */
export async function getIpHash() {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return createHash("sha256").update(`${ip}:${process.env.AUTH_SECRET ?? ""}`).digest("hex").slice(0, 32);
}
