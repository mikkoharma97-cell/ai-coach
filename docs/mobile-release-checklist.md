# Mobiili release / TestFlight — askellista

Käytä joka kerta kun viet iOS-buildin tai päivität TestFlightia.

## Esiehdot

- [ ] `npm run build` ja Vercel-deploy toimivat (web on tuotannossa jos käytät `CAPACITOR_SERVER_URL`).
- [ ] `APP_VERSION` / `HARMÄ_BUILD` päivitetty `src/config/version.ts`.
- [ ] Build-aika päivittyy automaattisesti: `npm run build` ajaa `scripts/write-build-info.mjs`.

## 1. Versio

Muokkaa `src/config/version.ts`:

- `APP_VERSION` (esim. `HÄRMÄ71`)
- `HARMÄ_BUILD` (juokseva numero — Xcode **Build** -numero samaan tai vastaavaan)

## 2. Web-assetit Capacitorille

Projekti käyttää `webDir: out`. Next ei tuota `out/` ilman erillistä staattista exportia; repo sisältää `scripts/prepare-cap-web.mjs`, joka luo `out/index.html` -fallbackin.

**Täysi tuote WebViewissa:** aseta tuotannon URL (Vercel) ennen synkkaa:

```bash
export CAPACITOR_SERVER_URL="https://sinun-domain.vercel.app"
npm run cap:sync:prod
```

Ilman tätä näkyy vain minimaalinen placeholder-sivu.

## 3. Komennot (projektijuuri)

```bash
cd /Users/mikkoharma/ai-coach

npm install

# Jos ios/ puuttuu (kerran):
npx cap add ios

npm run testflight:prep
```

Lyhyt polku:

```bash
npm run testflight:prep
```

## 4. Xcode

1. **Signing & Capabilities** — valitse Team; Bundle ID = `fi.siteos.aicoach` (täsmää `capacitor.config.ts` + App Store Connect).
2. **General** — Version (esim. 1.0.0), Build (esim. 71).
3. **Display Name** — esim. AI Coach.
4. **App Icon** — täytä AppIcon; ei jätetä tyhjää placeholderia tuotantoon.
5. Liitä laite → **Run** → testaa modaalit, safe area, build-merkki, Today / Food / Workout / Progress.

## 5. Archive → TestFlight

1. **Product → Archive**
2. Organizer → **Distribute App** → App Store Connect → **Upload**
3. App Store Connect → TestFlight — odota käsittelyä
4. Lisää testaajat → asenna TestFlightista

## 6. Smoke (TestFlight-build)

- [ ] Sovellus avautuu (ei pelkkä selain)
- [ ] `HÄRMÄxx` ja build-numero näkyvät (preview-merkki / build-info)
- [ ] Tärkeimmät polut: Today, Ruoka, Treeni, Kehitys

## 7. Git

```bash
git add .
git commit -m "HÄRMÄxx: TestFlight / mobile"
git push origin main
```
