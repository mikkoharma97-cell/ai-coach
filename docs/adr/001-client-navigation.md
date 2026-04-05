# ADR 001: Asiakaspuolen navigointi (Next App Router)

**Tila:** hyväksytty  
**Konteksti:** `ai-coach` — PWA / Capacitor, coach-kuori [`AppShell`](../../src/components/app/AppShell.tsx), gate:t [`EntryGate`](../../src/components/EntryGate.tsx), [`SubscriptionGate`](../../src/components/SubscriptionGate.tsx).

## Päätökset

### 1. `router.replace` — korvaa historia

Käytä kun käyttäjän **ei pitäisi palata** edelliseen näkymään (estetty tai merkityksetön tila):

- Juuriohjaus profiilin mukaan (`/`).
- Gate: ei profiilia → `/start`, ei pääsyä → `/paywall`.
- Paywall-näkymän automaattinen ohjaus kun tila ei vastaa näkymää.
- Asetukset: tyhjennä data → `/start` (ei jätä “asetukset → takaisin väärään tilaan” -ketjua).

### 2. `router.push` — säilytä historia

Käytä kun siirtymä on **normaali käyttöpolku** (takaisin-napilla järkevä):

- Onboarding / treeni / ruoka-valmis → `/app` tai muu kohde.
- CTA:t (asetukset, paketit, jne.).

**Scroll:** kun palataan pitkältä sivulta (`WorkoutView`, `WorkoutSessionView`), käytä `{ scroll: false }` jos tuote vaatii.

### 3. `router.refresh`

Käytä kun **palvelinkomponenttien data** tai välimuisti pitää päivittää ilman täyttä URL-vaihtoa (esim. suunnitelmat).

### 4. Täysi sivulataus — `window.location` / `location.replace`

Käytä vain kun **kova uudelleenlataus** on perusteltu:

- **Paywall-konversio** (`PaywallV1Screen`): [`navigateAfterPaywallConvert()`](../../src/lib/coachNavigation.ts) — varmistaa puhtaan tilan mock-/localStorage-muutoksen jälkeen (yksi selkeä syy kerrallaan).
- **Versio / pakota päivitys** ([`versionStorage`](../../src/lib/versionStorage.ts)): query + `replace`.
- **Dev / preview:** `reload()` build-napeissa.

Älä käytä täyttä latausta pelkkään “varmuuden vuoksi” jos `router.replace` + `refresh` riittää.

### 5. `Link` (AppShell)

Päänäkymät välilehdillä: **aina `Link`** — sama kuin `router.push`, parempi esilataus ja saavutettavuus.

## Seuraukset

- Uusia “pakko `/start`” -tarkistuksia ei lisätä satunnaisiin komponentteihin; ensisijaisesti gate + [`paywallPolicy`](../../src/lib/paywallPolicy.ts).
- Poikkeukset dokumentoidaan koodiin lyhyellä kommentilla tai päivitetään [NAVIGATION_AUDIT](../NAVIGATION_AUDIT.md).
