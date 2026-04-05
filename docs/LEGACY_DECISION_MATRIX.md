# Legacy decision matrix

## Tarkoitus / scope

Yksi päätöspohja: **mitä pidetään**, **mitä siivotaan myöhemmin**, **mitä voidaan tuoda takaisin eri muodossa**. Ei repo-historiaa eikä täydellistä inventaariota — vain kohteet, jotka toistuvasti sekoittavat suunnan tai git-palautuksia.

Päivitä tätä, kun jokin legacy-kohde **oikeasti** muuttuu (mount, redirect, poisto).

---

## Päätöskategoriat

| Kategoria | Merkitys |
|-----------|----------|
| **KEEP** | Aktiivinen toteutus tai aktiivinen suunta. Ei kosketa ilman hyvää syytä. |
| **DELETE LATER** | Legacy, stub, kuollut polku, vanha UI. Ei aktiivinen; poistetaan myöhemmin kun regressioriski on hallittu. |
| **REVISIT** | Idea voi olla oikea; nykyinen toteutus ei ole pääpolulla / ei sovi nyt. Voidaan rakentaa uudelleen eri muodossa. |

**Reason / Why** — sarakkeessa lyhyt peruste (tuote, tekninen, tai molemmat).

---

## Active Product Truth

Nykyinen “mitä käyttäjä kohtaa” -ankkuri (2026):

- **Today** (`TodayView` + liittyvät kortit) = päivittäinen ohjauspinta.
- **WorkoutSessionView** (`/workout`) = aktiivinen treenin suoritusnäkymä.
- **FoodScreenSimple** (`/food`) = aktiivinen ruoka-pinta; täysi `FoodScreen` ei ole pääpolulla.
- **Packages** (`CoachingPackagesView` + `coachOffer`) + **Program** (`/program`) = tarjonta / ohjelmapuolen nykyinen suunta.
- **Paywall V1** (`PaywallV1Screen` / `PaywallV1Panel`, `paywallPolicy.ts`, `/paywall`) = aktiivinen maksuseinä.
- **AppShell** + coach **template** (`(coach)/template.tsx`) = aktiivinen coach-navigaatiokuori.
- **Subscription / gate**: `subscription.ts` + `SubscriptionGate`; kokeilu ja mock-tila ovat edelleen tuotteen testauksen ytimessä.

Ilman tätä osiota legacy-matriisi jää irtonaiseksi dokumentiksi ilman tuotteen ankkuria.

---

## Matriisi (tärkeimmät kohteet)

| Kohde | Päätös | Reason / Why |
|-------|--------|--------------|
| **RouteFlash** | **DELETE LATER** *(jo poistettu koodista)* | Ei enää koodipolussa; auditit (`COACH_RESET_AUDIT`, `MASTER_FEATURE_AUDIT`) dokumentoivat poiston. **Älä palauta** keinotekoisena “dev flashina” tuotantopintaan. |
| **PreviewBuildStrip** | **DELETE LATER** | `PreviewBuildStrip.tsx` palauttaa `null`; export “yhteensopivuutta” varten. Poista tiedosto / importit kun turvallista. |
| **GlobalDevOverlay** | **DELETE LATER** | Sama kuin yllä — stub `null`. |
| **Build / version -juonet muualla** (esim. `BuildMarkerLine`, `ForceRefreshGuard`, `HomeCheckButton`) | **KEEP** | Juuri näitä käytetään kehityksen / preview-buildin hallintaan; erottele tuotannon pinnasta konfiguraatiolla, älä sekoita vanhaan “strip everywhere” -malliin. |
| **CacheBypassEffect** (`layout.tsx`) | **KEEP** | `?ver=` → SW-cache tyhjennys kerran sessiossa; ei UI:ta, aktiivinen käyttäytyminen. |
| **`/subscribe` ja `/premium`** | **KEEP** | `next.config.ts` redirect → `/paywall`. Ei erillisiä sivuja; yksi maksuseinä-URL. |
| **legacy `PaywallScreen`** (`paywall/legacy/`) | **DELETE LATER** | Ei mountattu reiteistä; aktiivinen totuus kommentissa tiedostossa + `paywall/README.md`. |
| **`WorkoutSession` + `WorkoutView`** | **DELETE LATER** | Ei reitti-mounttia; aktiivinen näkymä `WorkoutSessionView`. `workoutLogStorage` / lokit jaettuja — älä sekoita UI-pinon palauttamiseen. |
| **harma52 gym flow -linja** (vanha “gym” -ketju `WorkoutSession`-pinoon) | **REVISIT** | Dokumentaatio (`docs/harma52_gym_flow.md` jne.) kuvaa vanhaa suuntaa; nykyinen tuote ei aja sitä pinoa. Uusi gym-UX = erillinen tuotepäätös, ei git-blind restore. |
| **`FoodScreen` (täysi)** vs **`FoodScreenSimple`** | **KEEP** Simple / **DELETE LATER tai REVISIT** full | `food/page.tsx` → `FoodScreenSimple`. Täysi ruutu kommentoitu referenssiksi — palauta vain jos päivittäinen ohjaus -tuote oikeasti kaipaa syvää ruokalogia. |
| **`ProgramPackageCards`** | **DELETE LATER** | Kommentti: legacy list UI; `/packages` käyttää `CoachingPackagesView`. |
| **`scripts/dev-mobile.mjs`** (`npm run dev:mobile`) | **DELETE LATER** | Tiedostossa `@deprecated` — tuettu polku `npm run mobile:dev` (`mobile-dev.mjs`). |
| **Legacy trial JSON** (`subscription.ts`, `ai-coach-subscription-v1`) | **KEEP** | Aktiivinen yhteensopivuus / mock; ei “vanha roska” jota voi poistaa ilman migraatiota. |
| **Vanhat alias-polku** (`generateWorkoutDay`, `generateMealPlan`, `trainingIntelligence` silta) | **DELETE LATER** | Merkitty `@deprecated` — siivoa importit ajan kanssa; uusi koodi käyttää suoria moduuleja. |
| **`CoachMessageContext` vs vanha coachMessage-API** | **REVISIT** / **DELETE LATER** | `coachMessage.ts`: osa merkitty deprecated suhteessa `CoachMessageContext`iin — älä laajenna vanhaa pintaa; uusi kehitys kontekstin kautta. |
| **`config/version.ts` vanha export** | **DELETE LATER** | `APP_VERSION` / build-fingerprint korvasi; poista käyttämättömät viittaukset kun selvä. |

