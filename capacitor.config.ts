/**
 * Capacitor — iOS wrapper (TestFlight / dev).
 *
 * Totuus:
 * - `server.url` (env `CAPACITOR_SERVER_URL`) **kun asetettu synkissä** → WebView lataa Nextin tuosta
 *   (tuotanto: https Vercel; dev-LAN: http://<LAN-IP>:<PORT>, vaatii iOS ATS: NSAllowsLocalNetworking).
 * - Ilman URL:ia → vain `out/index.html` (prepare-cap-web.mjs), ei täyttä appia.
 *
 * webDir: `out/` kirjoitetaan `npm run cap:prepare` ennen `cap sync`.
 *
 * docs/mobile-build.md
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
