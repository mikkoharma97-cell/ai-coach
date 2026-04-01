# Data-, makro- ja progressio-audit (HÄRMÄ68)

Tarkistus: missä data syntyy, miten se kulkee engine → UI:hin, ja missä näkymät käyttävät eri heuristiikkaa kuin päätason suunnitelma.

## 1. Yksi source of truth (pääpolku)

| Vaihe | Moduuli | Huomio |
|--------|---------|--------|
| Profiili + päivämäärä | `buildAdaptiveUserState` → `composeCoachDailyPlan` | `src/lib/adaptive.ts` |
| Päiväsuunnitelma (kcal, makrot, aktiviteettiteksti, viikko) | `generateDailyPlan` | `src/lib/dailyEngine.ts` |
| Poikkeus + minimipäivä | `buildCoachDailyPlanForSession` | kutsuu `mergeExceptionIntoDailyPlan`, `mergeMinimumDayIntoDailyPlan` |
| **Today / Food (pääkäyttö)** | `buildCoachDailyPlanForSession` | `AppDashboard.tsx`, `FoodScreen.tsx` |

**Suositus:** uudet näkymät käyttävät `plan`ia (`CoachDailyPlan`) sellaisenaan; vältä uusia `calorieTargetForUser`- tai `macrosFromBodyWeight`-kutsuja UI:ssa ilman että tulos vastaa samaa päivää kuin `plan`.

---

## 2. Osioittain

### Calorie target + protein target (päivän tavoite)

- **Lähde:** `composeCoachDailyPlan` → `generateFoodTargets` (`adaptive.ts`): paketti, rata, nutrition blueprint, rebalance, lisäliikebonus (`activityEnergyBonusKcal`) skaalaa makrot.
- **UI:** Food / Today näyttää `plan.todayCalories`, `plan.todayMacros`, `plan.foodProteinTargetG` (lisäravinteet vähentävät ruoan proteiinitarvetta).
- **Tila:** toimii yhtenäisesti kun näkymä lukee vain `plan`-objektia.

### Macro ring (Food — P/C/F -prosenttirivi)

- **Lähde:** `FoodScreen` laskee `ratio = macroRatioBar(plan.todayMacros)` — eli **tavoitejakautuma**, ei kulutusta.
- **Riski:** käyttäjä voi tulkita renkaan “täyttyneeksi”; se kuvaa tavoite-makrojen suhdetta, ei lokin toteumaa.
- **Tila:** toimii **suunnitellusti** (tavoite); jos halutaan “toteuma”, tarvitaan erillinen visualisointi lokista.

### Daily meal totals (lokin kcal vs tavoite)

- **Lähde:** `loadFoodLog` + summa `kcal`; tavoite `plan.todayCalories`.
- **Proteiinin “kulutus” Food-only / paneeleissa:** `estimateConsumedFromKcalLog(consumedKcal, plan.todayMacros)` — **heuristiikka**: jakaa lokin kcal:t tavoitemakrosuhteella (`src/lib/food/dayMacros.ts`).
- **Tila:** kcal on **tosi**; P/C/F kulutus on **mallinnettu**, ei kirjattujen makrojen summa (lokissa ei ole erillistä makroerittelyä joka aterialla).

### Weight trend

- **Lähde:** `loadWeightSeries` / `appendWeightLogEntry` — `localStorage` (`ai-coach-weight-series-v1`).
- **UI:** `WeightTrendCard`, Progress-hero.
- **Tila:** toimii erillisessä tallenteessa; ei synkassa `CoachDailyPlan`:in kanssa (tarkoituksella eri domain).

### Weekly progress chart (makrot / kcal)

- **Lähde:** `MacroTrendCard` → `loadMacroDays` → `loadFoodLog` per päivä (kcal), kaavio: kcal-pisteet.
- **Proteiini historiassa:** `macroAverages` käyttää **`macrosFromBodyWeight(answers, d.kcal).proteinG`** per päivä (`src/lib/progress.ts`).
- **Ero Food-päivänäkymään:** Food käyttää toteuman proteiinimallia tavoitejakautumalla (`estimateConsumedFromKcalLog` + `plan.todayMacros`); Progress-historia käyttää **painopohjaista makroa samalle kcal:lle** (`macrosFromBodyWeight`).
- **Tila:** **osittain yhtenäinen** — sama loki, eri proteiinimalli kuin “tämän päivän” Food-paneeli.

### Program progression (viikko / viesti)

- **Viikkonäkymä:** `WeekProgress` näyttää `plan.weeklyPlan.days` — T/R -palkit; teksti on **kovakoodattu englanniksi** (`WeekProgress.tsx`), ei i18n.
- **Progression copy:** `buildFullProgressionEngineResult` / coach engine — erillinen polku kuin pelkkä viikkolista.
- **Tila:** data tulee suunnitelmasta; **UI-laatu** (kieli, copy) ei ole täysin tuotteen i18n-taso.

### Activity target + step target

