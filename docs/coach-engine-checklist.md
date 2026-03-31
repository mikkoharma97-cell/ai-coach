# Coach Engine V1 — feature audit

Tila: `planned` | `partial` | `verified`

| Feature | Status | Tiedostot | Miten testattu | Mobiilipolku |
|---------|--------|-----------|----------------|--------------|
| Profile normalization | verified | `src/lib/coach/profileNormalizer.ts` | `npm run build`; spot-check `peekProfileNormalization` | `/start` → tallenna profiili → `/app` |
| Program decision (preset + blueprint + sävy) | verified | `src/lib/coach/programDecisionEngine.ts`, `profileProgramResolver.ts` | build; päätös = `resolveProgramFromProfile` + confidence | `/app` (preset-rivi), `/review` |
| Training frame / rajat | partial | `src/lib/coach/trainingEngine.ts`, `programBlueprints.ts`, `training/generator.ts` | build; archetype + `resolveProgramBlueprint` | `/workout` |
| Nutrition snapshot (makrot + rakenne) | verified | `src/lib/coach/nutritionEngine.ts`, `lib/nutrition.ts` | build; `buildNutritionEngineSnapshot` | `/food` |
| Week adaptation | verified | `src/lib/coach/weekAdaptationEngine.ts` | build; signaalit `coachEngineBundle` / review-metrics | `/app`, `/adjustments`, `/review` |
| Explanation layer | verified | `src/lib/coach/explanationEngine.ts` | build; `buildCoachExplanation` | copy näkyy feedbackissä |
| Feedback lines | verified | `src/lib/coach/feedbackEngine.ts` | build | `/app`, `/food`, `/workout`, `/review` |
| Single engine path (bundle) | verified | `src/lib/coach/coachEngineBundle.ts` | build; sama bundle Today/Food kun plan sama | `/app` ↔ `/food` |
| UI: Today rationale + viikkolinja | verified | `AppDashboard.tsx`, `TodayCard.tsx` | build; `engineWeekLine` | `/app` |
| UI: Food coach line | verified | `FoodScreen.tsx` | build | `/food` |
| UI: Workout frame line | verified | `WorkoutSession.tsx`, `WorkoutView.tsx` | build | `/workout` |
| UI: Review adaptation | verified | `WeeklyReviewScreen.tsx` | build | `/review` |
| UI: Adjustments engine headline | verified | `AdjustmentsScreen.tsx` | build | `/adjustments` |
| Progress: viikkolinja-kortti | verified | `ProgressPage.tsx`, `DevelopmentTrajectoryCard.tsx` | build | `/progress` |
| Mobile interaction safety (P0) | partial | — | Ei automatisoitu tässä paketissa; manuaali | kaikki polut |

## Huomio

- **verified** = build läpi + koodi kytketty; täysi **verified** mobiilissa vaatii laitetestin käyttäjältä.
- `confidenceLevel` (`programDecisionEngine`) näkyy toistaiseksi vain datana / jatkokehitykseen UI:hin.
