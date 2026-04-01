# Master gap checklist (HÄRMÄ70)

Rehellinen tilannekuva reposta ja tuotteen vaatimuksista. Tilat: **valmis** · **osittain valmis** · **puuttuu** · **turha / poistettava** (ei arviota ellei mainittu).

---

## 1. Home / Start

| Vaatimus | Tila | Huomio |
|----------|------|--------|
| Ei liikaa tekstiä | osittain valmis | Landing / `start` on tarkoituksella tiivis; copy-audit erikseen |
| Vertailu PT vs tämä | valmis | `/compare` + `CompareContent` |
| Hero premium vs amatööri | osittain valmis | Visuaalinen taso vahva; subjektiivinen laatuarvio jättää käyttäjälle |

---

## 2. Today

| Vaatimus | Tila | Huomio |
|----------|------|--------|
| Energia ylhäällä | osittain valmis | “Rebuild energy” -otsikko + status; ei erillistä kcal-hero lukua kuten Foodissa |
| Päivän oletus heti alla | valmis | Pilarit (treeni / ruoka / askeleet) `TodayCard` |
| Yksi tehtävä | valmis | `DailyFocus` -ankkuri |
| Progressio käyrä | osittain valmis | Viikkopisteet (sparkline) + moottorivi; ei yhtä isoa “progressio”-käyrää kuin Progress-sivulla |
| Viime viikon parannus | osittain valmis | Reality/streak -blokit kun featuret päällä; ei erillistä “vs viime viikko” -lukua kaikille |
| Tämän viikon tavoite | valmis | Viikkonäkymä / Autopilot fold; `WeekProgress` näyttää viikon rakennetta |

---

## 3. Food

| Vaatimus | Tila | Huomio |
|----------|------|--------|
| Lisää ateria | valmis | `food.addMealHero` + sheet |
| Korvaa ateria | valmis | `MealSubstituteSheet` + yhteensopivuuslogiikka |
| Oma ateria | valmis | Custom override / add sheet |
| Makro “rinkula” (jako) | valmis | Tavoitejako `macroRatioBar(plan.todayMacros)`; ei toteuman rengasta |
| Massa / cut -logiikka | osittain valmis | `goal` + `generateFoodTargets` / rebalance; ei erillistä “bulk/cut” -tilaa UI:ssa |

---

## 4. Workout

| Vaatimus | Tila | Huomio |
|----------|------|--------|
| Mukauta treeni | valmis | Sheet + tilat |
| Exercise swap | valmis | `onSwapExercise`, katalogi |
| 30 min mode | valmis | `sessionMode === "quick"` (copy: 30 min) |
| No equipment | valmis | `no_equipment` |
| Ohjelman sisältö ennen vaihtoa | osittain valmis | Lista näkyy swap-modaalissa; käyttäjä voi avata swapin suoraan |

---

## 5. Programs

| Vaatimus | Tila | Huomio |
|----------|------|--------|
| Valittavat ohjelmat | valmis | `/plans`, kirjasto |
| Oikeat sisällöt | osittain valmis | Oma katalogi; jatkuva sisältöaudit erikseen |
| Food plans mukana | valmis | `/nutrition-plans` |
| Self coach -tila | osittain valmis | Dokumentoitu: `guided` / `pro` — ei erillistä “self coach” -merkintää (`docs/harma53_coach_mode.md`) |

---

## 6. Progress

| Vaatimus | Tila | Huomio |
|----------|------|--------|
| Pääkäyrä | valmis | Paino `WeightTrendCard`; kcal-trendi `MacroTrendCard` (jos piilotettu → riippuu featureista) |
| Weekly insight | osittain valmis | Hero insight / metrics; ei yhtä kiinteää “weekly insight” -korttia kaikille |
| First user sample | valmis | HÄRMÄ69 `FirstUserProgressPreview` + Food strip |
| Modified days huomioitu | osittain valmis | Rebalance / poikkeukset näkyvät suunnitelmassa ja Foodissa; Progress ei erittele “modified day” -sarjaa |

---

## 7. Navigation

| Vaatimus | Tila | Huomio |
|----------|------|--------|
| Tänään / Ruoka / Treeni / Kehitys / Lisää | osittain valmis | **Neljä** välilehteä: Tänään, Ruoka, Kehitys (`/progress`), Lisää. **Treeni ei ole oma tab** — linkki Todaysta ja `/workout` |
| Lisää ei roskakori | valmis | `/more` on hub |

---

## 8. Pro mode

| Vaatimus | Tila | Huomio |
|----------|------|--------|
| Turhat ohjepalkit pois | valmis | `getCoachFeatureToggles`: Pro → `showHelpVideos`, `showCoachLines` false |
| Vain oleellinen | osittain valmis | Pro näkymät edelleen rikkaat; hienosäätö copy/layout mahdollinen |

---

## 9. Mobile

| Vaatimus | Tila | Huomio |
|----------|------|--------|
| Modalit | valmis | `overlayStack` + `useOverlayLayer`, yksi overlay kerrallaan |
| Safe area | valmis | `env(safe-area-inset-*)`, `coach-page`, nav |
| CTA näkyy | osittain valmis | scrollIntoView / id:t; jatkuva QA |
| Bugittomat popupit | osittain valmis | Korjattu HÄRMÄ63+; regressio mahdollinen |

---

## 10. Version trust

| Vaatimus | Tila | Huomio |
|----------|------|--------|
| Build numero | valmis | `HARMÄ_BUILD` / `APP_VERSION` `src/config/version.ts` |
| Päivä & aika | valmis | `buildInfo.generated.ts`, `BUILD_DISPLAY_LINE` |
| Näkyy koneella ja mobiilissa | valmis | `PreviewBuildStrip` (preview), `BuildMarkerLine` / fingerprint `?ver=` |

---

## Yhteenveto prioriteeteista (ei toteutusta tässä)

1. **Nav-odotus:** dokumentoi että treeni on Today-polulla, ei bottom-tab.
2. **Progress:** “modified days” näkyvyys yhdessä näkymässä tai eksplisiittinen copy.
3. **Food macro rengas:** selitä käyttäjälle tavoite vs toteuma (`docs/data-audit.md`).
4. **WeekProgress:** i18n (nykyinen EN-kovakoodi).
