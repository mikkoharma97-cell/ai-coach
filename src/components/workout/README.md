# Workout UI — aktiivinen vs legacy

| Polku | Tiedosto | Huomio |
|-------|----------|--------|
| **`/workout` (aktiivinen)** | `WorkoutSessionView.tsx` | Käytössä `src/app/(coach)/workout/page.tsx` |
| Legacy (ei mountattu reitistä) | `WorkoutSession.tsx` → `WorkoutView.tsx` | Vanha sessio + swap/customize -pino; ei importteja sivuilta |

Päätöslogiikka / generaattori: `lib/coach`, `lib/training/`.
