# Feature audit — kokonaisuudet

**Näkyvä badge:** `HÄRMÄ4` (`VersionBadge` → `HARMÄ_BUILD`). Numero nousee ison viimeistely-/data-/moottoripassin mukaan (ei joka commit).

Tilat: **verified** = toteutettu ja linjassa auditin kanssa · **partial** = osin · **planned** = suunniteltu · **missing** = ei toteutettu.

### Kirjastot ja moottorit — lyhyt status

| Osa | Status | Huomio |
|-----|--------|--------|
| **Training Engine** | verified | `generator` + `trainingPrescriptionEngine` + `exerciseClassification` + `intensifierRules` |
| **Program Library** | verified | `PROGRAM_LIBRARY` **24** riviä (rikastettu splitType, progressionStyle, intensifierPolicyId) |
| **Reps/Load Logic** | verified | `trainingPrescriptionEngine` — luokka × tavoite × deload × RPE |
| **Intensifier Rules** | verified | `intensifierRules.ts` — policy × taso × trainingClass |
| **Exercise Rotation** | partial | `exerciseRotationEngine.ts` — neuvo + vaihtoehdot; automaattinen poolinvaihto seedillä (`rotationBlockIndex`) |
| **Program Picker** | verified | `/start` askel 9, `ProgramPicker` |
| **Training Recommendation Sync** | verified | `selectedProgramLibraryId` / `recommendedProgramLibraryId` + `intensifierPolicyFromProfile` |
| **Split recommendation** | verified | `splitRecommendationEngine` → Today |
| **Nutrition Library** | verified | muuttumaton polku |
| **Food Library** | verified | muuttumaton polku |

---

## 0. A–D — rehellinen audit (tämä passi)

### A. Training presets / blueprints / generators

| Kerros | Tiedostot | Käytössä | Fallback |
|--------|-----------|----------|----------|
| Presetit | `src/lib/programPresets.ts` | **Kyllä** — `resolveProgramPresetId`, `getProgramPresetDefinition` | Profiili ilman kirjastovalintaa |
| Blueprintit | `src/lib/programBlueprints.ts`, `src/types/coach.ts` | **Kyllä** — `resolveProgramBlueprint` | Paketti + venue + taso |
| Päivän generaattori | `src/lib/training/generator.ts` (`generateWorkoutDay`) | **Kyllä** — Workout / Today | — |
| Pro-ohjelma | `generateTrainingProgram` | Pro-UI / testit | Oletus `intensifierPolicyId: balanced` |
| Resepti-moottori | `src/lib/coach/trainingPrescriptionEngine.ts` | **Kyllä** — `exerciseToProExercise` | Policy `balanced` jos ei profiilia |

### B. Exercise data

| Asia | Totuus |
|------|--------|
| Kategoriat | `ExerciseCategory` push/pull/legs/core/conditioning (`types/exercise.ts`) |
| Luokitus V2 | `exerciseClassification.ts` + `types/exerciseClassification.ts` — movement pattern, trainingClass, fatigue, dropset-sopivuus |
| Substitution | `ExerciseAlternative` + `resolveExerciseWithAlternatives` (`exercises.ts`) |
| Coach tips | `exerciseCoachTips` |
| Progression sykli | `generateProgression` (`progression.ts`) + resepti käyttää `progressionStyle` blueprintista |

### C. Profile mappings

Profiili (`OnboardingAnswers`): `goal`, `level` / `trainingLevel`, `daysPerWeek`, `trainingVenue`, `lifeSchedule`, `shiftMode`, `biggestChallenge`, `lastBestShape`, kirjasto-ID:t, `supplementStack`, poikkeukset / vuorot.

### D. Today / Workout / Review — source of truth

| Näkymä | Lähde |
|--------|--------|
| **Today** | `generateDailyPlan` + `resolveProgramFromProfile` + valittu kirjasto (`getProgramLibraryEntry`) + **jakorivi** `recommendSplitForProfile` |
| **Workout** | `generateWorkoutDay` → sama profiili kuin dashboardilla |
| **Review** | `WeeklyReviewScreen` + historia (ei erillistä duplikaattimoottoria tässä passissa) |

---

## A. (vanha) Treeniohjelmat — täydennys

### Ohjelmakirjasto

- **Lähde:** `src/lib/coachProgramCatalog.ts` (`RAW_PROGRAM_LIBRARY` → `enrichProgramLibraryEntry` → `PROGRAM_LIBRARY`), export: `src/lib/programLibrary.ts`.
- **Määrä:** **24** ohjelmaa.
- **V2-kentät:** `splitType`, `progressionStyle`, `intensifierPolicyId`, `programBlueprintId` (täydennykset presetistä), `suggestShiftLife` (vuororiohmat).
- **Uudet:** `shift_friendly_foundation`, `shift_friendly_strength`, `shift_friendly_hypertrophy_light`.

---

## B. Ruoka / nutrition — ei kadonnut

- Nutrition library, food library, hakupolku ja profiilin `selected/recommended` synkka pysyivät ennallaan (ei rikottu).

---

## C. Taulukko — päivitetty

| Feature | Status | Tiedostot (pää) | Testipolku |
|---------|--------|-------------------|------------|
| **Training prescription** | verified | `trainingPrescriptionEngine.ts`, `exerciseClassification.ts` | `/workout` |
| **Intensifiers** | verified | `intensifierRules.ts` | `/workout` (copy) |
| **Split line Today** | verified | `splitRecommendationEngine.ts`, `AppDashboard` | `/app` |
| **Plans lifestyle filter** | verified | `plans/page.tsx` | `/plans` |

---

## P0 — interaktio / overlay

- Modaalit `/plans` (z-index 200) — ennallaan.

## Navigaatio

| Reitti | Rooli |
|--------|--------|
| `/app` | Today + jako + kirjastorivit |
| `/workout` | Liikekohtainen resepti |
| `/plans` | Kirjasto + filtterit + elämäntilanne |
| `/food`, `/food-library`, `/nutrition-plans` | Ruoat / haku / rakenne |

## Future work

- Lokidataan sidottu progressio (paino/toistot) → automaattinen rotaatio.
- Review: eksplisiittinen “noudattiko runkoa” -score kirjaston kanssa.
- E2E-mobiili CI.

## §13-tyyppinen kooste (tämä passi)

1. **Ohjelmia kirjastossa:** 24.
2. **Split recommendation:** `recommendSplitForProfile` — päivät, venue, vuoro/kiire/paluu, valittu kirjasto.
3. **Reps/load:** `classifyExercise` + tavoite + deload + `loadBias` tekstinä; RPE progression-syklistä.
4. **Intensifierit:** eristyksissä / koneissa policy:n mukaan; compound strength ei drop-oletusta.
5. **Liikevaihto:** `rotationAdviceForExercise` (neuvo); generaattori käyttää `rotationBlockIndex`-siementä.
6. **Synkka:** profiili → blueprint + policy → sama `generateWorkoutDay` Workoutissa; Today näyttää kirjaston + jakorivin.
7. **HÄRMÄ4:** kyllä.
8. **Mobiili:** ei ajettu tästä ympäristöstä (build OK).
9. **Live URL:** ei kiinnitetty repoon.
10. **Jatkossa:** analytics progressioon; syvempi Review-kytkennä.

## Linkit

- `PROJECT_BRIEF.md`
- `docs/product-audit.md` (jos olemassa)
