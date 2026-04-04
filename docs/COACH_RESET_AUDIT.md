# Coach — hard reset audit (nykytila)

**Repo:** `ai-coach`  
**Tarkoitus:** Palauttaa hallinta ilman että tehty työ katoaa. Tämä dokumentti on **kartoitus**, ei toteutussuunnitelma.  
**Päivitetty:** 2026-04-04 (prod pinta: GlobalBuildMarker vain app-shell, Review-strip tuotanto, `workout/README.md`, mobile-blocker `docs/mobile-build.md`; RouteFlash poistettu)

---

## Legenda

| Tila | Merkitys |
|------|----------|
| **DONE** | Toteutus vastaa launch-tavoitetta tai on selkeästi valmis |
| **PARTIAL** | Osittain kunnossa; vaatii viimeistelyä, skopea tai dokumentointia |
| **BROKEN** | Tunnettu rikkinäinen käyttäytyminen (ei havaittu tässä auditissa) |
| **UNKNOWN** | Ei varmennettu ajossa / laitteella tässä kierroksessa |

---

## 1. Alueittain — tila

| Alue | Tila | Perustelu (lyhyt) |
|------|------|-------------------|
| **Onboarding** | **DONE** | `OnboardingFlow.tsx`: 5 askelta (goal → level → päivät → ruoka → yhteenveto), indikaattori `step+1/5`, `onboarding_start` / `onboarding_complete`, reitti `/start` → tallennus → `router.push("/app")`. Rakennusviive ~900 ms + overlay. |
| **Today** | **DONE** | `TodayView.tsx`: ennen merkintää yksi primary CTA → `/workout`, ruoka linkkinä; completionin jälkeen huominen + share; paywall-overlay `paywallPolicy.shouldShowTodayPaywallOverlay`. |
| **Workout** | **DONE** | **Reitti:** `WorkoutSessionView.tsx` (`/workout`). Legacy `WorkoutSession` + `WorkoutView` ei mountattu — ks. `components/workout/README.md`. |
| **Food / day** | **DONE** | `FoodDayView.tsx`: `buildFoodDayLines` rajattu `.slice(0, 5)`, yksi primary CTA (`foodFlowV1.ctaKeep`). |
| **Paywall** | **PARTIAL** | **Aktiivinen totuus:** `paywallPolicy.ts` + `PaywallV1Panel` / `PaywallV1Screen`. **Legacy:** `PaywallScreen.tsx` — ei reititetty. **`/subscribe` ja `/premium`** → `next.config` **redirect** `/paywall` (ei erillisiä sivuja). |
| **Settings** | **DONE** | `SettingsScreen.tsx`: listamainen `SettingsRow`, isot linkkialueet, ei korttiseinää. |
| **Preferences** | **PARTIAL** | `PreferencesScreen.tsx`: kattava lomake + toggle-rivit + `HelpVideoCard` — launch-kriittinen **mobiili one-task** -tavoite voi kärsiä määrästä (ei automaattisesti rikki, mutta tiivis skannaus vaikea). |
| **Subscription** | **DONE** | `subscription.ts`: **mock** = `localStorage` + `subscribed` + 7 pv kokeilu; **production** = `NEXT_PUBLIC_COACH_SUBSCRIPTION_MODE=production` + kommentoitu paikka oikealle `read`/`write`. Eksplisiittinen. |
| **Analytics** | **PARTIAL** | `analytics.ts`: `onboarding_complete`, `day1_complete`, `day2_complete`, `paywall_open`, `paywall_convert` (+ muita). Toteutus: `console` + `sessionStorage`-jono; ei ulkoista backendia. **Huom:** `eventLogger.logOpenPaywall()` lähettää sekä `open_paywall` että `paywall_open` — käytössä vain **legacy-`PaywallScreen`** -komponentissa (ei mountattu). Aktiivinen polku käyttää `trackEvent("paywall_open", { reason })`. |
| **Coach voice** | **PARTIAL** | Paywall V1 ja Today -osion kopiointi lyhyttä linjaa noudattaa. Koko `i18n.messages.ts` on laaja; kaikkia näkymiä ei käyty läpi sana sanalta. |
| **Mobile state** | **PARTIAL** | Launch-näkymät (`Container size="phone"`, safe area, isot CTA:t) kohdillaan koodissa. **Ei** varmennettu tässä auditissa oikealla laitteella; `AppShell` käyttää `app-device-frame`-kehystä (desktop näyttää puhelimen). |

