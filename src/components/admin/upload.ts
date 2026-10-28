export type UploadMode = "blob" | "local";

export async function uploadFile(file: File, mode: UploadMode): Promise<string> {
  if (mode === "blob") {
    const { upload } = await import("@vercel/blob/client");
    const blob = await upload(`uploads/${file.name}`, file, { access: "public", handleUploadUrl: "/api/upload", multipart: file.size > 20 * 1024 * 1024 });
    return blob.url;
  }
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Yükleme başarısız");
  return data.url;
}

export function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}
