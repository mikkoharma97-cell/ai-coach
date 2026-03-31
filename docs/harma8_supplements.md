# HÄRMÄ8 — supplements (lähdeteksti)

Alkuperäinen lista (`harma8_supplements.txt`):

- user adds supplements
- affects macros
- recommendations
- monetization slots

## Missä koodissa (status)

| Vaatimus | Toteutus |
|----------|----------|
| **Käyttäjä lisää lisäravinteita** | `SupplementStackEditor` (`src/components/supplements/SupplementStackEditor.tsx`) — `profile.supplementStack`, `sanitizeSupplementStack`, `newSupplementEntry` (`src/lib/supplementStack.ts`). |
| **Vaikuttaa makroihin** | `totalSupplementProteinG(profile)` → `composeCoachDailyPlan` laskee `foodProteinTargetG = max(0, proteinG − supplementProteinG)` (`src/lib/adaptive.ts`). Ruoka-ui: `food.supplementProteinFromStack` jne. |
| **Suositukset** | `buildSupplementProductRecommendations` + `buildSupplementRecommendationInput` (`src/lib/supplements/recommendationEngine.ts`), `SupplementCoachRecommendations` Food-sivulla; mukana `coaching-engine` bundle. |
| **Monetization / slotit** | `FeaturedProductsStrip` + `FEATURED_PRODUCT_PLACEMENTS` (`src/lib/marketplace/featuredProducts.ts`, `src/components/marketplace/FeaturedProductsStrip.tsx`) — kumppanilinkit. |

**Huom:** Tämä on scope-vastine; uutta logiikkaa ei vaadittu tässä passissa jos rivit pitivät paikkansa.
