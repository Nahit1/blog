import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

const NAV = [
  { href: "/admin", label: "Genel bakış" },
  { href: "/admin/skills", label: "Yetenekler" },
  { href: "/admin/sections", label: "Bölümler" },
  { href: "/admin/posts", label: "Yazılar" },
  { href: "/admin/profile", label: "Hakkımda" },
  { href: "/admin/subscribers", label: "Aboneler" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
      <aside className="border-b border-line px-5 py-5 md:w-56 md:shrink-0 md:border-b-0 md:border-r md:py-8">
        <Link href="/admin" className="font-serif text-lg font-semibold">Panel</Link>
        <nav className="mt-4 flex gap-1 overflow-x-auto text-sm md:mt-8 md:flex-col">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-md px-3 py-2 text-muted hover:bg-surface hover:text-ink">{n.label}</Link>
          ))}
          <Link href="/" target="_blank" className="whitespace-nowrap rounded-md px-3 py-2 text-muted hover:bg-surface hover:text-ink">Siteyi gör ↗</Link>
        </nav>
        <form action={logout} className="mt-6 hidden text-xs text-muted md:block">
          <p className="truncate px-3">{user.email}</p>
          <button className="mt-2 px-3 underline hover:text-ink">Çıkış yap</button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
