import type { UploadMode } from "@/components/admin/upload";

export const uploadMode = (): UploadMode => (process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local");
