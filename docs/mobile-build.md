# Mobiilibuild (Capacitor / iOS)

Web-sovellus on ensisijainen; natiivi on valinnainen wrapper. Tämä dokumentti kertoo miten `ios/`-projekti synkataan ja mitä `capacitor.config.ts` sisältää.

## `capacitor.config.ts` (nykyinen)

| Kenttä | Arvo | Huomio |
|--------|------|--------|
| `appId` | `com.coach.dailyguidance` | Bundle ID (iOS / Android) |
| `appName` | `Coach` | Näkyvä nimi |
| `webDir` | `out` | Staattinen web-buildin kansio — **Next oletuksena ei tuota `out/`** (katso alla) |
| `server.androidScheme` | `https` | |
| `ios.contentInset` | `automatic` | Safe area / notch WebViewissa |

## Esiehdot

1. Asenna Capacitor-työkalut (projektissa `devDependencies`):

   ```bash
   npm install
   ```

   Jos paketit puuttuvat kokonaan:

   ```bash
   npm install --save-dev @capacitor/core @capacitor/cli @capacitor/ios
   ```

2. **Staattinen export:** `webDir: "out"` olettaa että `npm run build` tuottaa kansion `out/`. Nykyinen Next-konfiguraatio ei välttämättä käytä `output: 'export'` — lisää Nextiin staattinen export tai erillinen mobile-build -pipeline ennen kuin `npx cap sync` kopioi oikean sisällön. Muuten synkkaa `out/`-hakemisto manuaalisesti vastaamaan tuotosta.

3. iOS-projekti puuttuu reposta: ensimmäisellä kerralla:

   ```bash
   npx cap add ios
   ```

## Komennot (tyypillinen flow)

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Android (valinnainen):

```bash
npx cap sync android
npx cap open android
```

## Testaus

- Oikea laite: safe area (notch, home indicator), bottom nav, modaalien scroll-lukko (`useOverlayLayer` + `overlayStack`).
- Web: cache-smoke `?ver=67` (tai uudempi `HARMÄ_BUILD`).

## Huomiot

- Modal manager: `src/lib/overlayStack.ts` — yksi aktiivinen overlay kerrallaan, scroll palautuu suljettaessa.
- Älä commitoi `ios/DerivedData` tms. — pidä `ios/` vain jos tiimi haluaa versionhallinnan natiiviprojektiin.
