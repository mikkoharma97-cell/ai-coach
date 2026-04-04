/**
 * Capacitor vaatii webDir:in (out/). Next ei tuota out/ ilman staattista exportia —
 * tämä kirjoittaa minimaalisen fallbackin ja varmistaa kansion olemassaolon.
 * Täysi app WebViewissa: aseta CAPACITOR_SERVER_URL → tuotannon URL (Vercel) ennen cap sync.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "out");

mkdirSync(outDir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>AI Coach</title>
  <style>
    body { margin:0; min-height:100dvh; background:#05060a; color:#c7cfde; font-family:system-ui,sans-serif; display:flex; align-items:center; justify-content:center; padding:1.5rem; text-align:center; }
    p { max-width:22rem; line-height:1.5; font-size:14px; }
    .muted { opacity:.75; font-size:12px; margin-top:1rem; }
  </style>
</head>
<body>
  <div>
    <p><strong>AI Coach</strong></p>
    <p class="muted">Capacitor-kuori. Aseta CAPACITOR_SERVER_URL tuotannon osoitteeseen (Vercel), jotta WebView lataa tayden Next-sovelluksen — ks. docs/mobile-build.md</p>
  </div>
</body>
</html>
`;

writeFileSync(join(outDir, "index.html"), html, "utf8");
console.log("[cap-web] wrote out/index.html");
