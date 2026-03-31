/**
 * HÄRMÄ17 — smoke: HTTP + Playwright (mobile), console/page errors.
 *
 * Vaatii saman buildin kuin käynnissä oleva `next start` (muuten chunkit → 500 konsolissa).
 * Usage:
 *   npm run build && npx next start -p 3020
 *   BASE_URL=http://127.0.0.1:3020 npm run qa:routes
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3020";
const ROUTES = ["/start", "/app", "/workout", "/food", "/progress", "/paywall"];

async function httpCheck(path) {
  const url = `${BASE}${path}`;
  try {
    const r = await fetch(url, { redirect: "follow" });
    return { path, ok: r.ok, status: r.status, finalUrl: r.url };
  } catch (e) {
    return { path, ok: false, error: String(e) };
  }
}

async function browserCheckAll() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const results = [];
  for (const path of ROUTES) {
    const page = await context.newPage();
    const issues = [];

    page.on("pageerror", (err) => {
      issues.push({ type: "pageerror", text: err.message });
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        issues.push({ type: "console", text: msg.text() });
      }
    });

    let status = null;
    try {
      const resp = await page.goto(`${BASE}${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      status = resp?.status() ?? null;
      await page.waitForTimeout(800);
    } catch (e) {
      issues.push({ type: "navigation", text: String(e) });
    }

    await page.close();
    results.push({ path, httpStatus: status, issues });
  }

  await browser.close();
  return results;
}

async function main() {
  console.log("BASE:", BASE);
  const http = await Promise.all(ROUTES.map(httpCheck));
  console.log("\n--- HTTP ---\n" + JSON.stringify(http, null, 2));

  const browser = await browserCheckAll();
  console.log("\n--- BROWSER (mobile) ---\n" + JSON.stringify(browser, null, 2));

  const badHttp = http.filter((h) => !h.ok);
  const badBrowser = browser.filter(
    (b) => b.issues.length > 0 || (b.httpStatus && b.httpStatus >= 400),
  );
  process.exitCode = badHttp.length || badBrowser.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