---

## 2. Aktiivinen vs legacy (yksi totuus kerrallaan)

| Aihe | Aktiivinen | Legacy / ei käytössä |
|------|------------|----------------------|
| Paywall-näkymä | `PaywallV1Screen` + `PaywallV1Panel`, copy `paywallV1.*` | `PaywallScreen` — **ei importteja reiteistä** |
| Paywall-päätöslogiikka | `paywallPolicy.ts` (`canAccessPremium`, `shouldRedirectToPaywall`, `shouldShowTodayPaywallOverlay`) | Ei rinnakkaista “toista” policy-tiedostoa |
| Tilauksen tila | `subscription.ts` + `ai-coach-subscription-v1` | — |
| Pehmeä paywall / ack | `storage`: `hasPaywallV1Ack` / `setPaywallV1Ack` | — |
| Trial redirect | `SubscriptionGate` → ei pääsyä → `/paywall` | — |
| Analytics paywall | `trackEvent("paywall_open", { reason })` aktiivisissa näkymissä | `logOpenPaywall()` tuplaa eventit jos `PaywallScreen` otettaisiin käyttöön |

---

## 3. Paywall — yksi totuus (dokumentoitu)

| Kysymys | Vastaus |
|---------|---------|
| **Milloin näytetään?** | (1) Kokeilu päättynyt eikä tilausta → `shouldRedirectToPaywall()` → gate ohjaa `/paywall`. (2) Kokeilu vielä voimassa, vähintään 2 päivää merkitty suoritetuksi, ei tilausta, ei ack → `shouldShowTodayPaywallOverlay` → overlay Todayssa. |
| **Miksi?** | `reason`: `trial_expired` (kokoruudun paywall) / `engagement_milestone` (Today-overlay). |
| **Käyttäjän tila** | `getSubscriptionSnapshot()`: `subscribed`, `trialStartedAt`, `inTrial`, `daysLeftInTrial`. |
| **Mock vs production** | Oletus **mock** (localStorage). **production** vain kun env asetettu; oikea billing ei ole kytketty, mutta rajapinta ja kommentit ohjaavat jatkotyön. |

---

## 4. Tiedostoviitteet (pikahaku)

- Onboarding: `src/components/onboarding/OnboardingFlow.tsx`, `src/app/start/page.tsx`
- Today: `src/components/today/TodayView.tsx`, `src/app/(coach)/today/page.tsx`
- Workout: `src/components/workout/WorkoutSessionView.tsx`
- Food day: `src/components/food/FoodDayView.tsx`, `src/app/(coach)/food/day/page.tsx`
- Paywall: `src/lib/paywallPolicy.ts`, `src/components/paywall/PaywallV1Screen.tsx`, `src/components/paywall/PaywallV1Panel.tsx`, `src/app/paywall/page.tsx`
- Gate: `src/components/SubscriptionGate.tsx`, `src/app/(coach)/layout.tsx`
- Subscription: `src/lib/subscription.ts`
- Analytics: `src/lib/analytics.ts`
- Settings / Preferences: `src/components/SettingsScreen.tsx`, `src/components/PreferencesScreen.tsx`

---

## 5. Riskit / epäselvyydet (ei korjausta tässä)

1. **`PaywallScreen.tsx`** säilyy repossa — sekoitusriski kehittäjille; ei vaikuta ajossa jos ei importata.
2. **Preferences** on laaja — hallintapaneeli-fiilis mahdollinen vs. “yksi tehtävä per näkymä” -launch-sääntö.
3. **Analytics** ei lähetä palvelimelle — odotettu stub, mutta launch-mittaus vaatii myöhemmin putken.

---

## 6. Build

Viimeisin `npm run build` auditin yhteydessä: **onnistui** (exit code 0). Turbopack-varoitus `next.config.ts` / NFT-jäljestä — ei build-fail.
