# Coach data V1 — yhtenäinen kerros

## Päiväavain (`dayKey`)

- Formaatti: **`YYYY-MM-DD`** (nollat täytettynä).
- API: `getDayKey(date?: Date | string)`, `getTodayDayKey()`, `normalizeDayKey(raw)` (`src/lib/dayKey.ts`).
- Vanha `dayKeyFromDate` (`src/lib/dateKey.ts`) delegoi samaan — älä rakenna päiväavaimia käsin muualla.

## Workout set -loki (`workout_logs_v2`)

- Tyyppi: `WorkoutSetLogEntry` — `exerciseId`, `exerciseName`, `dayKey`, `date` (ISO), `setIndex`, `weight`, `reps`.
- Vanha `workout_logs_v1` migroituu kerran avattaessa.
- Tapahtumat: `WORKOUT_LOG_CHANGED`, `TODAY_STATE_CHANGED` (detail `{ kind: "workout_set" }`).

## Session-loki (WorkoutView)

- `WorkoutSessionLog.dayKey` käyttää samaa `getDayKey`-formaattia.
- Tapahtuma: `WORKOUT_LOG_CHANGED`.

## Ruokalogi

- Avain: `ai-coach-food-log-v1:` + `getDayKey(date)`.
- Vanha ei-täytetty päiväavain luetaan kerran ja siirretään uuteen avaimeen.
- Tapahtumat: `FOOD_LOG_CHANGED`, `TODAY_STATE_CHANGED` (`{ kind: "food" }`).

## Food day -muoto

- Tyyppi: `FoodDayPlan` / `FoodMeal` (`src/types/foodPlan.ts`).
- Sisältö: `dayLabel`, `mealCount`, `styleLabel`, `planLabel`, `meals[]` (id, name, items).
- Lähde: `resolveFoodDayMock` → labelit `formatFoodPlanLabel` kautta (`src/lib/coachDisplayLabels.ts`).

## Tapahtumat (`src/lib/coachEvents.ts`)

| Nimi | Käyttö |
|------|--------|
| `WORKOUT_LOG_CHANGED` | Session- tai set-loki päivitetty |
| `FOOD_LOG_CHANGED` | Ruokamerkintä muuttui |
| `TODAY_STATE_CHANGED` | Yleinen “päivädata” päivittyi |

`emitCoachEvent` / `subscribeCoachEvent` — CustomEvent `window`-tasolla.

## Today — prioriteetti

1. Oikeat lokit: session (`loadWorkoutSessions` + `normalizeDayKey`), set-loki (`hasSetLogsForDay`), ruoka (`loadFoodLog`).
2. Mock: `resolveTodayDisplayMock` (sis. `formatFoodPlanLabel`).
3. Tyhjä ruoka-label: `foodPlanFallbackLabel`.
4. Treeni-rivi: `formatWorkoutPlanLabel` (mock + sessio + set-loki).

## Display labelit

- `src/lib/coachDisplayLabels.ts` — ruoka-, treeni- ja history-compact -muodot; ei kopioi samaa stringiä useaan tiedostoon.
