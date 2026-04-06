# Real content V1

## Lähde

Paketikohtainen valmennussisältö: `src/data/coachContent.real.ts` (`COACH_CONTENT_BY_PACKAGE`).

Tyypit: `src/types/coachContent.ts` (`CoachProgramContent`, päivätaulukot pituus 7, indeksi = maanantai 0, `getMondayBasedIndex`).

## Täyttö

- `programFocusLabel`, `defaultWorkoutLabel`, `defaultFoodLabel`
- `workoutDays[0..6]`: joko `CoachWorkoutDay` tai `null` (null → treenigeneraattori)
- `foodDays[0..6]`: joko `CoachFoodDay` tai `null` (null → `resolveFoodDayMock`)

## Resolver

`src/lib/coachContentResolver.ts`: haku + mappaus `ProExercise` / `GeneratedWorkoutDay` / `FoodDayPlan`. Ei importtaa `coachEngine.ts`.

## Käyttö

- Today / coach copy: `coachEngine.ts` (työntö + ruoka-otsikot kun päivä on täytetty)
- Treeni-UI: `buildTodayWorkoutForUiWithContent` (`todayDashboardEngine.ts`)
- Ruoka-UI: `FoodScreenSimple` → reaalipäivä tai mock

## Fallback

Generaattori + `resolveFoodDayMock`, kun kyseisen indeksin solu on `null`.
