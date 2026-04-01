# HÄRMÄ53 — COACH MODE

Lähde: ulkoinen muistiinpano `HARMA53_COACH_MODE.txt` (tyhjä paitsi otsikko **SELF COACH**). Tuotteessa ei ole erillistä merkkijonoa «self coach» — tilat ovat **`guided` | `pro`** (`CoachMode`).

## Semantiikka

| Ulkoinen muistio | Sovelluksessa |
|------------------|----------------|
| «Self coach» / oma ohjaus | **`pro`** — valinnainen työkalukerros, oma runko (blueprintit), vähemmän valmentajatekstiä UI:ssa |
| Järjestelmän ohjaus | **`guided`** — oletus; täydempi coach-copy / videot / rivit kun featuret päällä |

`dailyEngine` ei erottele `mode`-kenttää päätöksissä samalla tavalla kuin UI; kommentti `types/coach.ts`: `mode` vaikuttaa erityisesti **Pro-UI** ja `getCoachFeatureToggles`-logiikkaan.

## Tyyppi ja tallennus

- `OnboardingAnswers.mode?: CoachMode` — `"guided" \| "pro"`, oletus `guided` (`normalizeProfileForEngine`).
- Asetukset: `SettingsScreen` — radiot `settings.modeGuided` / `settings.modePro`, `saveProfile`.

## Pro → kevyempi coach-kerros

`getCoachFeatureToggles` (`coachFeatureToggles.ts`): jos `mode === "pro"`, pakotetaan:

- `showHelpVideos: false`
- `showCoachLines: false`

Muut togglet profiilin `coachFeatureToggles` + oletukset.

## Muut näkymät (esimerkkejä)

- **Workout** `WorkoutSession`: Pro → ei `exercisePerformanceHints`, ei `coachFrameWithShift` (toteutus voi muuttua).
- **Pro-näkymä** `ProScreen`: oma rakenne / kirjasto-konteksti.
- **Ohjelmakirjasto**: `entryVisible` tms. voi rajata näkyvyyttä tilan mukaan (`coachProgramCatalog.ts`).

## Versio

Ei sidottu HÄRMÄ53-numeroon — `src/config/version.ts`.
