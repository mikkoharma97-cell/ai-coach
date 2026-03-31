# AI Coach (Next.js)

Päivittäinen ohjaus — ei geneerinen dashboard. Tämä repo on **Vercel-valmis** Next.js 16 -sovellus.

## Paikallinen kehitys

```bash
npm install
npm run dev
```

Avaa [http://localhost:3000](http://localhost:3000). Juuripolku (`/`) ohjaa profiilin mukaan (`EntryGate`).

**Demo-video / Adobe:** `?demo=muscle` (oletus), `?demo=fat_loss`, `?demo=busy` — seedaa profiilin ja lokit (ks. `src/lib/demoSeed.ts`).

## Tuotantobuild (paikallinen)

```bash
npm run build
npm run start
```

Oletusportti: **3000**.

## Vercel — pysyvä julkinen testilinkki (~5 min)

Tarkempi checklist (klikkaukset, smoke-testit, mobiili): [docs/vercel.md](./docs/vercel.md).

**Build-versio / cache / uusi deploy:** [docs/dev-preview.md](./docs/dev-preview.md).

1. **Push GitHubiin**  
   - Luo repo GitHubissa (tai käytä olemassa olevaa).  
   - `git remote add origin …` jos puuttuu, sitten `git push -u origin main` (tai `master`).

2. **Import Verceliin**  
   - [vercel.com/new](https://vercel.com/new) → Import Project → valitse repo.  
   - **Framework Preset:** Next.js (automaattinen).  
   - **Build Command:** `npm run build` (oletus).  
   - **Output Directory:** ei erillistä — Next hoitaa (`.next`).  
   - **Install Command:** `npm install` (oletus).

3. **Ympäristömuuttujat**  
   - Kopioi `.env.example` → Vercel Project → Settings → Environment Variables.  
   - **Pakollisia ei ole** peruskäyttöön: `metadataBase` käyttää `VERCEL_URL`-osoitetta automaattisesti.  
   - Aseta `NEXT_PUBLIC_SITE_URL` vain jos haluat kiinteän kanonisen URLin (custom domain).

4. **Deploy**  
   - Deploy → saat URLin muotoa `https://<projekti>.vercel.app`.

5. **Testaa reitit** (kirjautumaton / paikallinen profiili voi ohjata `/start` tai `/home`):  
   `/home`, `/start`, `/app`, `/food`, `/workout`, `/progress`, `/review`, `/adjustments`, `/paywall`

### Vercel vs. cloudflared

| | Vercel | cloudflared (trycloudflare) |
|--|--------|------------------------------|
| Linkki | Pysyvä, HTTPS | Vaihtuu joka ajolla |
| Kone | Ei tarvitse olla päällä | Tarvitsee `next start` + tunnelin |
| Sopii | Jakolinkkiin, QA:han | Nopeaan paikalliseen mobiilitestiin |

Väliaikainen jakolinkki ilman Verceliä: [docs/dev-preview.md](./docs/dev-preview.md).

## Ympäristömuuttujat (tiivis lista)

| Muuttuja | Pakollinen | Kuvaus |
|----------|------------|--------|
| `NEXT_PUBLIC_SITE_URL` | Ei | Kanoninen URL (metadata). Vercel: käytä custom domainia tai jätä tyhjäksi → `VERCEL_URL`. |
| `CRON_SECRET` | Ei | Vain jos kutsut `POST /api/training-intelligence/refresh` ulkoisesta cronista. |
| `NEXT_PUBLIC_DEMO_MODE` | Ei | `1` = demo-seed (katso `demoSeed.ts`). |
| `NEXT_PUBLIC_PREVIEW_BUILD` | Ei | `1` = build-info strip näkyviin. |
| `NEXT_PUBLIC_COACH_MOCK_TRIAL_DAYS` | Ei | Kokeilupäivien mock (dev/preview). |

Täydellinen lista kommenteilla: [`.env.example`](./.env.example).

## Repo valmius GitHubiin

- `.env.example` on commitissa (`.env*` on ignorattu, `!.env.example` sallittu).  
- Älä commitoi `.env` tiedostoja.  
- Varmista että `npm run build` menee läpi ennen pushia.

## Lisää

- Tuotekonteksti: `PROJECT_BRIEF.md`  
- Paikallinen preview + tunnel: `docs/dev-preview.md`  
- Next.js: [Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
