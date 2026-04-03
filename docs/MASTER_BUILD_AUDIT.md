# MASTER BUILD — AI Coach (tilannekuva)

**Tarkoitus:** Yksi dokumentti, joka vastaa MASTER BUILD -listaa repoon. **Ei uusia featureita** tässä passissa — vain mitä on ja mitä on osin.

**Tuoteversio:** `src/config/version.ts` — `HÄRMÄ{n}` + `APP_VERSION` (ei erillistä “BUILD 1/2/3” -semveriä; semver on `package.json`).

---

## 1. Core principle

| Vaatimus | Status |
|----------|--------|
| Yksi selkeä tehtävä / päivä | **verified** — Today (`AppDashboard`, `TodayCard`, `generateDailyPlan` / `composeCoachDailyPlan`) |
| Ei dashboard-sekamelskaa | **verified** — yksi ankkuri / näkymä -periaate (`PROJECT_BRIEF`, UI) |
| AI ohjaa toimintaa | **verified** — `buildCoachAiEngineResult`, päätös + linjat |
| Mobiili, yksi käsi | **partial** — `AppShell`, safe area; laite-QA käyttäjällä |
| Tekstit = valmentaja | **partial** — `coachVoice.ts` + `i18n`; ei 100 % läpijuoksua |

---

## 2. Today engine

| Osio | Polku |
|------|--------|
| Päiväsuunnitelma | `dailyEngine.ts` → `adaptive.ts` → `CoachDailyPlan` |
| Poikkeus | `exceptionEngine`, `mergeExceptionIntoDailyPlan` |
| Päätös + hero | `aiDecisionEngine.ts`, `decisionEngineV2.ts` |

---

## 3. Program system

- **`PROGRAM_LIBRARY`:** **24** ohjelmaa (`coachProgramCatalog.ts`) — tavoite / taso / ympäristö -kentät kirjastoriveissä.
- Suositus + vaihto: `recommendProgramForProfile`, `applyProgramLibraryEntry`, `/start` `ProgramPicker`.
- Split: `splitRecommendationEngine.ts`, kirjasto-metadata (splitType jne.).

---

## 4. Training engine

- Generaattori: `training/generator.ts`, `trainingPrescriptionEngine.ts`, `exerciseClassification`, `intensifierRules`.
- Progression / deload: profiili + kirjasto (`types/progression`, policyt).
- Intensifier-rajoitukset: `intensifierRules.ts` (ei laajenna tässä dokumentissa).

---

## 5. Exercise rotation

- `exerciseRotationEngine.ts` — vaihtoehdot + pooli; täysi automaattinen 4–8 vk ei ole yksiselitteinen “timer” ilman erillistä suunnitelmaa → **partial**.

---

## 6. Nutrition

- Rakenteet: `nutritionBlueprints`, `mealEngine`, profiilin `mealStructure`.
- Vaihto: onboarding + preferenssit + nutrition blueprint -valinnat.

---

## 7. Food library

- **`FOOD_LIBRARY`:** **99** riviä (`foodLibrary.ts` + extrat) — haku + suodattimet `FoodLibrarySearch.tsx`.
- Näyttö: nimi, kcal, P, `whyFi/whyEn` kun määritelty.

---

## 8. Supplements

- Toggles + suositukset: `supplements/recommendationEngine`, `coachFeatureToggles`.
- Monetization (featured / affiliate / own brand): **partial / tuotepolitiikka**, ei täyttä kaupallista putkea koodissa.

---

## 9. Progress

- Yksi pääkäyrä -henki: `Progress`-näkymät, ei viisi charttia samaan ruutuun — **verified** linjassa tuotteen kanssa; tarkka UI vaihtelee.

---

## 10. Coach voice

- `coachVoice.ts` + `i18n.messages.ts` — kielletyt fraasit + säännöt.

---

## 11. Onboarding

- `StartFlow.tsx` — **11** kysymyskokonaisuutta (`QUESTION_TOTAL = 11`). MASTER-tavoite 5–6 askelta = **gap / tuotekehitys** (ei muutettu tässä passissa).

---

## 12. Paywall

- `PaywallScreen.tsx` — yksi premium-näkymä, ei useaa sekavaa polkua.

---

## 13. Growth

- Streak / comeback: osin `streaks`, `realityScore`, profiili.
- Referral / share: **planned** (`docs/harma9_growth.md`).

---

## 14. Notifications

- HÄRMÄ20: `reminderStorage`, `CoachReminderNotifications` — treeni / ruoka / päivä kesken, rajat.

---

## 15. Settings

- HÄRMÄ21: `/preferences` — tavoite, päivät, ruokarakenne, muistutukset; loput *Lisää asetuksia*.

---

## 16. Launch

- `/launch`, `/demo`, `EntryGate` → launch (`docs/harma14_launch.md`, `harma18_sales_demo.md`).

---

## 17. Analytics

- `analytics.ts` — `trackEvent`, lista tapahtumista (open_*, complete_day, log_* …). **Backend ei ole** — console + `sessionStorage`-jono.

---

## 18. QA

- `npm run qa:routes`, `docs/harma17_qa.md` — smoke; täysi manuaali laiteella → käyttäjä.

---

## 19. Versio

- `version.ts`: `APP_VERSION`, `HARMÄ_BUILD`, `COACH_RELEASE_LABEL`, `VersionBadge`.

---

## 20. Final rule

Tämä repo on **valmis tuotekehityksen** kannalta jatkuvasti päivittyvä; “ei demo” = copy + flow eivät ole pelkkä placeholder, vaan tuotteen oma ääni ja data.

**STOP:** Kun käyttö tuntuu valmentajalta ja näkymät toimivat ilman selitystä — tämä on **laatu- ja testauskysymys**, ei yksi commit.

---

## Seuraava vaihe (tuote, ei feature-lista)

Prioriteetit ja linja (“ei uusia featureita ennen onboarding + growth + analytics -minimi”): **`docs/PRODUCT_DIRECTION.md`**.
