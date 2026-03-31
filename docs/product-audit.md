# Tuote-audit (repo-tila — final pass)

Tilat: **DONE** valmis käyttöön · **PARTIAL** osin · **MISSING** ei toteutettu / ulkoinen riippuvuus.

## Core

| Alue | Tila | Huomio |
|------|------|--------|
| Today | DONE | Järjestys TodayCardissa; coach presence + päivän sulku retention-linjoilla |
| Food | DONE | Makrot, rebalance/exception, off-plan 1-nap pikavalinnat |
| Workout | DONE | Profiiligeneraatio, ääni/tips/media fallback, lepopäivä, session jälkeen pikalinkit |
| Progress | DONE | Coach-interpretaatio + toggle-piilotus |
| Review | DONE | Viikkocoach + totuuslinja (toggle) |
| Adjustments | DONE | Poikkeusmoottori, horisontti, profiiliyhteenveto + linkki preferensseihin (toggles) |
| Paywall | DONE | Vertailu, FOMO, trial, takuurivi, conversion-lock -rivi |
| Landing /home | DONE | Lukupolku: hero → open/know → guidance → system → life → see → … |
| Onboarding | DONE | StartFlow |
| Trial / subscription | DONE | subscription.ts + SubscriptionGate |
| Feature toggles | DONE | PreferencesScreen, profiilissa |
| Profile → sisältö | PARTIAL | Resolverit ja presetit kytkeytyvät; täysi “miksi tämä ohjelma” on osin hajautettu |
| Exception engine | DONE | ExceptionEnginePanel + storage |
| Rebalance | DONE | dailyEngine / nutrition |
| Daily activity | DONE | Toggle + DailyActivityInput |
| Voice workout | DONE | Toggle + WorkoutView |
| Quick voice (food/weight/activity) | PARTIAL | Toimii; laajennus = tunnistuslaatu / selaimet |
| Exercise media | DONE | Panel + fallback |
| Machine scan | PARTIAL | Kuva + selkeä “ei live AI” -V1 (MachineScanCard) |
| Sisäiset linkit | DONE | CoachAppShortcuts, nav, dead-end redirectit (SubscriptionGate, profiili) |
| Mobile preview | DONE | docs/dev-preview.md, preview-skriptit, build-merkki |

## Launch / future

| Alue | Tila |
|------|------|
| Maksu (Stripe / App Store) | MISSING |
| Pilvi-sync / tili | MISSING |
| Oikea video-kirjasto | MISSING |
| Tuotantotason analytics-backend | PARTIAL (console + queue) |
