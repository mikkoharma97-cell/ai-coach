# Paywall-komponentit

**Ainoa toteutus:** `paywallPolicy.ts` + `PaywallV1Panel` + `PaywallV1Screen` (`/paywall`).

| Komponentti | Käyttö |
|-------------|--------|
| `PaywallV1Screen.tsx` | Reitti `/paywall` |
| `PaywallV1Panel.tsx` | Today-overlay + täysi paywall -näkymä (sama copy) |
| `legacy/PaywallScreen.tsx` | **Arkisto** — ei reittejä, ei importteja. Älä käytä. |

Uudelleenohjaukset: `next.config.ts` (`/subscribe`, `/premium` → `/paywall`).

Treeni-aktiivinen vs legacy: `src/components/workout/README.md`.
