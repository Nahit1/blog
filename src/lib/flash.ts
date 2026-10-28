import "server-only";
import { cookies } from "next/headers";

export const FLASH_COOKIE = "nf_flash";

export type Flash = { id: number; type: "success" | "error"; message: string };

/** Admin işlemlerinden sonra bir sonraki render'da toast olarak gösterilecek mesajı bırakır. */
export async function flash(message: string, type: Flash["type"] = "success") {
  const value: Flash = { id: Date.now(), type, message };
  (await cookies()).set(FLASH_COOKIE, encodeURIComponent(JSON.stringify(value)), { path: "/admin", maxAge: 60, sameSite: "lax" });
}

export async function readFlash(): Promise<Flash | null> {
  const raw = (await cookies()).get(FLASH_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as Flash;
  } catch {
    return null;
  }
}
