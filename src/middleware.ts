import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const userId = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!userId) return NextResponse.redirect(new URL("/admin/login", req.url));
    return NextResponse.next();
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();

  // /tr/... adresleri kanonik Türkçe adrese (/...) yönlendirilir.
  if (pathname === "/tr" || pathname.startsWith("/tr/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  // Türkçe varsayılan dil: önek olmayan adresler dahili olarak /tr altına yönlendirilir.
  const url = req.nextUrl.clone();
  url.pathname = `/tr${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|uploads|favicon.ico|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)"],
};
