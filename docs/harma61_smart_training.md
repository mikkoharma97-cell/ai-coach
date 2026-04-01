# HÄRMÄ61 — Smart training (toteutus)

Lähde: `HARMA61_SMART_TRAINING_IMPLEMENTATION.txt`.

## Mitä tehtiin

1. **Yksi entry point** — `Mukauta treeni` → sheet: Vaihda liike / 30 min / Ei välineitä (+ palauta lista).
2. **Swap** — copy (“Sali täynnä…”, “Pidetään sama fokus”), valinta **Vain tälle treenille** (session) vs **Käytä jatkossa** (profiili `exerciseIdOverrides`).
3. **Quick (30 min)** — `pickQuickGymExercises` (`quickGymEngine.ts`): enintään 3 liikettä, compound-painotus.
4. **No equipment** — `mapExercisesToNoEquipment` (`noEquipmentFallback.ts`) + `swapProExerciseIdentityAllowAny` kun katalogin swap ei yhdistä.
5. **Session metadata** — `WorkoutSessionLog`: `sessionMode`, `usedExerciseSwaps`, `completionType`, `volumeModifier` (serialize `workoutLogStorage`).
6. **Luokitus** — quick käyttää `exerciseClassification` / `classifyExercise`; no equipment käyttää samaa + keskitetty mapping-taulukko.

## Myynti / video

- Tämä ei hajoa vaikka: sali on täynnä, aikaa on 30 minuuttia, et ole salilla.
- Pidä ohjelma. Mukauta päivä.

## Raportti (checklist)

| Kohta | Tila |
|-------|------|
| Mukauta treeni | Kyllä |
| Swap + scope | Session / profiili |
| Quick mode | Kyllä |
| No equipment | Kyllä (minimi mapping) |
| Metadata tallennus | `WorkoutSessionLog` / localStorage |
| Progressio | Ei nollaa ohjelmaa; vaihdot sallittujen katalogin kautta tai no-eq -mappi |
| HÄRMÄ61 | `version.ts` + build-fingerprint |

Testaa: `?ver=61` deployn jälkeen.
