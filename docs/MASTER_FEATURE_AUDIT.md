# MASTER FEATURE AUDIT

Päivitetty: 2026-04-04 — final product / mobile-ready pass (ai-coach).

## Miten testaan puhelimella (LAN)

1. **Sama Wi‑Fi** kuin kone (Mac + iPhone).
2. Projektijuuressa: `npm run dev:mobile`
3. Skripti sitoo `0.0.0.0`:ään ja asettaa `LAN_DEV_ORIGINS` (ks. `next.config.ts` → `allowedDevOrigins`).
4. **Jos portti 3000 on varattu**, skripti valitsee automaattisesti seuraavan vapaan portin ja tulostaa **LAN + localhost** oikealla portilla.
5. Avaa **Safarissa** tulostettu `http://<LAN-IP>:PORT` — ei pelkkä localhost puhelimesta.
6. IP puuttuu: `LAN_DEV_ORIGINS=192.168.x.x npm run dev:mobile`.

## Active product reality

| Alue | Reitti | Huomio |
|------|--------|--------|
| Juuri | `/` → `EntryGate` | Profiili → `/app`, muuten `/home` |
| **Landing** | `/home` | Hero (ei “Coach” pääotsikossa i18n:ssä) → vertailu → fake viikko → preview → feedback |
| Onboarding | `/start` | → `/app` |
| Coach shell | `(coach)/layout` | `SubscriptionGate` + `AppShell` |
| Today | `/app` | Primary: treeni → `/workout`; ruoka linkki |
| Treeni | `/workout` | `WorkoutSessionView` (aktiivinen); legacy: `WorkoutSession`/`WorkoutView` → `workout/README.md` |
| Paywall | `/paywall` | `PaywallV1Screen`; takaisin → `/settings` |
| Legacy | `PaywallScreen.tsx` | Ei reittejä; `paywall/README.md` |

## Tämän passin korjaukset

| Aihe | Mitä tehtiin |
|------|----------------|
| **Tuotanto / native pinta** | `RouteFlash` poistettu (ei välähdystä / hassuttelua) |
| **Build-merkki** | Kelluva `GlobalBuildMarker` vain `isAppShellRoute` (ei duplikaattia `/home` footerin kanssa); piilota `NEXT_PUBLIC_SHOW_BUILD_MARKER=0` |
| **Review panel** | `?review=1` ei tuotannossa ilman `NEXT_PUBLIC_COACH_DEV_TOOLS=1` |
| **Workout aktiivinen** | `src/components/workout/README.md` (polku vs legacy) |
| **Mobile native** | Blocker dokumentoitu `docs/mobile-build.md` (`CAPACITOR_SERVER_URL`) |
| *(aiemmat passit)* | `useClientMounted`, `--bottom-stack`, paywall README, jne. |

## Hydration — totuus

- Build-teksti: `buildInfo.generated.ts` (build-aika), ei `Date` renderissä markerissa.
- Pathname-sijainnit: mount-gate ennen shell/marketing -eroa.

## UI safety / overlap (tilanne)

- **Feedback FAB** käyttää `calc(var(--bottom-stack) + 12px)` (`FeedbackWidget`) — ei peitä navia; build-merkki vasemmalla, FAB oikealla.
- **Kelluva build** vain coach-shellissä — marketing-sivuilla footer-`BuildMarkerLine` tai ei merkkiä.

## Jäljellä olevat riskit (maanantai)

- **E2E / oikea laite** ei ajettu tässä työkalussa.
- **Preferences** voi olla pitkä lomake — ei tässä passissa lyhennetty syvästi.
- **Turbopack NFT** -varoitus `content/store` (ei build-blokki).

## Legacy / dead branches

| Kohde | Tila |
|-------|------|
| `PaywallScreen.tsx` | Ei importteja reitteihin |
| `WorkoutView` / `WorkoutSession` | Ei reitti-mounttia — `workout/README.md` |

## Flow sanity check

`/` → `/home` → `/start` → `/app` → `/workout`  
`/subscribe` · `/premium` → `/paywall`  
Gate → `/paywall` ilman tilausta; takaisin paywallista **settings**.

---

**Tuomio:** **HYVÄKSYTTY VARAUKSIN** — Prod/debug-pinta siivottu (kelluva build vain coach-shell, review tuotanto); Capacitor edellyttää `CAPACITOR_SERVER_URL` täyteen WebView-appiin; laite-QA ei tässä ajossa.
