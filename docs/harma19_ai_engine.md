# HÄRMÄ19 — AI decision engine (yksi päätöspolku)

## Tarkoitus

Yhdistää syötteet **tavoite · edistyminen · ruoka · treeni** yhdeksi päätökseksi: **tänään** (`CoachDailyPlan`) + **seuraava säätö** (hero + viikkoadaptaatio + ruoka-linja).

## API

- `buildCoachAiEngineResult({ profile, locale, now, plan, activeException })` → `src/lib/coach/aiDecisionEngine.ts`
- Palauttaa mm. `todayPlan`, `nextAdjustment` (hero + `weeklyHeadlineKey` + `foodLine`), `decisionV2`, `bundle`, `inputsEcho`

`plan` tulee edelleen `generateDailyPlan` (+ exception) -ketjusta (`dailyEngine`).

## Käyttö

- **Today** (`AppDashboard`): yksi `coachAi` -memo kutsuu `buildCoachAiEngineResult` — ei erillistä `getDailyCoachDecisionV2` + `buildCoachEngineBundle` -kaksikkoa.
