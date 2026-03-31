# HÄRMÄ9 — growth (lähdeteksti)

Alkuperäinen lista (`harma9_growth.txt`):

- daily return loop
- streak
- comeback logic
- referral/share

## Missä koodissa

| Vaatimus | Toteutus | Huomio |
|----------|----------|--------|
| **Daily return loop** | Päivän sulkeminen / merkinnät (`storage` day done), **Tänään** (`/app`), `progressContinueReasonKey`, `adaptive`-säännöt (eilinen → tänään). PWA-asennuskehotus (`PwaInstallPrompt`) tukee paluuta. | Ei erillistä “growth”-analytics-kerrosta tässä repossa. |
| **Streak** | `computeStreakSummary` (`src/lib/streaks.ts`), `StreakRhythmBlock`, Progress / Review -näkymät, `preferences.toggle.streaks`. | — |
| **Comeback logic** | `comeback_restart`-preset (`programPresets.ts`), kirjastossa `comeback`-ohjelmat (`coachProgramCatalog`), Plans-filtteri **Paluu/Comeback**, `splitRecommendationEngine` (esim. `lastBestShape === "long_ago"`). | — |
| **Referral / share** | **Ei toteutettu** — ei `navigator.share`, ei referral-linkkiä / kutsukoodeja. | **planned** tai tuleva integraatio. |
