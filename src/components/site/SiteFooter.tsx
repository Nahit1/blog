import type { ProfileLink } from "@/lib/profile";
import { SocialLinks } from "./SocialIcon";

export function SiteFooter({ name, links }: { name: string; links: ProfileLink[] }) {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} {name}</p>
        <SocialLinks links={links} />
      </div>
    </footer>
  );
}
