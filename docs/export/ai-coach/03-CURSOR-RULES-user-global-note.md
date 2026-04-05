# Käyttäjätason Cursor-säännöt (`~/.cursor/rules/`)

Cursor voi yhdistää **työtilan** säännöt (`.cursor/rules/` repossa) ja **käyttäjäkohtaiset** säännöt kotihakemistossa.

## Tämän vientipaketin kattavuus

- **Repo:** kaikki `ai-coach/.cursor/rules/*.mdc` on viety tiedostoihin `02*.mdc.txt` ja osin `02-CURSOR-RULES-repo-full.md`.
- **Globaali:** tarkistettiin `~/.cursor/rules/closing-suggestions.mdc` — sisältö vastaa repossa olevaa `closing-suggestions.mdc` -tiedostoa (sama lopetuslogiikka).

## Jos haluat täyden globaalin snapshotin

Kopioi manuaalisesti kansio:

`~/.cursor/rules/`

…tähän vientiin esim. `docs/export/cursor-user-rules-snapshot/` tai zipitä erikseen. En voi taata että kaikki globaalit säännöt näkyvät Cursorissa identtisesti eri koneilla.

## Codex / muut agentit

Repossa viitataan joskus `CLAUDE.md` → `@AGENTS.md`. Lisäksi käyttäjällä voi olla Codex-skillejä `~/.codex/skills/` — ne eivät ole osa tätä repoa.
