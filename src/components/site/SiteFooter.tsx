import type { ProfileLink } from "@/lib/profile";

export function SiteFooter({ name, links }: { name: string; links: ProfileLink[] }) {
  return (
    <footer className="mx-auto mt-24 flex max-w-3xl flex-col gap-3 border-t border-line px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>© {new Date().getFullYear()} {name}</p>
      {links.length > 0 && (
        <ul className="flex flex-wrap gap-4">
          {links.map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink">{l.label}</a>
            </li>
          ))}
        </ul>
      )}
    </footer>
  );
}
