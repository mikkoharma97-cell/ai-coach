# Feature audit — kokonaisuudet

**Näkyvä badge:** `HÄRMÄ5` (`VersionBadge` → `HARMÄ_BUILD`). Juokseva numero nousee jokaisen viimeistelypassin jälkeen. *(Dokumentissa viitattu “HÄRMÄ3 / kirjastovaihe” = tuotekehityksen milestone; ei sama kuin badge-numero.)*

Tilat: **verified** = toteutettu ja linjassa auditin kanssa · **partial** = osin · **planned** = suunniteltu · **missing** = ei toteutettu.

---

## A. Treeniohjelmat — totuus reposta (ei oletuksia)

### Presetit (`ProgramPresetId`, `src/lib/programPresets.ts`)

Olemassa olevat preset-avaimet: `beginner_foundation`, `fat_loss_rhythm`, `muscle_growth_structure`, `performance_block`, `home_consistency`, `busy_life_reset`, `pro_control`, `comeback_restart` (8 kpl). Jokainen mappaa `programBlueprintId` + `nutritionBlueprintId` + `programTrackId` + rationale-avain.

### Treenirungot (`ProgramBlueprintId`, `src/types/coach.ts`)

Tyypit: `steady_begin`, `base_strength`, `hypertrophy_4`, `hypertrophy_5`, `fat_loss_light`, `tight_block`, `shift_flex`, `pro_training`. Generaattori / paketit viittaavat näihin; kaikki eivät ole erillisenä “valittavana listana” UI:ssa vaan **moottorikerroksen** tunnisteita.

### Ohjelmakirjasto (käyttäjälle valittavat rivit)

- **Lähde:** `src/lib/coachProgramCatalog.ts` (`PROGRAM_LIBRARY`), uudelleenexport: `src/lib/programLibrary.ts`.
- **Määrä:** 14 kirjasto-ohjelmaa (tavoite × paikka × päivät suodatus), mm. `fat_loss_*`, `muscle_growth_*`, `hypertrophy_gym_split`, `beginner_foundation`, `comeback_restart`, `busy_life_reset`, `home_consistency`, `performance_block`, `pro_control` (Pro).
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
- **Määrä:** 8 rakennetta (mm. `easy_3_meals`, `normal_4_meals`, `performance_5_meals`, `busy_day_meals`, `shift_work_structure`, `social_flex_structure`, `high_protein_cut`, `muscle_gain_meal_flow`).
- **Valinta:** onboarding askel 10 (`NutritionStructurePicker`), myöhemmin **`/nutrition-plans`** vahvistusmodaalilla (`applyNutritionLibraryEntry` → `selectedNutritionLibraryId`, `nutritionBlueprintId`, `mealStructure`).
- **Engine fallback:** `recommendNutritionForProfile` / `resolveProgramFromProfile` jos kirjastoa ei ole valittu.

### Food Search Library

- **Lähde:** `src/lib/foodLibrary.ts` (ydin) + `src/lib/food/foodSearchExtra.ts`, yhdistetty `FOOD_LIBRARY`.
- **Seed-määrä:** **72** ruokariviä (27 ydin + 45 extra). Haku / suodattimet: `FoodLibrarySearch`, reitti `/food-library`.

---

## C. Taulukko — tilakatsaus

| Feature | Status | Tiedostot (pää) | Testipolku | Huomautukset |
|---------|--------|-------------------|------------|--------------|
| **Training Program Library** | verified | `coachProgramCatalog.ts`, `programLibrary.ts`, `types/programLibrary.ts` | `/start` askel 9, `/plans` | Suositus + vaihtoehdot; vahvistus ennen tallennusta |
| **Nutrition Library** | verified | `nutritionLibrary.ts`, `types/nutritionLibrary.ts` | `/start` askel 10, **`/nutrition-plans`** | Selaus + vaihto vahvistuksella |
| **Food Search Library** | verified | `foodLibrary.ts`, `food/foodSearchExtra.ts`, `FoodLibrarySearch` | `/food-library` | 72 seed-riviä |
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

## §15 Raportti (tämän audit-päivityksen vastaukset)

1. **Valittavissa olevat treeniohjelmat:** `PROGRAM_LIBRARY` 14 riviä — näkyvät onboardingissa ja `/plans` (suodatus tavoitteen mukaan).
2. **Valittavissa olevat ruokarakenteet:** `NUTRITION_LIBRARY` 8 riviä — onboarding + `/nutrition-plans`.
3. **Manuaalinen selaus:** Kyllä — `/plans`, `/nutrition-plans`, `/food-library`.
4. **Seed-ruokien määrä:** **72** (`FOOD_LIBRARY`).
5. **Badge:** Näkyy **HÄRMÄ5** (ei HÄRMÄ3; ks. alku).
6. **Ohjelman vaihto:** Kyllä — `/plans`, modaali, `saveProfile` + `applyProgramLibraryEntry`.
7. **Ruokarakenteen vaihto:** Kyllä — `/nutrition-plans`, modaali, `applyNutritionLibraryEntry`.
8. **Yhteinen profiilivalinta:** Kyllä — `selectedProgramLibraryId`, `forcedPresetId`, `selectedNutritionLibraryId`, blueprintit; `normalizeProfileForEngine` / generatorit lukevat profiilia.
9. **Mobiilitesti:** Kehittäjä-ympäristö: `npm run build` OK; **fyysistä puhelinta / live URL:ia ei ole tässä istunnossa ajettu** — lista poluista alla manuaaliseen testiin.
10. **Live URL:** Ei määritelty tässä ajossa (Vercel-projekti käyttäjällä).
11. **Future work:** Aggressiivisempi pre-start / paywall-copy erillisellä passilla; nutrition-plans suodattimet (ateriat/vuoro) tiivistettävissä; automated mobile E2E.
