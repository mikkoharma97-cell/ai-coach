# Navigointiaudit — `router` / `window.location`

Luokittelu: **gate** = pääsy / tila; **cta** = käyttäjän tai flow’n toiminto; **data** = ei reittivaihtoa; **dev** = build/preview; **legacy** = vanha polku; **util** = jaettu apu.

## `useRouter` — `push` / `replace` / `refresh`

| Tiedosto | Kutsu | Luokitus | Huomio |
|----------|--------|----------|--------|
| [`src/components/EntryGate.tsx`](../src/components/EntryGate.tsx) | `replace("/app")` \| `replace("/home")` | gate | Juuri `/` → profiilin mukaan |
| [`src/components/SubscriptionGate.tsx`](../src/components/SubscriptionGate.tsx) | `replace("/start")` \| `replace("/paywall")` | gate | Ei profiilia / trial → paywall |
| [`src/components/paywall/PaywallV1Screen.tsx`](../src/components/paywall/PaywallV1Screen.tsx) | `replace("/start")` \| `replace("/app")` \| `push("/settings")` | gate + cta | Effect ohjaa; takaisin asetuksiin |
| [`src/app/(coach)/packages/page.tsx`](../src/app/(coach)/packages/page.tsx) | `push("/start")` \| `push("/app")` | gate / cta | Profiilin puute vs. jatka |
| [`src/components/more/MoreHubScreen.tsx`](../src/components/more/MoreHubScreen.tsx) | `push("/start")` \| `push("/app")` \| `replace("/start")` | gate + cta | Demo / tyhjennä data |
| [`src/components/SettingsScreen.tsx`](../src/components/SettingsScreen.tsx) | `replace("/start")` | cta | Tyhjennä data → onboarding |
| [`src/components/CoachProfileMissingFallback.tsx`](../src/components/CoachProfileMissingFallback.tsx) | `push("/start")` | cta | Korjaa profiili |
| [`src/components/today/TodayView.tsx`](../src/components/today/TodayView.tsx) | `push("/settings")` | cta | Oikopolku asetuksiin |
| [`src/components/workout/WorkoutSessionView.tsx`](../src/components/workout/WorkoutSessionView.tsx) | `push("/app", { scroll: false })` | cta | Valmis → tänään |
| [`src/components/WorkoutView.tsx`](../src/components/WorkoutView.tsx) | `push("/app", { scroll: false })` | cta | Sama |
| [`src/components/food/FoodDayView.tsx`](../src/components/food/FoodDayView.tsx) | `push("/app")` | cta | Paluu |
| [`src/components/onboarding/OnboardingFlow.tsx`](../src/components/onboarding/OnboardingFlow.tsx) | `push("/app")` | cta | Onboarding valmis |
| [`src/components/WorkoutSession.tsx`](../src/components/WorkoutSession.tsx) | `refresh()` | data | RSC / tilan päivitys |
| [`src/app/(coach)/nutrition-plans/page.tsx`](../src/app/(coach)/nutrition-plans/page.tsx) | `refresh()` | data | |
| [`src/app/(coach)/plans/page.tsx`](../src/app/(coach)/plans/page.tsx) | `refresh()` | data | |
| [`src/components/paywall/legacy/PaywallScreen.tsx`](../src/components/paywall/legacy/PaywallScreen.tsx) | useita `push` / `replace` | **legacy** | Vanha paywall; ei pääpolku |

**Link-komponentit** (ei taulukossa): [`AppShell`](../src/components/app/AppShell.tsx) bottom nav + brand — SPA-navigointi ilman erillistä `router`-kutsua.

## `window.location`

| Tiedosto | Käyttö | Luokitus | Huomio |
|----------|--------|----------|--------|
| [`PaywallV1Screen.tsx`](../src/components/paywall/PaywallV1Screen.tsx) | [`navigateAfterPaywallConvert()`](../src/lib/coachNavigation.ts) | cta | **Täysi lataus** konversion jälkeen |
| [`AppShell.tsx`](../src/components/app/AppShell.tsx) | `origin` + polku | util | Avaa nykyinen URL uuteen välilehteen |
| [`PreferencesScreen.tsx`](../src/components/PreferencesScreen.tsx) | `hash` | data | Ankkuriosio, ei navigointi |
| [`HomeCheckButton.tsx`](../src/components/build/HomeCheckButton.tsx) | `reload()` | dev | Build-tarkistus |
| [`PreviewHardRefreshButton.tsx`](../src/components/build/PreviewHardRefreshButton.tsx) | `reload()` | dev | |
| [`versionStorage.ts`](../src/lib/versionStorage.ts) | `search`, `replace` | util | Versio / pakota refresh |
| [`demoSeed.ts`](../src/lib/demoSeed.ts) | `search`, `replace` | dev / util | Demo-query |
| [`analytics.ts`](../src/lib/analytics.ts) | `pathname` | util | |
| [`shareCoach.ts`](../src/lib/shareCoach.ts) | `origin` | util | |
| [`SettingsPreviewDiagnostics.tsx`](../src/components/SettingsPreviewDiagnostics.tsx) | `origin` | util | |
| [`TrainingIntelligenceBlock.tsx`](../src/components/review/TrainingIntelligenceBlock.tsx) | `origin` | util | |

## Poikkeukset ja riskit

1. **Paywall-konversio** käyttää [`navigateAfterPaywallConvert()`](../src/lib/coachNavigation.ts) (täysi lataus) kun muut näkymät käyttävät `router` — tarkoituksellinen (katso [ADR 001](adr/001-client-navigation.md)).
2. **`PaywallScreen` (legacy)** — oma `router`-logiikka; jos reitti vielä elossa, päällekkäisyys pääpolun kanssa.
3. **Sama ohjaus useassa paikassa** (esim. ei profiilia → `/start`): gate hoitaa coach-reitit; yksittäiset sivut voivat toistaa tarkistuksen — pysy policy-moduuleissa kun mahdollista.

## Päivitys

Uusia `router` / `window.location` -kohtia lisättäessä päivitä tämä lista tai lisää viittaus moduuliin jossa navigointi on keskitetty.
