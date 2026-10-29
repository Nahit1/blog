import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/profile";
import { siteUrl } from "@/lib/site";

/** Kapak görseli olmayan yazılar için 1200×630 paylaşım görseli (LinkedIn, X, WhatsApp…). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, profile] = await Promise.all([
    db.post.findFirst({ where: { id, status: "PUBLISHED" }, select: { title: true, excerpt: true, locale: true } }),
    getProfile(),
  ]);
  if (!post) return new Response("Not found", { status: 404 });

  const domain = new URL(siteUrl).host;
  const initials = profile.name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("");
  const titleSize = post.title.length > 80 ? 52 : post.title.length > 45 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0b1426",
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(56,189,248,0.28), transparent 45%), radial-gradient(circle at 10% 90%, rgba(129,140,248,0.25), transparent 45%)",
          color: "#e6ebf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(120deg, #0369a1, #4f46e5)",
              color: "white",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#94a3bf" }}>{profile.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1 }}>{post.title}</div>
          {post.excerpt && (
            <div style={{ display: "flex", fontSize: 28, color: "#94a3bf", lineHeight: 1.4 }}>
              {post.excerpt.length > 140 ? `${post.excerpt.slice(0, 137)}…` : post.excerpt}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24, color: "#94a3bf" }}>
          <div style={{ display: "flex", color: "#38bdf8" }}>{domain}</div>
          <div style={{ display: "flex", height: 6, width: 160, borderRadius: 3, background: "linear-gradient(90deg, #38bdf8, #818cf8)" }} />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
