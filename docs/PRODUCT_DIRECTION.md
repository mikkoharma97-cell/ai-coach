# Tuotteen suunta — “rakennetaan tuotetta”, ei ominaisuuslistaa

**Tila (stop & map):** `docs/MASTER_BUILD_AUDIT.md` · **Versio:** `src/config/version.ts` (`HÄRMÄ` / `APP_VERSION`).

---

## Päätelmä

Tuote ei ole keskeneräinen **featureiden määrän** takia. Core on kunnossa (Today, ohjelmat, ruokakirjasto, maksut, muistutukset; data 24 / 99 riittää MVP+:lle).

Keskeneräisyys on **kokemuksen ja kasvun** takia:

| Havainto | Tyyppi |
|----------|--------|
| Onboarding **11** askelta vs tavoite **5–6** | **Flow** — suurin yksittäinen konversio-este |
| Referral / share puuttuu | **Growth** — ilman tätä ei skaalausta |
| Analytics ohut (console + jono) | **Mittaus** — ilman tätä ei tiedetä mikä toimii |

---

## Seuraavat prioriteetit (järjestys)

1. **Onboarding** — lyhennä **11 → 5–6** askelta (yksi selkeä polku: tavoite → ohjelma → valmis).
2. **Growth** — **yksi** selkeä referral/share -flow (planned → toteutus).
3. **Analytics** — minimi: **activation** + **retention** (mitä tapahtuu onboardingin jälkeen, paluu).

---

## Linja (pakollinen kunnes yllä on kunnossa)

- **Ei uusia featureita** (lisää ohjelmia, sisältöä, näkymiä) ennen kuin onboarding + growth + analytics -minimi on kunnossa.
- Poikkeus vain kriittinen bugi / turvallisuus.

**CoachVoice** (`src/config/coachVoice.ts`): koskee **koko flow’ta** (onboarding, paywall, launch, asetukset, Today) — ei vain yksittäisiä lauseita; toteutus `i18n.messages.ts` + komponentit.

---

## Viite

- Audit: `MASTER_BUILD_AUDIT.md`
- Ääni: `coachVoice.ts`, `original-product-integrity.mdc`
