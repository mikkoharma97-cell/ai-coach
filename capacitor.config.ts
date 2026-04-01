/**
 * Capacitor-native wrapper — aja `npm run build` ennen `npx cap sync`.
 * Web: staattinen export `out/` (ks. Next-config / mobile-build.md).
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
