// Kullanım: npm run admin:create -- e-posta@adres.com "güçlü-şifre"
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Kullanım: npm run admin:create -- e-posta@adres.com "şifre"');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Şifre en az 10 karakter olmalı.");
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const passwordHash = await bcrypt.hash(password, 12);
await db.user.upsert({
  where: { email: email.toLowerCase() },
  update: { passwordHash },
  create: { email: email.toLowerCase(), passwordHash, name: "Nahit Ferhat Ektaş" },
});
console.log(`Admin hazır: ${email.toLowerCase()}`);
await db.$disconnect();
