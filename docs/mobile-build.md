# Mobiilibuild (Capacitor / iOS)

Web-sovellus on ensisijainen; natiivi on valinnainen wrapper. **TestFlight-polku askel askeleelta:** [mobile-release-checklist.md](./mobile-release-checklist.md).

## `capacitor.config.ts` (nykyinen)

| Kenttä | Arvo | Huomio |
|--------|------|--------|
| `appId` | `fi.siteos.aicoach` | Bundle ID — sama Xcode + App Store Connect |
| `appName` | `AI Coach` | Näkyvä nimi |
| `webDir` | `out` | Synkataan `npm run cap:prepare` → `out/index.html` (fallback) |
| `server.url` | env `CAPACITOR_SERVER_URL` | **Suositeltu tuotannossa:** Vercel-base-URL, jotta WebView lataa koko Next-appin (myös API-reitit). Ilman URL:ia näkyy vain placeholder. |
| `server.androidScheme` | `https` | |
| `ios.contentInset` | `automatic` | Safe area / notch WebViewissa |

## Esiehdot

1. `npm install` (Capacitor: `@capacitor/cli`, `@capacitor/core`, `@capacitor/ios`).

2. **`out/`-kansio:** Next ei tuota `out/` ilman `output: 'export'`; repossa on `scripts/prepare-cap-web.mjs`, jonka `npm run cap:prepare` kirjoittaa ennen `cap sync`. **Tuotannon URL:**

   ```bash
   export CAPACITOR_SERVER_URL="https://sinun-app.vercel.app"
   ```

3. iOS-projekti puuttuu: `npx cap add ios` (kerran).

## Komennot

```bash
npm run build
npm run cap:prepare
npx cap sync ios
npx cap open ios
```

Tai yhdistettynä: `npm run cap:sync` (build + prepare + sync).

## Testaus

- Laite: safe area, bottom nav, overlay-stack.
- Web: `?ver=xx` vastaa `HARMÄ_BUILD`-fingerprintiä.

## Huomiot

- Modal manager: `src/lib/overlayStack.ts`.
- `out/` on `.gitignore`issa — luodaan paikallisesti ennen synkkaa.
