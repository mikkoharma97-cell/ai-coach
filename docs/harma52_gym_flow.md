# HÄRMÄ52 — GYM FLOW

Lähde: ulkoinen muistiinpano `HARMA52_GYM_FLOW.txt` (tyhjä paitsi otsikko). Tämä dokumentti kuvaa **toteutuneen** sali-/treenipolun koodissa.

## Tavoite

- **Tämän päivän treeni** yhdessä näkymässä.
- **Yksi liike kerrallaan** (ei koko ohjelman listaa / roster-dump).
- **CTA:** sarjan merkintä (ensisijainen) + **seuraava liike** (kun seuraava liike on olemassa), nimellä.
- Lisä: tekniikka & video yhdessä taitoksessa; ääni / help / linkit erillisessä taitoksessa — vähemmän scrollia tekemisen aikana.

## Koodiviitteet

| Osio | Sijainti |
|------|-----------|
| Sivu | `src/app/(coach)/workout/page.tsx` |
| Profiili + generaatio | `WorkoutSession.tsx` → `generateWorkoutDay`, `mapProToView` |
| UI + tila | `WorkoutView.tsx` — `activeExerciseIndex`, `activeSetIndex`, `applyCommand`, voice |
| Liike + media | `ExerciseCoachTipsPanel`, `ExerciseMediaVideoSlot` (taitos «Tekniikka & video») |

## Poistettu / ei enää pääpolulla

- «Kaikki liikkeet» -rosteri (vaihto: modaalissa aktiiviselle liikkeelle).
- Pitkä päiväteksti (`generated.workout`) / brändi / runkoviiva treenin otsikossa.
- Progress-sivun ylimääräiset käyrät: ks. `ProgressPage` (yksi painokäyrä + tukiluvut).

## Versio

Tuoteversio ei sidota tähän numeroon — katso `src/config/version.ts` (esim. HÄRMÄ56+).
