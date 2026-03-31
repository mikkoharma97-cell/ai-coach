/**
 * Julkaisu / store-listing / oletus-SEO (HÄRMÄ16).
 * Sivukohtainen copy (esim. /launch FI) voi yliajaa nämä.
 */
export const APP_DISPLAY_NAME = "Coach";

export const APP_SHORT_NAME = "Coach";

/** Oletuskuvaus — EN (manifest, root layout, kansainvälinen SEO). */
export const APP_DESCRIPTION =
  "Today tells you what to do: workout, food, activity — in order. No feed, no guesswork.";

/** Lyhyt rivi — FI referenssi store-teksteille / sisäiseen käyttöön. */
export const APP_DESCRIPTION_FI =
  "Tänään näet mitä tehdä: treeni, ruoka, rytmi — järjestyksessä. Ei arvailua.";

/** PWA manifest */
export const APP_START_URL = "/app" as const;

/** Staattinen ikoni manifestiin; favicon / apple: `src/app/icon.tsx`, `apple-icon.tsx` */
export const APP_ICON_MANIFEST_PATH = "/icons/app-icon.svg" as const;

/** Store-kuvakaappausten paikka (tyhjä → täytä julkaisua varten). */
export const APP_SCREENSHOTS_PUBLIC_DIR = "/store/screenshots" as const;
