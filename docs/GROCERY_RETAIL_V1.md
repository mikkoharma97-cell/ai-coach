# Vähittäishinta-kerros (V1)

## Tarkoitus

- Näyttää **esimerkkihintoja** ja **tarjousmerkintöjä** käyttäjän viikon ruokasuunnitelmaan sidottuna.
- Ei reaaliaikaista API:a, ei massaskreippausta, ei virallista hintavertailua.

## Kolme “kauppaa”

| ID | Nimi UI:ssa | Käytännön merkitys V1:ssä |
|----|-------------|---------------------------|
| `s_kaupat` | S-kaupat | Edullisin **hintakerros** (esim. S-market / Sale -tyyppi) |
| `prisma` | Prisma | Keskihinta — Prisma on Keskon hypermarket; käytetään **erillisenä hintakerroksena** |
| `k_ruoka` | K-Ruoka | Kalliimpi kerros (verkko / laaja valikoima) |

**Huom:** Prisma ja K-Ruoka kuuluvat molemmat Keskolle; tässä ne ovat **kolme erillistä esimerkkihintatasoa**, ei kilpailijoiden reaaliaikaista kartoitusta.

## Tiedostot

- `src/types/grocery.ts` — `PricedCatalogProduct`, `GroceryStoreId`
- `src/lib/groceryCatalog.ts` — käsin ylläpidetyt rivit
- `src/lib/groceryMatchRules.ts` — avain → avainsanat
- `src/lib/groceryOffers.ts` — tarjousrivien suodatus
- `src/lib/groceryStoreResolver.ts` — korit ja halvin arvio

## Tulevaisuus

- Viralliset kauppa-API:t tai käyttäjän omat suosikit → korvaa tai täydennä `groceryCatalog.ts`.
