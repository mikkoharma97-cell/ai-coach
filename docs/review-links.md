# Ulkoinen arviointi — linkit (HÄRMÄ34)

Kopioi base-URL tuotannosta tai stagingista (`NEXT_PUBLIC_SITE_URL` / Vercel-domain). Paikallinen dev: `http://localhost:3000`.

## Versio-cache

Lisää sama numero kuin `src/config/version.ts` → `HARMÄ_BUILD`:

`?ver=34` (päivitä kun build vaihtuu)

Esimerkki: `https://example.com/app?ver=34`

## Julkiset / sovelluspolku (tarkistuslista)

| Polku | Kuvaus |
|--------|--------|
| `/home` | Markkinointi / etusivu |
| `/start` | Aloitus / onboarding |
| `/app` | Tänään (vaatii profiilin) |
| `/food` | Ruoka |
| `/workout` | Treeni |
| `/progress` | Kehitys |
| `/review` | Viikkopalaute |
| `/adjustments` | Säädöt |
| `/paywall` | Hinnoittelu |
| `/demo` | Demo (jos käytössä) |

## Jatkuvaan arviointiin jaettavat (vähintään)

- Tuotannon (tai previewin) **home**: `{BASE}/home?ver=XX`
- **start**: `{BASE}/start?ver=XX`
- **app**: `{BASE}/app?ver=XX`
- **food**: `{BASE}/food?ver=XX`
- **workout**: `{BASE}/workout?ver=XX`
- **progress**: `{BASE}/progress?ver=XX`

## Build-info näkyvyys

Jokaisella sivulla: root `layout` renderöi `GlobalBuildMarker` (oikea ala) — `BUILD HÄRMÄ…` + päiväys/aika (`version.ts` / `BUILD_TIME`). Ei vaadi screenshotteja version varmistamiseen.

## Coach review -paneeli (vapaaehtoinen)

Sisäiset polut: lisää `?review=1` (esim. `/app?review=1&ver=34`) tai aseta `NEXT_PUBLIC_REVIEW_PANEL=1` — näyttää hillityn debug-rivin (tila, ohjelma, ruokarakenne, moottorin tiivis tiivistelmä). Vain kehitys / staging suositeltu.

Katso: `docs/test-profiles.md` testiprofiileille.
