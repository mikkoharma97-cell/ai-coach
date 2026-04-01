# Mobile audit — HÄRMÄ62

Polkuja: `/home` (markkinointi), coach: `/app`, `/food`, `/workout`, `/progress`, `/review`, `/adjustments`.

## Yhteiset

| Aihe | Havainto | Toimenpide (HÄRMÄ62) |
|------|-----------|------------------------|
| Scroll-lukko | `useOverlayLayer` oli vain osassa overlayja | Päivitetty: päivän modaalit (DayCompletion, Minimum), workout customize/swap, plans/nutrition vahvistus käyttää `useOverlayLayer`; Food-sheets olivat jo |
| Z-index | 200/210 vs nav 50 — sekalainen | Yhtenäistetty: sheetit ~280/281, swap workout 290, päivän modaalit 280 |
| Safe area | Osassa `pt-12` kiinteä | Taustaan lisätty `pt-[max(3rem,env(safe-area-inset-top)+…)]` modaaleihin / sheet-taustaan |
| Bottom padding | `coach-page` pb-12 ei riittänyt navin yli | `coach-page`: `padding-bottom: calc(5.75rem + safe-area-inset-bottom)` |
| Tuplascroll | `app-main-scroll` + overlay | `useOverlayLayer` lukitsee `.app-main-scroll` + body (olemassa) |

## /home

Marketing: `SiteHeader` (safe-area top), ei coach-shellia. OK.

## /app (Today)

- **Modaalit:** `DayCompletionModal`, `MinimumDayModal` — nyt `useOverlayLayer` + z 280.
- **Rakenne:** Yksi pääkortti (`TodayCard`); viikko/insightit **details**-foldissa. Footer tiivistetty: yksi linkki Lisää + muuta profiilia.

## /food

- **Sheetit:** Lisää ateria (portal), korvaus (`MealSubstituteSheet`) — z 280/281, `useOverlayLayer` sheetille.
- **Päätoiminto:** Hero-nappi `food.addMealHero` heti headerin jälkeen (pää-CTA).

## /workout

- **Mukauta + swap:** `useOverlayLayer(customize \|\| swap)`; customize z 280, swap z 290 (vain toinen kerrallaan).
- Bottom sheet -tyyli säilyy.

## /progress

- `ProgressPage` — container `pb-28`; `coach-page` hoitaa nyt turvallisemman paddingin.

## /review

- `WeeklyReviewScreen`: kiinteä CTA-palkki `z-[60]` — modaalien (280) alla. OK.

## /adjustments

- Ei fullscreen-fixed modaaleja tässä passissa.

## Capacitor / native

Katso `docs/mobile-build.md`.
