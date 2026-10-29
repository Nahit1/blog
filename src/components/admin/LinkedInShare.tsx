"use client";

export function linkedInShareUrl(postUrl: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
}

function isPublicUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return !(host === "localhost" || host === "127.0.0.1" || host.endsWith(".local") || host.endsWith(".test"));
  } catch {
    return false;
  }
}

function openShare(postUrl: string) {
  window.open(linkedInShareUrl(postUrl), "linkedin-share", "width=600,height=700,noopener");
}

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

/** Yazı listesindeki küçük paylaş butonu. */
export function LinkedInShareButton({ postUrl, compact }: { postUrl: string; compact?: boolean }) {
  const live = isPublicUrl(postUrl);
  return (
    <button
      type="button"
      onClick={() => openShare(postUrl)}
      title={live ? "LinkedIn'de paylaş" : "LinkedIn localhost adresini göremez; site canlıya çıkınca çalışır."}
      className={`inline-flex items-center gap-1.5 rounded-md font-medium text-[#70b5f9] transition hover:text-white ${compact ? "text-xs" : "rounded-lg bg-[#0a66c2] px-4 py-2 text-sm text-white hover:bg-[#004182]"}`}
    >
      <LinkedInIcon />
      {compact ? "Paylaş" : "LinkedIn'de paylaş"}
    </button>
  );
}

/** Editörde: LinkedIn'de nasıl görüneceğinin önizlemesi + paylaş butonu. */
export function LinkedInSharePanel({ postUrl, imageUrl, title }: { postUrl: string; imageUrl: string; title: string }) {
  const live = isPublicUrl(postUrl);
  const host = (() => {
    try {
      return new URL(postUrl).host;
    } catch {
      return postUrl;
    }
  })();

  return (
    <div className="space-y-3 text-sm">
      <span className="text-muted">LinkedIn paylaşım önizlemesi</span>
      <div className="overflow-hidden rounded-lg border border-line bg-paper">
        {/* eslint-disable-next-line @next/next/no-img-element -- paylaşımda kullanılacak görselin kendisi */}
        <img src={imageUrl} alt="" className="aspect-[1200/630] w-full object-cover" />
        <div className="px-3 py-2">
          <p className="line-clamp-2 font-semibold leading-snug">{title}</p>
          <p className="mt-0.5 text-xs text-muted">{host}</p>
        </div>
      </div>
      <LinkedInShareButton postUrl={postUrl} />
      {!live && (
        <p className="text-xs text-amber-300">
          LinkedIn başlık ve görseli yazının adresinden okur; <b>localhost</b> adresine ulaşamaz. Bu buton site canlıya çıkınca (SITE_URL=https://nahitferhat.com) çalışır.
        </p>
      )}
    </div>
  );
}
