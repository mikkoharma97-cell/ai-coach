# HÄRMÄ60 — final check round (toteutusraportti)

Lähde: `HARMA60_FINAL_CHECK_ROUND.txt` (käyttäjän lataus).

## Toteutettu tässä buildissa

1. **Aloitus / landing** — Kaksipalstainen vertailu (ihminen vs sovellus), lyhyt disclaimer + credibility-rivi, sekundääri-CTA **Katso mitä tämä sisältää** → `/compare` (`LandingComparisonStrip`, `HeroSection`).
2. **Vertailusivu** — `/compare` kolmella osiolla: mitä henkilökohtainen valmennus tekee, mitä sovellus tekee, mihin perustuu (`CompareContent.tsx`).
3. **Navigaatio** — `SiteHeader`: linkki Vertailu / Compare; Tänään käyttää `nav.today`.
4. **Lisää-hub** — Ryhmittely: Valmennus → Käyttötila → Seuranta → Asetukset → Lisätyökalut (`MoreHubScreen`).
5. **Versio** — `APP_VERSION = HÄRMÄ60`, `HARMÄ_BUILD = 60`.

## Jäljellä / isompi erä (ei tässä diffissä)

- Sovelluslaajuinen helper/microcopy-passi (coach-sävy, ei “bot”/corporate).
- Progress-käyrä + makro “rengas” — auditointi Today/Progress.
- Ohjelman / ruokasuunnitelman vaihdon esikatselu (preview sheet).
- Aterian korvaus + liikkeen vaihto — käyttäytyminen; mahdollinen “Mukauta” -sheet.
- Smart training — yksi hillitty sisääntulo (swap / quick / no equipment).
- `/home`, `/app`, `/food`, `/workout`, `/progress` clutter-tarkistus.
- Myyntimuistiinpanot videoon — erillinen markkinointidokumentti tarvittaessa.

## QA

- Paikallinen smoke: `npm run build && npx next start -p 3020` → `BASE_URL=http://127.0.0.1:3020 npm run qa:routes` (mukana `/home`, `/compare`).
- Deployn jälkeen: `?ver=60` cache-tarkistus.

## Commit-viesti (ehdotus)

`HÄRMÄ60: compare page + landing strip, More hub sections, build 60`
