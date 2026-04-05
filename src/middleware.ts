import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Dev: estä Safari / WKWebView -cache harha dokumentille (vanha HTML / stale shell).
 * Ei koske production-buildia (NODE_ENV === "production" buildissa).
 */
export function middleware(_request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.next();
  }
  const res = NextResponse.next();
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
