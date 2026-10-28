import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/text";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml", "video/mp4", "video/webm", "video/quicktime"];
const MAX_BYTES = 500 * 1024 * 1024;

export async function POST(request: Request) {
  // Vercel Blob: tarayıcı dosyayı doğrudan Blob'a yükler, bu route sadece yükleme izni üretir.
  if (process.env.BLOB_READ_WRITE_TOKEN && request.headers.get("content-type")?.includes("application/json")) {
    const body = (await request.json()) as HandleUploadBody;
    try {
      const result = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => {
          if (!(await getCurrentUser())) throw new Error("Yetkisiz");
          return { allowedContentTypes: ALLOWED, maximumSizeInBytes: MAX_BYTES, addRandomSuffix: true };
        },
      });
      return Response.json(result);
    } catch (error) {
      return Response.json({ error: (error as Error).message }, { status: 400 });
    }
  }

  // Lokal geliştirme: dosyayı public/uploads klasörüne yazar.
  if (!(await getCurrentUser())) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "Dosya bulunamadı" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return Response.json({ error: "Desteklenmeyen dosya türü" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Dosya çok büyük" }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const name = `${slugify(path.basename(file.name, ext)) || "dosya"}-${randomBytes(4).toString("hex")}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/uploads/${name}` });
}
