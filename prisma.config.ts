import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migration'lar havuzsuz (doğrudan) bağlantıyla çalışmalı. Vercel'in Neon entegrasyonu
    // bunu DATABASE_URL_UNPOOLED olarak verir; lokalde tek adres (DATABASE_URL) yeterli.
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
