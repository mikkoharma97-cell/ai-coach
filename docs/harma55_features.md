# HÄRMÄ55 — FEATURES

Lähde: `HARMA55_FEATURES.txt` — sisältö vain **FEATURES** (ei listaa). Tämä dokumentti kertoo **mistä kokonaisuus löytyy** repossa.

## Pääindeksi

| Dokumentti | Sisältö |
|------------|---------|
| `docs/feature-audit.md` | Feature-audit, HÄRMÄ-viitteet (progress, gap, supplements, launch, demo, AI engine, notifications, settings, …), taulukoita (engines, kirjastot). |
| `docs/MASTER_BUILD_AUDIT.md` | Kokonaislistaus vs. repo. |

## Pääpinnat (reitit / näkymät)

| Alue | Reitti / komponentti (oletus) |
|------|-------------------------------|
| Tänään / koti | `/app` — `AppDashboard` |
| Ruoka | `/food` — `FoodScreen` |
| Treeni | `/workout` — `WorkoutSession` → `WorkoutView` |
| Kehitys | `/progress` — `ProgressPage` |
| Viikkokatsaus | `/review` |
| Asetukset | `/preferences`, `/settings` |
| Myynti | `/launch`, `/demo` |
| Aloitus | `/start` |

## Moottorit / data (lyhyt)

- Päiväsuunnitelma: `dailyEngine`, `composeCoachDailyPlan` / coach-päätökset (`docs/harma19_ai_engine.md`).
- Treeni: `lib/training/generator` ym. — ks. `feature-audit` → kirjastot ja moottorit.
- Profiili: `OnboardingAnswers`, `normalizeProfileForEngine`, `storage`.

## Versio

Näkyvä merkintä: `src/config/version.ts` (`APP_VERSION`, `HARMÄ_BUILD`). Ei sidosta HÄRMÄ55-numeroon.