- **Teksti:** `todayActivityTask` / `generatePersonalizedPlan` + `activityProgressionEngine` (askeleet) — `adaptive.ts` / `plan.ts`.
- **Luku:** käyttäjä ei kirjaa askeleita numeroon suoraan planissa; Adjustments voi viitata askeleisiin erillisesti.
- **Lisäliike bonus kcal:** `activityEnergyBonusKcal` integroitu päivän kcal:hen `composeCoachDailyPlan`:ssa.
- **Tila:** **tavoiteteksti + bonus** tulevat enginestä; erilliset “steps”-lokit eivät ole samassa kuin ruokalogi.

---

## 3. Moodit

### A. Full Coach

- `buildCoachDailyPlanForSession` + `FoodScreen` / `AppDashboard`: sama `plan`.
- Progress / `generateDailyPlan` muualla: sama ydin, **mutta** makrohistorian proteiini heuristiikka poikkeaa (ks. yllä).

### B. Food Only

- `isFoodOnlyMode` — Today: `FoodOnlyTodayPanel`; kcal/proteiini rivit käyttävät `plan.todayCalories` / `estimateConsumedFromKcalLog`.
- **Tila:** linjassa päiväsuunnitelman kanssa; treeniä ei näytetä pääpolulla.

### C. Pro mode

- Treenin rakenne: `buildTodayWorkoutForUi` + `resolveProWorkoutStructureEligible`; Pro workspace / `buildStrengthRows` Progressissa erillisestä tallenteesta.
- **Tila:** Pro-treenidata on **osittain erillinen** (`proWorkspace`) vs päivän generaattori — ei välttämättä yksi yhteinen “progression graph”.

---

## 4. Tunnetut riskit / bugit (ei automaattista korjausta tässä passissa)

| Asia | Kuvaus |
|------|--------|
| Makro-renkaan merkitys | Näyttää tavoitejakautuman, ei kulutusta — mahdollinen väärinymmärrys. |
| Progress vs Food proteiini | `loadMacroDays` / `macroAverages` vs `estimateConsumedFromKcalLog` — eri mallit samasta lokista. |
| WeekProgress copy | Kiinteä EN-teksti. |
| `webDir out` / server | `composeCoachDailyPlan` rebalance käyttää `window` — server-renderöinti null / eri polku (jos joskus SSR). |

---

## 5. Substitute / swap / quick / no equipment

### Meal substitute

- `listSubstituteCandidates` + `isCompatibleSubstitution` pitää vaihtoehdot lähellä kcal/proteiinia (`mealSubstitute.ts`).
- Custom override tallentaa käyttäjän antamat kcal + `estimateProteinForSlot` kun lisätään omasta (`FoodScreen`).
- **Tila:** ei riko engine-tasoa; päivän **kokonaistavoite** pysyy `plan`:ssa, slot-kohtainen sisältö vaihtelee.

### Exercise swap

- `applyExerciseOverridesToProExercises` / `onSwapExercise` — päivittää profiilin overrideja; generaattori käyttää niitä seuraavalla kerralla.
- **Tila:** progression engine lukee logeja / tilaa erikseen; swap ei “rikko” matematiikkaa, mutta **viikon progression copy** ei välttämättä viittaa yksittäiseen swap-tapahtumaan.

### Quick mode & no equipment

- `WorkoutSessionSerializeMeta` tallentaa `sessionMode`, `completionType`, jne. (`workoutLogStorage.ts`).
- UI näyttää badgejä tilasta (`WorkoutView`).
- **Tila:** completion perustuu merkittyihin setteihin — ei erillistä “valehtelevaa” täyttöä tässä koodipolussa; meta tallentuu lokiin analyysiä varten.

---

## 6. Pakollinen yhteenveto

### Mikä toimii varmasti (yksi päivä, yksi plan)

- Päivän `todayCalories` / `todayMacros` / `foodProteinTargetG` kun näkymä käyttää `buildCoachDailyPlanForSession` tai `generateDailyPlan`-palautetta.
- Ruokalogin kcal-summa vs `plan.todayCalories`.
- Treenilokin serialisointi moodi-metadatalla.

### Mikä toimii osittain

- Makrohistoria Progressissa vs Foodin “toteuma-arvio” (eri proteiinimalli).
- Viikkonäkymä: data ok, esitys/kieli heikko.
- Pro vs guided: eri lähteet vahvuuksille.

### Mikä puuttuu / heikko

- Yhtenäinen “toteutuneet makrot” laskenta suoraan lokista (nyt kcal-only + mallit).
- i18n `WeekProgress`-teksteille.
- Yksi dokumentoitu kaavio siitä, miten macro ring ja kcal-täyttö eroavat toisistaan käyttäjälle.

### Mitä korjata ensin (prioriteetti)

1. **Selkeys UI:hin** tai tooltip: makrorengas = tavoitejako; kcal-rivi = toteuma.
2. **Yhtenäistä** Progressin `loadMacroDays` / `macroAverages` proteiinimalli joko `estimateConsumedFromKcalLog(dayKcal, thatDaysPlanMacros)` tai dokumentoi että käyrä on “painopohjainen malli”.
3. **WeekProgress** → i18n + laadukas copy.

---

## 7. Testaus

- Cache / build: `?ver=68` (tai uusin `HARMÄ_BUILD`).
