/**
 * Capacitor-native wrapper — ei vielä sync / iOS–Android -projekteja.
 * Web: tuota staattinen export `out/` (tai adapter) ennen `npx cap sync`.
 * Ikoni: `public/icons/app-icon.svg` → kopioi `resources/` kun luot alustaprojektin.
 */
const config = {
  appId: "com.coach.dailyguidance",
  appName: "Coach",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
} as const;

export default config;
