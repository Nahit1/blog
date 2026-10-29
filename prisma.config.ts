import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Migration'lar havuzsuz (doğrudan) bağlantıyla çalışmalı: Neon'un havuzlu bağlantısı
 * Prisma'nın advisory lock'unu desteklemez ve migrate zaman aşımına uğrar.
 * Vercel'in Neon entegrasyonu doğrudan adresi farklı adlarla verebilir; hiçbiri yoksa
 * havuzlu adresteki "-pooler" eki silinerek doğrudan adres türetilir.
 */
function migrationUrl() {
  const direct = process.env["DATABASE_URL_UNPOOLED"] ?? process.env["POSTGRES_URL_NON_POOLING"];
  if (direct) return direct;
  return process.env["DATABASE_URL"]?.replace("-pooler.", ".");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl(),
  },
});
