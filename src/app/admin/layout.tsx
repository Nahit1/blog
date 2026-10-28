import type { Metadata } from "next";
import "../globals.css";
import { inter, serif } from "@/lib/fonts";

export const metadata: Metadata = { title: "Yönetim Paneli", robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${serif.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
