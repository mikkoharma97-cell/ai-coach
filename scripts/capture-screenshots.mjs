/**
 * Captures review screenshots (requires dev or prod server on BASE_URL).
 * Usage (production server recommended for stable RSC + client bundle):
 *   npm run build && npx next start -p 3002
 *   BASE_URL=http://127.0.0.1:3002 node scripts/capture-screenshots.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "screenshots");

const BASE = process.env.BASE_URL || "http://127.0.0.1:3002";

const profile = {
  goal: "improve_fitness",
  level: "beginner",
  daysPerWeek: 3,
  eatingHabits: "okay",
  biggestChallenge: "motivation",
  eventDisruption: "snap_back",
  socialEatingFrequency: "sometimes",
  mealStructure: "three_meals",
  flexibility: "balanced",
  foodDislikes: [],
  foodPreferences: [],
  selectedPackageId: "steady_start",
  uiLocale: "fi",
};

async function waitForServer(url, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server not reachable: ${url}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await waitForServer(BASE);

  const browser = await chromium.launch();

  // 1 — Start / pakettivalinta
  const ctx1 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    locale: "fi-FI",
  });
  const p1 = await ctx1.newPage();
  await p1.goto(`${BASE}/start`, { waitUntil: "networkidle", timeout: 120000 });
  await p1.getByRole("button", { name: "Jatka" }).click();
  await p1.waitForTimeout(800);
  await p1.screenshot({ path: join(OUT, "01-start-package.png"), fullPage: true });
  await ctx1.close();

  // 2–5 — Coach (profile + subscription)
  const ctx2 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    locale: "fi-FI",
  });

  const subState = { subscribed: true, trialStartedAt: null };

  await ctx2.addInitScript(
    ([prof, sub]) => {
      localStorage.setItem("ai-coach-profile-v3", JSON.stringify(prof));
      localStorage.setItem("ai-coach-subscription-v1", JSON.stringify(sub));
      localStorage.setItem("coach-locale", "fi");
    },
    [profile, subState],
  );

  /** Wait until route-specific UI is present (stable selectors). */
  const coachRoutes = [
    ["02-today.png", "/app", ".coach-panel-today-hero"],
    ["03-food.png", "/food", "text=Rytmi ohjaa"],
    ["04-plan.png", "/plan", "text=Viikon ohjauskartta"],
    ["05-adjustments.png", "/adjustments", "text=Säädöt"],
  ];

  for (const [file, route, sel] of coachRoutes) {
    const page = await ctx2.newPage();
    await page.goto(`${BASE}${route}`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await page.locator(sel).first().waitFor({ state: "visible", timeout: 120000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUT, file), fullPage: true });
    await page.close();
  }

  // 6 — Yleisfiilis: landing (wide) + app shell
  const ctx3 = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    locale: "fi-FI",
  });
  const p3 = await ctx3.newPage();
  await p3.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 120000 });
  await p3.screenshot({
    path: join(OUT, "06-atmosphere-landing.png"),
    fullPage: false,
  });
  await ctx3.close();

  const p6 = await ctx2.newPage();
  await p6.goto(`${BASE}/plan`, { waitUntil: "networkidle", timeout: 120000 });
  await p6.getByText("Viikon ohjauskartta", { exact: true }).first().waitFor({
    state: "visible",
    timeout: 120000,
  });
  await p6.waitForTimeout(500);
  await p6.screenshot({
    path: join(OUT, "06-atmosphere-plan-week.png"),
    fullPage: true,
  });
  await p6.close();

  await ctx2.close();
  await browser.close();

  console.log("Screenshots written to", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
