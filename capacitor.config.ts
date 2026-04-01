/**
 * Capacitor — iOS TestFlight -polku.
 *
 * - appId / appName: App Store Connect + Xcode Bundle ID -synkassa.
 * - webDir: `out/` (scripts/prepare-cap-web.mjs ennen cap sync).
 * - CAPACITOR_SERVER_URL: tuotannon base-URL (Vercel) → WebView lataa täyden Next-appin (API-reitit mukana).
 *   Ilman URL:ia näkyy vain minimaalinen fallback out/index.html.
 *
 * Taulukko: docs/mobile-build.md, docs/mobile-release-checklist.md
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config = {
  appId: "fi.siteos.aicoach",
  appName: "AI Coach",
  webDir: "out",
  server: {
    androidScheme: "https",
    ...(serverUrl ? { url: serverUrl } : {}),
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
