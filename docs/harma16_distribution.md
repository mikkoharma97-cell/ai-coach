# HÄRMÄ16 — julkaisun valmistelu

## App info (lähde)

| Kenttä | Arvo |
|--------|------|
| Nimi | `APP_DISPLAY_NAME` → `src/config/appInfo.ts` |
| Kuvaus | `APP_DESCRIPTION` (+ `APP_DESCRIPTION_FI` referenssi) |
| Ikoni | Dynaaminen: `src/app/icon.tsx`, `apple-icon.tsx` · Manifest: `public/icons/app-icon.svg` |
| Screenshot placeholder | `public/store/screenshots/README.md` |

## Meta

- Oletus: `src/app/layout.tsx` (`metadata` + `openGraph` + `twitter`)
- Juuri `/`: `src/app/page.tsx`
- Markkinointi: `/launch`, `/home`, `/demo` — omat `metadata` where needed

## PWA

- `src/app/manifest.ts` — lukee `appInfo.ts`
- Ikonirivit → sama SVG (any + maskable)

## Performance

- Ei uusia raskaita headereitä: OG-kuva generointia ei lisätty (vähentää monimutkaisuutta).
- `PwaInstallPrompt` on client-only, ei estä ensimmäistä maalausta.

## Raportti

1. **Valmis julkaisuun:** osin — tekninen metatieto + manifest + ikonit + screenshot-polku OK.
2. **Puuttuu:** oikeat store-kuvakaappaukset `public/store/screenshots/` -kansioon; tuotantodomain varmistus (`getPublicSiteUrl`); halutessa dynaaminen `opengraph-image` (ei pakollinen).
