# Feature audit — kokonaisuudet

**Näkyvä badge:** `HÄRMÄ3` (`VersionBadge` → `HARMÄ_BUILD`). Numero nousee ison data-/viimeistelypassin mukaan (ei joka commit).

Tilat: **verified** = toteutettu ja linjassa auditin kanssa · **partial** = osin · **planned** = suunniteltu · **missing** = ei toteutettu.

### Kirjastot — lyhyt status

| Osa | Status | Huomio |
|-----|--------|--------|
| **Program Library** | verified | `PROGRAM_LIBRARY` 21 riviä, suodatus + suositus |
| **Nutrition Library** | verified | `NUTRITION_LIBRARY` 21 rakennetta |
| **Food Library** | verified | `FOOD_LIBRARY` 99 ruokariviä (ydin + extra + batch2) |
| **Food Search** | verified | `FoodLibrarySearch` — haku, tavoite, slotit, tag-filtterit |
| **Program Picker** | verified | Onboarding `/start` + `/plans` (suositus + vaihtoehdot) |
| **Nutrition Picker** | verified | Onboarding + `/nutrition-plans` |

---

## A. Treeniohjelmat — totuus reposta (ei oletuksia)

### Presetit (`ProgramPresetId`, `src/lib/programPresets.ts`)

Olemassa olevat preset-avaimet: `beginner_foundation`, `fat_loss_rhythm`, `muscle_growth_structure`, `performance_block`, `home_consistency`, `busy_life_reset`, `pro_control`, `comeback_restart` (8 kpl). Jokainen mappaa `programBlueprintId` + `nutritionBlueprintId` + `programTrackId` + rationale-avain.

### Treenirungot (`ProgramBlueprintId`, `src/types/coach.ts`)

Tyypit: `steady_begin`, `base_strength`, `hypertrophy_4`, `hypertrophy_5`, `fat_loss_light`, `tight_block`, `shift_flex`, `pro_training`. Generaattori / paketit viittaavat näihin; kaikki eivät ole erillisenä “valittavana listana” UI:ssa vaan **moottorikerroksen** tunnisteita.

### Ohjelmakirjasto (käyttäjälle valittavat rivit)

- **Lähde:** `src/lib/coachProgramCatalog.ts` (`PROGRAM_LIBRARY`), uudelleenexport: `src/lib/programLibrary.ts`.
- **Määrä:** **21** kirjasto-ohjelmaa (tavoite × paikka × taso × päivät suodatus), mm. `fat_loss_rhythm_light`, `fat_loss_busy_3`, `fat_loss_gym_4`, `fat_loss_home_3`, `muscle_growth_*`, `hypertrophy_gym_split`, `beginner_foundation_*`, `comeback_restart`, `busy_life_reset`, `home_consistency`, `performance_block_*`, `pro_control`, `athletic_mixed`.
- **Valinta:** onboarding askel 9 (`ProgramPicker`), myöhemmin `/plans` vahvistusmodaalilla (`applyProgramLibraryEntry` → `forcedPresetId`, `selectedProgramLibraryId`, `selectedPackageId`, `programTrackId`).
- **Engine fallback:** jos `forcedPresetId` / kirjastovalinta puuttuu → `resolveProgramPresetId` (`programPresets.ts`) päättää presetin profiilista.

---

## B. Ruokarakenne / nutrition — totuus reposta

### Nutrition blueprintit (`NutritionBlueprintId`, `src/types/coach.ts`)

`easy_daily`, `steady_meals`, `muscle_fuel`, `light_cut_meal`, `train_vs_rest`, `shift_clock`, `event_balance`, `pro_nutrition` — **moottorin** ruokarunkoja; osa tulee presetistä / paketista, osa kirjastosta.

### Ateriarakenne (UI + profiili)

`MealStructurePreference`: `three_meals`, `lighter_evening`, `snack_forward` (`src/types/coach.ts`). Kirjasto voi kirjoittaa näitä `applyNutritionLibraryEntry`:lla.

### Ruokarakenteiden kirjasto (käyttäjälle valittavat rivit)

- **Lähde:** `src/lib/nutritionLibrary.ts` (`NUTRITION_LIBRARY`), tyypit `src/types/nutritionLibrary.ts`.
- **Määrä:** **21** rakennetta (mm. `easy_3_meals_cut` / `_growth`, `normal_4_meals_*`, `performance_5_meals`, `busy_day_meals_*`, `shift_work_structure_*`, `social_flex_*`, `high_protein_*`, `recovery_day_light`, `weekend_flexible`).
- **Valinta:** onboarding askel 10 (`NutritionStructurePicker`), myöhemmin **`/nutrition-plans`** vahvistusmodaalilla (`applyNutritionLibraryEntry` → `selectedNutritionLibraryId`, `nutritionBlueprintId`, `mealStructure`).
- **Engine fallback:** `recommendNutritionForProfile` / `resolveProgramFromProfile` jos kirjastoa ei ole valittu.

