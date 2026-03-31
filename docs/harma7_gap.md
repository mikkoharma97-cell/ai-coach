# HÄRMÄ7 — gap fix (lähdeteksti)

Alkuperäinen lista (`harma7_gap.txt`):

- fix nav
- fix food add
- sync program + nutrition
- mobile polish

## Toteutus (tämä passi)

| Kohta | Muutos |
|-------|--------|
| **Nav** | `AppShell`: otsikko `/packages` → `packages.title` (ei väärää "Tänään"). Food-tab aktiivinen myös `/food-library` ja `/nutrition-plans`. |
| **Food add** | `FoodSheet` auki → `document.body.style.overflow = 'hidden'` (taustan scroll pois mobiilissa). |
| **Program + nutrition** | `applyProgramLibraryEntry` päivittää myös ruokakirjaston `recommendNutritionForProfile` + `applyNutritionLibraryEntry` (sama linja kuin uusi ohjelma). |
| **Mobile polish** | Scroll-lukko + nav-korjaukset (ei erillistä layout-refaktorointia). |
