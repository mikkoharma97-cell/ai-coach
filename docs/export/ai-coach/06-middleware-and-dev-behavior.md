# Middleware (`src/middleware.ts`)

**Tarkoitus (kommentti lähdekoodissa):** devissä estää Safari / WKWebView -välimuistin harhaa dokumentille (vanha HTML / stale shell). Ei vaikuta production-buildiin (`NODE_ENV === "production"`).

**Käyttäytyminen:**

- Jos `NODE_ENV !== "development"` → `NextResponse.next()` ilman cache-headereita.
- Devissä: `Cache-Control: no-store, ...`, `Pragma: no-cache`, `Expires: 0`.

**Matcher:** kaikki polut paitsi `_next/static`, `_next/image`, `favicon.ico`, ja tiedostopäätteelliset resurssit.

```1:26:src/middleware.ts
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
```