### Food Search Library

- **Lähde:** `src/lib/foodLibrary.ts` — `FOOD_LIBRARY_CORE` + `foodSearchExtra` + `foodSearchExtraBatch2`.
- **Seed-määrä:** **99** ruokariviä. Haku / suodattimet: `FoodLibrarySearch`, reitti `/food-library` (tai food-sivun osio).

---

## C. Taulukko — tilakatsaus

| Feature | Status | Tiedostot (pää) | Testipolku | Huomautukset |
|---------|--------|-------------------|------------|--------------|
| **Training Program Library** | verified | `coachProgramCatalog.ts`, `programLibrary.ts`, `types/programLibrary.ts` | `/start` askel 9, `/plans` | Suositus + vaihtoehdot; vahvistus ennen tallennusta |
| **Nutrition Library** | verified | `nutritionLibrary.ts`, `types/nutritionLibrary.ts` | `/start` askel 10, **`/nutrition-plans`** | Selaus + vaihto vahvistuksella |
| **Food Search Library** | verified | `foodLibrary.ts`, `foodSearchExtra*`, `FoodLibrarySearch` | `/food-library` | 99 seed-riviä |
| **Onboarding goal-first** | verified | `StartFlow.tsx` | `/start` | Tavoite → … → ohjelma → ruokarakenne |
| **Profile → engine** | partial | `profileNormalizer`, `programPresets`, `dailyEngine` | `/app` | Manuaalinen kirjasto ohittaa automaatin kun asetettu |
| **Today / Food näyttö** | verified | `AppDashboard`, `TodayCard`, `FoodScreen` | `/app`, `/food` | `librarySelectionLine` tms. (ohjelma + ruoka) kun profiilissa |
| **Workout** | verified | `WorkoutSession`, `WorkoutView` | `/workout` | Paketti + blueprint generatorilta |
| **Review** | verified | `WeeklyReviewScreen` | `/review` | Viikkopalaute |

---

## P0 — interaktio / overlay (tarkistuslista)

- Modaalit: ohjelma- ja ruokavaihdon vahvistus `/plans` ja `/nutrition-plans` (z-index 200).
- **Jatkossa:** ESC / backdrop-yhtenäisyys kaikille modaaleille.

## Navigaatio — ydin + kirjastot

| Reitti | Rooli |
|--------|--------|
| `/app`, `/food`, `/workout`, `/progress`, `/review` | Pääpolku |
| `/plans` | Treeniohjelmakirjasto |
| **`/nutrition-plans`** | Ruokarakenteiden kirjasto |
| `/food-library` | Ruokahaku |
| `/start`, `/adjustments`, `/paywall` | Aloitus / poikkeukset / tilaus |

## Future work

- Täysi copy-pass “cool coach”.
- Stripe / pilvi-sync.
- Automaattinen E2E-mobiilitesti CI:ssä (nyt manuaalinen checklist).

## Linkit

- `docs/product-audit.md`
- `PROJECT_BRIEF.md` (jos olemassa)

---

## §15 / §16 Raportti (päivitys)

1. **Treeniohjelmia kirjastossa:** 21 (`PROGRAM_LIBRARY`).
2. **Ruokarakenteita kirjastossa:** 21 (`NUTRITION_LIBRARY`).
3. **Ruokia food libraryssä:** 99 (`FOOD_LIBRARY`).
4. **Ohjelman valinta:** `/start` askel (Program Picker) + `/plans` (vahvistusmodaali).
5. **Ruokarakenteen valinta:** `/start` + `/nutrition-plans` (modaali).
6. **Ohjelmien selaus myöhemmin:** `/plans`.
7. **Ruokien selaus myöhemmin:** `/food-library` (haku + filtterit).
8. **HÄRMÄ3:** Kyllä — `VersionBadge` / `HARMÄ_BUILD = 3`.
9. **Mobiilitesti:** `npm run build` ajettu; fyysinen laite / live smoke ei tässä ympäristössä.
10. **Live URL:** Ei sidottu tähän repoon (Vercel käyttäjän projekti).
11. **Future work:** Suosikit ruokahakuun; “lisää päivän valintoihin” -CTA toteutus; ESC/backdrop kaikille modaaleille; CI-mobiili-E2E.
