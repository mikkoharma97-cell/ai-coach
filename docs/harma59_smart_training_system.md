# HÄRMÄ59 — SMART TRAINING SYSTEM

Lähde: `HARMA59_SMART_TRAINING_SYSTEM.txt` (Cursor-spesifikaatio).

## Tavoite (tuote)

Kolme hyödyllistä tilannetta **saman ohjelman sisällä**, ilman gimmickiä:

1. **Auto swap** — ei voi tehdä suunniteltua liikettä → vastaava korvaus (esim. sali täynnä).
2. **Quick gym (~30 min)** — lyhyempi versio samasta päivästä: tärkeimmät liikkeet, vähemmän tilavuutta.
3. **No equipment fallback** — ei salia / ei välineitä → kevyt kotiversio, sama päivän tarkoitus.

**Kriittinen sääntö:** päivän / viikon runko ei hajoaa; ohjelmaa ei vaihdeta; completion ja progressio pysyvät hallittuina.

---

## Nykyinen toteutus (repo)

| Vaatimus | Tila | Koodi |
|----------|------|--------|
| Liikevaihto katalogin säännöillä | **Osittain** | `getSwapTargetsForExercise` (`src/lib/training/exerciseOverrides.ts`) — sama `category`, katalogin `alternatives`. |
| UI: vaihto modaalissa | **Kyllä** | `WorkoutView` + `MealSubstituteSheet` (treeniliike), `saveProfile` `exerciseIdOverrides`. |
| Liikeluokitus (pattern, modality, …) | **Kyllä** | `src/lib/exerciseClassification.ts`, `types/exerciseClassification.ts` — käytössä mm. `trainingPrescriptionEngine`. |
| 30 min quick mode | **Ei** | Ei `quickGymEngine` / generaattorin karsintaa. |
| No equipment fallback -moottori | **Ei** | Ei `noEquipmentFallbackEngine` / päivän uudelleengenerointia. |
| Yksi “Mukauta treeni” -alue | **Ei** | Ei koottua action sheetiä; vain swap-moduuli. |
| “Käytä jatkossakin” swapille | **Osittain** | `exerciseIdOverrides` profiilissa = pysyvä; erillistä “vain tämä treeni” -tilaa ei eroteltu. |

---

## Tavoitearkkitehtuuri (spesistä)

Spesifi ehdottaa erillisiä moduuleja:

- `exerciseSwapEngine` — voidaan keskittää logiikka, joka nyt on `exerciseOverrides` + katalogi.
- `quickGymEngine` — valitsee 3–4 liikettä samasta päivän teemasta (prioriteetti: compound / progression).
- `noEquipmentFallbackEngine` — mappaa väline → kehonpaino / kuminauha, säilyttää lihasryhmä & päivän intent.

Nämä on dokumentoitu tähän; **täysi toteutus on erillinen kehityserä** (generaattori + `generateWorkoutDay` + session state).

---

## Copy (valmentajaääni) — talletettu spesissä

- Auto swap: *«Sali täynnä? Vaihdetaan fiksusti.»*
- Quick mode: *«Aikaa vähän? Pidetään tärkein.»*
- No equipment: *«Ei välineitä? Tehdään silti jotain hyödyllistä.»*

---

## Progressio (säännöt)

- Swap: progressio jatkuu **valitulla liikkeellä** (`swapProExerciseIdentity` säilyttää sarjat/toistot-rakenteen).
- Quick / no equipment: spesissä: completion kyllä, tilavuus / voimapainotus maltillisemmin — vaatii **lokituksen** (esim. `workoutSession` metadata: `mode: quick | full | bodyweight_fallback`).

---

## Versio

Julkaisumerkintä: **`src/config/version.ts`** — `HÄRMÄ59` (katso `APP_VERSION` / `HARMÄ_BUILD`).

---

## Raportti (tämän commitin kattama)

1. **Auto swap:** Toimii katalogin kautta + modaali; “sali täynnä” = sama polku kuin “Korvaa liike”, ei erillistä kopiota vielä.
2. **30 min mode:** Ei toteutettu moottorina.
3. **No equipment fallback:** Ei toteutettu moottorina.
4. **Tallennus:** Liikevaihto → `exerciseIdOverrides` profiilissa (`storage`).
5. **Progressio:** Nykyinen swap ei riko preset-logiikkaa; quick/fallback vaativat laajennuksen.
6. **Build:** HÄRMÄ59 — `BUILD_DATE` / `BUILD_TIME` tulevat `buildInfo.generated.ts` (ei käsin `version.ts`:ssä).
7. **Live URL:** Käyttäjä testaa oman Vercel-domainin (`/home?ver=59`).
