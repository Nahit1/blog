import { cache } from "react";
import { db } from "./db";

export type ProfileLink = { label: string; url: string };

async function loadProfile() {
  const existing = await db.profile.findUnique({ where: { id: 1 } });
  // Aynı anda gelen iki istek satırı birlikte oluşturmaya çalışabilir; çakışmayı yok say.
  const profile = existing ?? (await db.profile.createMany({ data: [{ id: 1 }], skipDuplicates: true }), await db.profile.findUniqueOrThrow({ where: { id: 1 } }));
  return { ...profile, links: (Array.isArray(profile.links) ? profile.links : []) as ProfileLink[] };
}

/** İstek başına bir kez okunur. */
export const getProfile = cache(loadProfile);
