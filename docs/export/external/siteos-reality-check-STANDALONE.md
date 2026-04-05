# siteos-reality-check (standalone) — erillinen projekti

**Polku:** `/Users/mikkoharma/siteos-reality-check`  
**Huom:** `SITEOS/siteos-reality-check` voi olla erillinen kopio — tarkista kumpi on “source of truth”.

## Stack (package.json)

- Next `^14.2.18`, React `^18.3.1`, TypeScript `^5.6.3`
- Skriptit: `dev`, `build`, `start`, `lint`

## Reitit (`src/app/**/page.tsx`)

| Sivu |
|------|
| `/` (`app/page.tsx`) |
| `/plans` |
| `/settings` |
| `/more` |
| `/pro` |
| `/scan` |
| `/food-library` |
| `/review` |
| `/feedback-debug` |

## Rajoitteet tässä viennissä

- Ei `node_modules` -analyysiä, ei täyttä lähdekoodivientiä.
- Vertaa `ai-coach`-reitteihin: osa nimistä päällekkäisiä (plans, more, pro, scan) — eri tuote.
