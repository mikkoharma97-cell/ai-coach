# Mobiilibuild (Capacitor / iOS)

Web-sovellus on ensisijainen; natiivi on valinnainen wrapper.

## Esiehdot

- `npm run build` tuottaa staattisen ulostulon (`out/` kun käytössä `output: 'export'` tai vastaava Next-konfiguraatio).
- `capacitor.config.ts`: `webDir: "out"`.

## Komennot

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Ensimmäisellä kerralla ilman `ios/`-kansiota:

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

Android:

```bash
npx cap sync android
npx cap open android
```

## Huomiot

- Testaa oikealla laitteella: safe area (notch, home indicator), bottom nav, modaalien scroll-lukko.
- `?ver=62` (tai uudempi) cache-smokeen Vercelissä.
