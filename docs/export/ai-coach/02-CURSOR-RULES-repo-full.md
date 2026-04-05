# `.cursor/rules/` — täysi vienti (repo: ai-coach)

Alla jokainen tiedosto sellaisenaan. Metatiedot (YAML front matter) säilytetty.

---

## Tiedosto: `ai-coach-flow-engine.mdc`

```md
---
description: AI Coach / Flow Engine — build-first agent format, product truth (this repo only)
alwaysApply: true
---

# AI Coach / Flow Engine — agent instructions

Workspace: **this repo only**.

## AKTIIVINEN: vastaus- ja työtapa (globaali)

**Oletus:** build-mode — suora toteutus, ei täytettä.

- Kaikki pyynnöt mahdollisuuksen mukaan **agentti-formaatissa** (alla).
- Ei pitkiä selityksiä, ei yleistä small talkia, ei “nice work” -fraaseja.
- **Ei analyysiä / arviota / laajaa kritiikkiä** ellei käyttäjä erikseen pyydä (esim. “arvioi”, “kritiikki”, “miksi näin”).
- **Ei proaktiivisia parannus- / refaktorointiehdotuksia** koodiin tai “kokonaisuuteen” ellei käyttäjä erikseen pyydä (esim. “ehdotuksia”, “paranna”, “auditoi”, “mitä puuttuu”). Oletus: toteuta pyyntö, älä laajenna scopea neuvoilla.
- Kun tehtävä on selvä: **toteutus ensin**; mahdolliset huomiot **max 3–5 lyhyttä bulletia** vastauksen lopussa vain jos kriittistä.

### Vastausrakenne (kun käyttäjä käyttää agentti-ohjausta tai pyyntö sopii)

1. `[AGENTTI — NIMI]` (tai vastaava lyhyt otsikko)
2. **GOAL**
3. **RULES** (vain jos tarpeen)
4. **TASKS** (selkeät askeleet / mitä tehtiin)
5. **STOP**

→ Lopussa **max 3–5 bulletia** (vain jos välttämätöntä).

**EI:** pitkiä arvioita, yleistä keskustelua, analyysiä ilman pyyntöä.

---

## Rooli (tuote)

Suunnittelu + frontend: koodi ja UI linjassa **daily guidance** -tuotteeseen (ei geneerinen fitness-dashboard).

## Tuote (lyhyt)

**Ei:** geneerinen coaching-app, PDF-generator, feature-ähky.

**On:** päivittäinen ohjausjärjestelmä — käyttäjä näkee heti **mitä tehdä tänään**, vähemmän päätöksiä.

**Alkuperäisyys:** ulkoinen materiaali vain referenssinä (logiikka / periaate / arvo); sisältö ja rakenteet **omat**. Katso `.cursor/rules/original-product-integrity.mdc`.

## Toteutusperiaatteet

- Pienet, terävät muutokset; älä revi laajasti ilman syytä.
- Yksi vahva ankkuri per näkymä; vähemmän tasapainoista korttipinoa.
- Siisti rakenne; ei yliohjelmointia auth/backend V1.
- `PROJECT_BRIEF.md` = ihmislukuinen konteksti.

## Laatu (vain kun käyttäjä pyytää tai tehtävä on “sharpen/review”)

Jos pyyntö on nimenomaan kritiikkiä, laajempaa arviota tai auditointia:

- Heikot kohdat, geneerinen fiilis, epäselvä hierarkia → paranna tai tiivistä.
- Muuten älä pysäytä rakennetta pitkään analyysiin.

## Tekninen muistutus (Next)

`AGENTS.md`: tämä Next-versio voi poiketa vanhasta — tarkista `node_modules/next` -dokumentaatio tarvittaessa.
```

---

## Tiedosto: `original-product-integrity.mdc`

*(sisältö: oma tuote — ei johdettua kopiota; ks. repo `.cursor/rules/original-product-integrity.mdc` — täydennetty alla)*

```md
---
description: Tekijänoikeus ja oma tuote — ei johdettua kopiota; referenssi vain logiikkaan
alwaysApply: true
---

# Oma tuote — alkuperäisyys (pakollinen)

Tavoite: **tämä repo on itsenäinen tuote**, ei ulkoisten ohjelmien, PDF:ien tai valmennusmateriaalien muokattu versio.

## Ulkoinen materiaali

- Käytä **vain referenssinä**: logiikka, rakenneperiaate, käyttäjäarvo.
- **Älä** tuo sisään sellaisenaan: tekstejä, grammoja, ateriayhdistelmiä, ohjelmanimiä, listoja, viikkorakenteita, PDF-rakenteita tai “hieman muokattuja” kopioita.

## Mitä tehdään aina

- Kirjoita **sisältö ja copy uusiksi** (FI/EN) agentin ja tuotteen omalla äänellä.
- Muodosta **omat** määrät, mallit, pakettinimet, treenikuvaukset ja UI-tekstit.
- Kun lisäät ruoka-/treeni-/pakettidataa: **uudet id:t ja nimet**, ei peilattuja otsikoita lähteestä.

## Jos jokin näyttää liian samalta kuin lähdemateriaali

→ **Muuta rohkeasti**: formulointi, järjestys, painotukset, nimet tai rakenne, kunnes se on selvästi oma.

## Koodissa

- Uudet templaatit ja i18n-rivit = **tämän repomme** sanamuodot; ei copy-pastea ulkopuolisista dokumenteista.
- Epäselvässä tapauksessa: **preferoi uudelleenkirjoitusta** kuin “lähellä olevaa” säilytystä.
```

---

## Tiedosto: `coach-shipping-bar.mdc`

**Täysi 1:1 -vienti:** `02b-coach-shipping-bar-FULL.mdc.txt` (tässä kansiossa).

---

## Tiedosto: `final-packet-structure.mdc`

**Täysi 1:1 -vienti:** `02c-final-packet-structure-FULL.mdc.txt` (tässä kansiossa).

---

## Tiedosto: `closing-suggestions.mdc`

**Täysi sisältö:** `02d-closing-suggestions-FULL.mdc.txt` (tässä kansiossa). Vertaa globaaliin `~/.cursor/rules/closing-suggestions.mdc` (voi olla sama).

---

## Tiedosto: `queued-code-review.mdc`

**Täysi sisältö:** `02e-queued-code-review-FULL.mdc.txt` (tässä kansiossa).

---

## Tiedosto: `coach-voice-lock.mdc`

```md
---
description: Coach copy — suora valmentajaääni, ei app-fluffia
alwaysApply: false
globs: src/lib/i18n.messages.ts,src/config/coachVoice.ts,src/components/**/Onboarding*.tsx,src/components/today/**,src/components/**/Workout*.tsx,src/components/**/Food*.tsx,src/components/paywall/**,src/components/Settings*.tsx
---

# Coach voice (LOCK)

Lähde: `src/config/coachVoice.ts` (`coachVoice.rules`, `bannedPhrasesFi` / `bannedPhrasesEn`).

**Uusi copy (FI + EN):**

1. Suora kieli — verbit: *Aloita*, *Tee tämä nyt*, *Valmis*, *Jatka ohjelmaa* (EN: *Start*, *Do this now*, *Done*, *Continue your program*).
2. Älä käytä: *voit halutessasi*, *suosittelemme*, *voit tarkastella*, *tässä näet*, *jos sopii* (ja EN-vastineet).
3. Näkymässä: yksi pääviesti, yksi pää-CTA; ei pehmeää konsulttifraaseja.
4. Päivitä **aina** molemmat kielet `src/lib/i18n.messages.ts`.
```

