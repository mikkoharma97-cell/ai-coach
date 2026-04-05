# Stack ja build (snapshot)

**Lähde:** `package.json` (repo). Versiot voivat päivittyä — tarkista lähde.

## Nimi ja versio

- `name`: ai-coach  
- `version`: 1.0.3  
- `private`: true  

## Pääriippuvuudet

- `next`: 16.2.1  
- `react` / `react-dom`: 19.2.4  

## Keskeiset dev-työkalut

- TypeScript 5, ESLint 9, Tailwind 4 (`@tailwindcss/postcss`), Capacitor 7 (iOS), Playwright.

## Skriptit (lyhennetty luettelo)

| Skripti | Tarkoitus |
|---------|-----------|
| `dev` | Next dev |
| `dev:lan` | Dev LAN |
| `dev:mobile` / `mobile:dev` | Mobiilikehitys (node-skriptit) |
| `build` | `write-build-info` + `next build` |
| `start` | `next start` |
| `lint` | eslint |
| `cap:sync` / `cap:sync:prod` / `cap:sync:dev` | Capacitor / iOS |
| `native:ios` | sync + open Xcode |
| `testflight:prep` | prod sync + iOS release check + open |

Täydellinen lista: `package.json` → `scripts`.