**Epäselvä?** Jos rivi ei pidä paikkaansa käytännössä, korjaa taulukkoa — älä tee päätöksiä pelkän tämän dokumentin varassa ilman nopeaa kooditarkistusta.

---

## Mitä EI pidä palauttaa vahingossa

- **RouteFlash**-tyyppinen välähdys / hassuttelu tuotantopinnassa.
- **Vanha workout-pino** (`WorkoutSession`/`WorkoutView`) pääpolulle ilman eksplisiittistä tuotepäätöstä ja migraatiota lokidataan.
- **Täysi `FoodScreen`** “koska se oli kerran” — päivittäinen ohjaus voi säilyä kevyenä.
- **Preview/dev stripit** näkyviin laajasti tuotannossa (stubit ovat jo pois; älä rakenta uutta samaa virhettä).
- **`PaywallScreen` rinnalle** Paywall V1:n — kaksi totuutta, kaksi analytiikkaa.
- **Erilliset `/subscribe` / `/premium` -sivut** redirectin sijaan — yksi funnel `/paywall`iin ellei maksujärjestelmä muuta.
- **Dashboard- tai roster-ajattelu** (“kaikki liikkeet kerralla”) ilman daily guidance -ankkuria.

---

## Mitä voidaan harkita myöhemmin (eri muodossa)

- **Gym / väline / swap -syvyys** — mahdollisesti uudelleen, mutta ei vanhan pinon kopiona.
- **Rikas ruokalogi** — jos data ja UX tukevat päivittäistä ohjausta ilman hallinnan määrää.
- **Pakettikorttien vaihtoehtoinen layout** — `ProgramPackageCards`-tyyppinen lista voi inspiroida, mutta toteutus uusista komponenteista.

---

## Do Not Resurrect Blindly

Älä palauta gitistä tai kopioi takaisin ilman tuotteen päätöstä:

1. Vanha dashboard / “kaikki kerralla” -treeninäkymä pääpolulle.
2. `WorkoutSession` + `WorkoutView` -stack reitille.
3. Täysi `FoodScreen` oletuspinnaksi.
4. Vanhat build/dev -stripit näkyviin tuotantokäyttäjälle.
5. `PaywallScreen` rinnakkain Paywall V1:n kanssa.
6. Satunnainen vanha premium/subscribe-sivu sen sijaan että redirect + yksi paywall.
7. `RouteFlash` tai vastaava keinotekoinen navigointi-efekti.
8. **dev-mobile.mjs** “koska se toimi kerran” — käytä dokumentoitua `mobile:dev` -polkua.

---

## Viitteet (ei lue kaikkea joka passissa)

- `docs/COACH_RESET_AUDIT.md`, `docs/MASTER_FEATURE_AUDIT.md`
- `src/components/workout/README.md`, `src/components/paywall/README.md`
- `next.config.ts` (redirectit)
