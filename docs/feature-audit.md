# Feature audit — kokonaisuudet

**Näkyvä badge:** `HÄRMÄ15` (`VersionBadge` → `src/config/version.ts` → `COACH_RELEASE_LABEL`). Asetuksissa: `BuildMarkerLine` näyttää `HÄRMÄ15 · BUILD v15` + semver-aika.

**HÄRMÄ6 progress-pilarit:** `docs/harma6_progress.md` (consistency / weekly summary / coach insight / daily completion sync → koodiviitteet).

**HÄRMÄ7 gap-fix:** `docs/harma7_gap.md` (nav, food add sheet, program↔nutrition sync, mobile).

**HÄRMÄ8 supplements:** `docs/harma8_supplements.md` (stack, makrot, suositukset, featured placements).

**HÄRMÄ9 growth:** `docs/harma9_growth.md` (referral/share = planned).

**HÄRMÄ14 launch:** `docs/harma14_launch.md` — `/launch`, `/demo`, EntryGate → `/launch`.

**HÄRMÄ15 sales:** `docs/harma15_sales.md` — kiire, kipu→ratkaisu, luottamus, lyhyt copy.

Tilat: **verified** = toteutettu ja linjassa auditin kanssa · **partial** = osin · **planned** = suunniteltu · **missing** = ei toteutettu.

### Coach Voice System (HÄRMÄ5+)

| Asia | Status |
|------|--------|
| **Source of truth** | `src/config/coachVoice.ts` — säännöt, kielletyt fraasit, `fragments` |
| **Versio** | `src/config/version.ts` — `APP_VERSION` v14, `HARMÄ_BUILD` 14 |
| **Käyttäjälle näkyvä teksti** | **partial** → pääpolku (`src/lib/i18n.messages.ts` FI + EN), komponentit `t()`-avaimilla; ei täyttä literaalien ajoa joka tiedostossa tässä passissa |
| **Tarkistettu laiteella** | **planned** — tuotantobuild + push; Vercel smoke |

#### 0 — Käyttäjälle näkyvät tekstityypit (inventaario)

| Tyyppi | Päälähde |
|--------|----------|
| Today / dashboard | `i18n` `today.*`, `daily.*`, `shift.*`, `engine.*`, `dashboard.*`, `AppDashboard` |
| Workout | `workout.*`, treeninäkymät |
| Food | `food.*`, `FoodShoppingListBlock`, ruokasivut |
| Review | `review.*` |
| Progress | `progress.*` |
| Onboarding / start | `onboarding.*`, `StartFlow`, `prestart.*` |
| Start / pre-start / myynti | `landing.*`, `copy.core.*`, `prestart.*` |
| Paywall | `paywall.*` |
| Napit / CTA | `ui.*`, `nav.*`, modaalit `today.complete*` |
| Tyhjät tilat | `empty.*`, `fallback.*`, `food.noSuggestion` jne. |
| Virheet | `settings.exportFailed`, `food.sheetSaveFailed`, `workout.voice.error.*` |
| Lataus / ajattelu | `common.loading`, `today.markingDay`, `onboarding.buildingWait` |
| Modaalit | `today.completeModal*`, `exception.*`, `programChange.*` |
| Toggle / asetukset | `preferences.*`, `adjust.*`, `settings.*` |
| PWA / build | `pwa.*`, `build.*`, `preview.*` |

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
7. **HÄRMÄ15:** sales copy — `docs/harma15_sales.md` + `/launch` + `version.ts`.
8. **Mobiili:** tuotantobuildin jälkeen smoke (planned / CI).
9. **Live URL:** Vercel deploy — tarkista manuaalisesti.
10. **Jatkossa:** jäljellä olevat literaalit komponenteissa; syvempi Review-EN/FI -parity.

## Linkit

- `PROJECT_BRIEF.md`
- `docs/product-audit.md` (jos olemassa)
