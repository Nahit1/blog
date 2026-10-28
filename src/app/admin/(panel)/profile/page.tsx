import type { JSONContent } from "@tiptap/react";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { getProfile } from "@/lib/profile";
import { uploadMode } from "@/lib/upload-mode";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const p = await getProfile();
  return (
    <ProfileForm
      uploadMode={uploadMode()}
      initial={{
        name: p.name,
        email: p.email ?? "",
        location: p.location ?? "",
        avatarUrl: p.avatarUrl ?? "",
        resumeUrl: p.resumeUrl ?? "",
        statusTr: p.statusTr,
        statusEn: p.statusEn,
        headlineTr: p.headlineTr,
        headlineEn: p.headlineEn,
        introTr: p.introTr,
        introEn: p.introEn,
        bioTrJson: (p.bioTrJson as JSONContent | null) ?? null,
        bioTrHtml: p.bioTrHtml,
        bioEnJson: (p.bioEnJson as JSONContent | null) ?? null,
        bioEnHtml: p.bioEnHtml,
        links: p.links.map((l) => `${l.label} | ${l.url}`).join("\n"),
      }}
    />
  );
}
