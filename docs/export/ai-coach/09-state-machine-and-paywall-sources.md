# Tila, paywall, totuuden lähteet

## Täysi kopio: `docs/APP_STATE_MACHINE.md`

Lähde: `docs/APP_STATE_MACHINE.md` (repo).

---

# AI Coach — App State Machine

## USER STATES

### NO_PROFILE

- Ei tallennettua profiilia / onboardingia ei ole suoritettu loppuun.
- Sovellus ohjaa käyttäjän `/start`-polkuun (tai vastaavaan onboardingiin).

### ACTIVE_FREE

- Profiili on olemassa.
- Käyttöoikeus perustuu kokeiluun (`trial`) tai vastaavaan — ei maksettua tilausta, tai kokeilu on kesken.
- Pääsy appiin on sallittu niin kauan kuin `subscription.ts` / `getPaywallTruth()` antaa pääsyn.
- Paywall (täysi gate tai overlay) voi aktivoitua `paywallPolicy.ts`-sääntöjen mukaan (esim. kokeilu päättynyt, engagement-milestone).

### ACTIVE_PAID

- Maksettu tilaus (mockissa: `subscribed === true` localStoragessa) tai vastaava production-entitlement.
- Täysi käyttö; paywallia ei näytetä “ei pääsyä” -syillä.

---

## PAYWALL LOGIC

Näytä paywall / gate kun:

- `getPaywallTruth()` kertoo `shouldShowPaywall` (ei pääsyä, esim. kokeilu umpeutunut), tai
- Today-overlay kun `getTodayPaywallOverlayDecision()` niin sanoo (kokeilu vielä voimassa, engagement-ehto täyttyy).

Älä näytä paywallia:

- ilman selkeää triggeriä heti appin avauksessa,
- kesken flow’n ilman tuotteen määrittelemää syytä.

---

## ROUTING RULES

| Tila         | Käyttäytyminen |
|-------------|----------------|
| NO_PROFILE  | Redirect / onboarding (`/start`). |
| ACTIVE_FREE | App käytössä; paywall vain policy + triggerit. |
| ACTIVE_PAID | Ei “ei pääsyä” -paywallia tästä syystä. |

---

## Yhden totuuden lähteet

Älä kopioi pääsylogiikkaa komponentteihin. Käytä näitä moduuleja.

### `src/lib/subscription.ts`

- Kokeilun aloitus (`trialStartedAt`), tilaus (`subscribed`), localStorage-mock vs. production -tila.
- Funktiot kuten `hasSubscriptionAccess()`, `getSubscriptionSnapshot()`, `isTrialExpired()` — raaka entitlement / kokeiluikkuna.

### `src/lib/paywallPolicy.ts`

- `getPaywallTruth()` — koottu päätös: `hasAccess`, `shouldShowPaywall`, `paywallReason`, `billingMode`.
- Today-overlay: `getTodayPaywallOverlayDecision()` / `shouldShowTodayPaywallOverlay()`.
- Ohjauspäätökset: `shouldRedirectToPaywall()`, `canAccessPremium()`.

**UI:** lue tila näistä (tai niitä kutsuvista gate-komponenteista), älä tee rinnakkaista “onko maksullinen” -heuristiikkaa näkymissä.

---

## Lisäviite (layout)

`src/app/layout.tsx` sisältää globaaleja komponentteja (build marker, PWA, feedback, jne.) — vienti erikseen jos tarvitset UI-pinon.
