/**
 * Capacitor-native wrapper — aja `npm run build` ennen `npx cap sync`.
 *
 * Taulukko: docs/mobile-build.md
 * - appId: com.coach.dailyguidance
 * - appName: Coach
 * - webDir: out (vaatii staattisen Next-exportin tai vastaavan — ks. mobile-build.md)
 */
const config = {
  appId: "com.coach.dailyguidance",
  appName: "Coach",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  ios: {
    /** Safe area / insetit WebViewissa */
    contentInset: "automatic",
  },
} as const;

export default config;
