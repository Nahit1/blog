export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Türkçe sayfalar kök dizinde, İngilizce sayfalar /en altında yaşar. */
export function localePath(locale: Locale, path = "/") {
  const clean = path === "/" ? "" : path;
  return locale === "tr" ? clean || "/" : `/en${clean}`;
}

const dictionaries = {
  tr: {
    home: "Ana sayfa",
    blog: "Yazılar",
    about: "Hakkımda",
    latestPosts: "Son yazılar",
    allPosts: "Tüm yazılar",
    noPosts: "Henüz yazı yok.",
    readMore: "Devamını oku",
    minRead: "dk okuma",
    readThisIn: "Bu yazıyı İngilizce oku",
    subscribeTitle: "Yeni yazılardan haberdar ol",
    subscribeText: "Yeni bir yazı yayınladığımda e-posta ile haber vereyim. Spam yok, istediğin zaman ayrılabilirsin.",
    emailPlaceholder: "E-posta adresin",
    subscribe: "Abone ol",
    languagesLabel: "Hangi dildeki yazılar?",
    turkish: "Türkçe",
    english: "İngilizce",
    subscribeSent: "Neredeyse tamam! Onay için e-posta kutunu kontrol et.",
    subscribeInvalid: "Geçerli bir e-posta adresi gir ve en az bir dil seç.",
    confirmedTitle: "Aboneliğin onaylandı",
    confirmedText: "Teşekkürler! Yeni yazılar yayınlandığında sana e-posta göndereceğim.",
    invalidLink: "Bu link geçersiz ya da süresi dolmuş.",
    unsubscribeTitle: "Abonelikten çık",
    unsubscribeText: "Artık yeni yazı bildirimleri almak istemiyor musun?",
    unsubscribeButton: "Aboneliği iptal et",
    unsubscribedText: "Abonelikten çıktın. Bir daha e-posta almayacaksın.",
    backHome: "Ana sayfaya dön",
    notFound: "Aradığın sayfa bulunamadı.",
    tags: "Etiketler",
    contact: "İletişim",
  },
  en: {
    home: "Home",
    blog: "Articles",
    about: "About",
    latestPosts: "Latest articles",
    allPosts: "All articles",
    noPosts: "No articles yet.",
    readMore: "Read more",
    minRead: "min read",
    readThisIn: "Read this in Turkish",
    subscribeTitle: "Get notified about new articles",
    subscribeText: "I'll send you an email when I publish something new. No spam, unsubscribe any time.",
    emailPlaceholder: "Your email address",
    subscribe: "Subscribe",
    languagesLabel: "Articles in which language?",
    turkish: "Turkish",
    english: "English",
    subscribeSent: "Almost done! Check your inbox to confirm.",
    subscribeInvalid: "Enter a valid email address and pick at least one language.",
    confirmedTitle: "Subscription confirmed",
    confirmedText: "Thanks! I'll email you whenever a new article is published.",
    invalidLink: "This link is invalid or has expired.",
    unsubscribeTitle: "Unsubscribe",
    unsubscribeText: "Don't want new article notifications anymore?",
    unsubscribeButton: "Unsubscribe",
    unsubscribedText: "You've been unsubscribed. You won't receive any more emails.",
    backHome: "Back to home",
    notFound: "The page you're looking for doesn't exist.",
    tags: "Tags",
    contact: "Contact",
  },
} satisfies Record<Locale, Record<string, string>>;

export type Dictionary = (typeof dictionaries)["tr"];

export function t(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
