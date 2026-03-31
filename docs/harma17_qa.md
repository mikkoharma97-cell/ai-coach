# HÄRMÄ17 — final QA

## Automaatio (2026-03-31)

- `npm run build` — OK
- `BASE_URL=http://127.0.0.1:<port> npm run qa:routes` — HTTP 200 kaikille: `/start`, `/app`, `/workout`, `/food`, `/progress`, `/paywall`
- Playwright (viewport 390×844, mobile): ei `pageerror`, ei `console` tyyppiä `error` ensilatauksella samoilla poluilla
- **Huom:** `next start` pitää käynnistää **samasta buildista** kuin viimeisin `npm run build`. Uusi build vanhan serverin päällä → chunk-500 konsolissa (ei välttämättä näy pelkässä HTML:ssä).

## Mikä rikki (tiedossa)

- **ESLint:** repo sisältää ennestään virheitä/varoituksia (`npm run lint` ≠ clean) — ei estänyt buildia tässä passissa.
- **Turbopack:** NFT-varoitus `next.config` ↔ `store.ts` -ketjusta (buildin varoitus).
- **Manuaalinen laite-QA:** ei korvattu automaatiolla (pitkät scrollit, modaalit, tilausketju, oikea safepoint).

## Mikä toimii

- Reitit renderöityvät; päänavin (`AppShell`) linkit ovat oikeita polkuja; workout korostaa Today-tabia.
- Overlay-pinot: esim. `FoodScreen` sheet `z-[200]`, PWA-kehotus `z-[100]`, päättyvä nav `z-[50]` — ei ristiriitaa tässä inventoinnissa.
- Alapalkki: `min-h-[54px]`, `touch-manipulation`, `safe-area-inset-bottom` — yhden käden perusolettama OK.

## Valmis julkaisuun?

**Smoke-tasolla kyllä** — voidaan antaa toiselle testattavaksi odotuksella: klikkaa läpi omat polut + paywall + onboarding.

**Ei täyttä “ei mitään voi mennä pieleen”** — ilman laitetestejä ja siivottua linttiä.
