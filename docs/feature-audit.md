# Feature audit — kokonaisuudet (HÄRMÄ-passi)

Tilat: **verified** = testattu / linjassa · **partial** = osin · **planned** = suunniteltu / future · **missing** = ei toteutettu.

| Feature | Status | Tiedostot (pää) | Testipolku | Mobiili | Huomautukset |
|---------|--------|-------------------|------------|---------|--------------|
| **Onboarding** | verified | `src/app/start/StartFlow.tsx`, `src/lib/storage.ts` | `/start` → tallenna → `/app` | Kyllä | PreStartSalesWall ennen kyselyjä |
| **Profile engine** | partial | `src/lib/coach/profileNormalizer.ts`, `src/types/coach.ts`, `src/hooks/useClientProfile.ts` | Profiili → Today | Kyllä | Täysi “miksi tämä ohjelma” hajautettu |
| **Training engine** | partial | `src/lib/training/generator.ts`, `src/lib/coach/programDecisionEngine.ts`, `src/lib/coach/trainingEngine.ts`, blueprints | `/workout` | Kyllä | Archetype + blueprint; Pro vs guided erot |
| **Nutrition engine** | partial | `src/lib/nutrition*.ts`, `src/lib/mealEngine.ts`, `src/lib/adaptive.ts` | `/food` | Kyllä | Makrot, rakenne; shift-kerros `shiftAdaptation.ts` |
| **Week adaptation** | partial | `src/lib/coach/weekAdaptationEngine.ts`, `src/lib/weeklyReview.ts` | `/review` | Kyllä | Viikkopalaute + shift-linja |
| **Today** | verified | `src/app/(coach)/app/AppDashboard.tsx`, `src/components/TodayCard.tsx`, `src/lib/dailyEngine.ts` | `/app` | Kyllä | Completion-modali + thinkless + streak-bump |
| **Food** | partial | `src/components/FoodScreen.tsx`, `src/lib/food/*` | `/food` | Kyllä | Lisää ruoka -flow: tarkista modaalit jos jumi |
| **Workout** | verified | `src/components/WorkoutSession.tsx`, `src/components/WorkoutView.tsx` | `/workout` | Kyllä | Voice + media fallback |
| **Progress** | partial | `src/components/ProgressPage.tsx`, `src/lib/progress/*`, `DevelopmentTrajectoryCard` | `/progress` | Kyllä | Paino + käyrät + hero insight; data riippuu logeista |
| **Review** | verified | `src/components/WeeklyReviewScreen.tsx`, `src/lib/weeklyReview.ts` | `/review` | Kyllä | Lyhyt coach + shift-viikko |
| **Paywall** | verified | `src/components/paywall/PaywallScreen.tsx`, `src/lib/subscription.ts` | `/paywall`, `/subscribe`, `/premium` | Kyllä | premium = alias paywallille |
| **Landing** | verified | `src/app/home/page.tsx`, `src/components/landing/*` | `/home` | Kyllä | Scroll, ei pakotettua swipea koko sivulle |
| **Feature toggles** | verified | `src/components/PreferencesScreen.tsx`, `src/types/coachPreferences.ts` | `/preferences` | Kyllä | Oma valmentaja -kytkimet |
| **Shift work adaptation** | verified | `src/types/workShifts.ts`, `src/lib/workShiftStorage.ts`, `src/lib/shiftAdaptation.ts`, `WorkShiftPlanner`, `adaptive.ts`, `decisionEngineV2.ts` | `/adjustments` → tallenna → `/app` | Kyllä | Myynti: `landing.shiftSell*`, paywall sell10/11, prestart feat9 |
| **Daily activity** | verified | `src/lib/activityStorage.ts`, `DailyActivityInput` | Today | Kyllä | Bonus kcal päiväsuunnitelmaan |
| **Rebalance** | verified | `src/lib/nutrition/rebalance*.ts`, `adaptive.ts` | Food, Today | Kyllä | Ylisyönti-tasapaino |
| **Exception engine** | verified | `src/lib/exceptions/*`, `ExceptionEnginePanel` | `/adjustments` | Kyllä | mergeExceptionIntoDailyPlan |
| **Voice workout** | verified | `WorkoutView`, toggles | `/workout` | Osittain | Selain riippuvainen |
| **Quick voice logging** | partial | Food, activity, weight - pikaviestit | Food, Today | Osittain | Tunnistuslaatu / selaimet |
| **Exercise media** | verified | `WorkoutView` / panelit | `/workout` | Kyllä | Fallback |
| **Machine scan** | partial | `MachineScanCard`, scan route | `/scan` | Kyllä | Ei live CV -disclaimer |
| **Grocery / shopping** | partial | `FoodShoppingListBlock`, `src/lib/food/storeSuggestions.ts`, `weeklySpendDisplay.ts` | `/food` → ostoslista | Kyllä | Haarukka €, ei live-API; kova clamp koodissa |
| **Version marker** | verified | `src/components/common/VersionBadge.tsx`, `src/app/layout.tsx` | Kaikki sivut | Kyllä | Fixed, safe-area, pointer-events-none |
| **Swipe panels** | partial | Reusable swipe -komponentit missä käytössä | Food / Today tarvittaessa | Kyllä | Ei pakotettu joka näkymään |
| **Build / preview** | verified | `src/lib/buildInfo.ts`, `PreviewBuildStrip`, `BuildRefreshToast` | Coach shell | Kyllä | |

## P0 — interaktio / overlay (tarkistuslista)

- `useAsyncButtonState`: failsafe timeout (oletus 3000 ms) + `finally` — käytössä kriittisissä napeissa.
- Modaalit: `DayCompletionModal` z-index 100; globaali badge z-index 9999, `pointer-events-none` (ei klikkiblokkausta).
- **Jatkossa:** jokaiselle uudelle modalille: ESC, backdrop, loading reset max ~4 s.

## Navigaatio — ydinpolku

| Reitti | Rooli |
|--------|--------|
| `/home`, `/start`, `/app`, `/food`, `/workout`, `/progress`, `/review`, `/adjustments`, `/paywall` | Pääpolku |
| `/subscribe`, `/premium` | Paywall-alias |
| `/plan`, `/preferences`, `/settings`, `/profile`, `/packages`, `/scan`, `/pro` | Tuki / profiili / Pro — ei yhdistetty tässä passissa (audit vain) |

## Future work (ei tässä passissa)

- Täysi copy-pass kaikille näkymille (cool coach, yhtenäinen).
- Landing/paywall “aggressive premium” -tiivistys erillisellä copy-passilla.
- Desktop-sidebar: ei, ellei erikseen pyydetä.
- Stripe / pilvi-sync: missing.

## Linkit

- Ihmislukuinen konteksti: `PROJECT_BRIEF.md` (jos olemassa)
- Vanhempi taulukko: `docs/product-audit.md`
