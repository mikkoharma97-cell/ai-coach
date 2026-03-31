# Vercel — pysyvä julkinen deploy

Lyhyt checklist ennen ensimmäistä deploya ja jokaisen merkittävän muutoksen jälkeen.

## Mitä klikata Vercelissä

1. Kirjaudu [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. **Import Git Repository** — valitse GitHub-repo (Connect GitHub jos ensi kerta).
3. **Framework Preset:** Next.js (oletus).
4. **Root Directory:** `./` (oletus).
5. **Build Command:** `npm run build` (oletus).
6. **Output Directory:** jätä tyhjäksi (Next App Router).
7. **Install Command:** `npm install` (oletus).
8. **Environment Variables** — lisää tarvittaessa (ks. alla); peruskäyttöön ei pakollisia.
9. **Deploy**.

Deployn jälkeen: **Project** → **Deployments** → avaa viimeisin → **Visit** (tai `.vercel.app` -URL).

Custom domain: **Project** → **Settings** → **Domains** → lisää domain; halutessasi aseta `NEXT_PUBLIC_SITE_URL` samaan osoitteeseen.

## Ympäristömuuttujat

| Muuttuja | Pakollinen | Kuvaus |
|----------|------------|--------|
| — | Ei | Oletusdeploy toimii ilman env-muuttujia (`metadataBase` käyttää `VERCEL_URL`). |
| `NEXT_PUBLIC_SITE_URL` | Ei | Kanoninen julkinen URL (metadata, absoluuttiset linkit). Esimerkki: `https://oma-domain.fi` tai `https://projekti.vercel.app`. |
| `CRON_SECRET` | Ei | Vain jos kutsut ulkoisesta cronista `POST /api/training-intelligence/refresh` (Bearer-token). |
| `NEXT_PUBLIC_DEMO_MODE` | Ei | `1` = demo-seed (`demoSeed.ts`). |
| `NEXT_PUBLIC_PREVIEW_BUILD` | Ei | `1` = build-info strip näkyviin. |
| `NEXT_PUBLIC_COACH_MOCK_TRIAL_DAYS` | Ei | Kokeilupäivien mock (0–14). |

Täydellinen lista: [`.env.example`](../.env.example).

## Tuotantotestit ennen / jälkeen deployn

**Paikallisesti (pakollinen ennen pushia):**

```bash
npm run build
PORT=3005 npm run start   # jos 3000 varattu
```

**Smoke-reitit** (odotus: HTTP 200):

`/home`, `/start`, `/app`, `/food`, `/workout`, `/progress`, `/review`, `/adjustments`, `/paywall`

```bash
for p in /home /start /app /food /workout /progress /review /adjustments /paywall; do
  echo -n "$p -> "; curl -s -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:3005$p"
done
```

**Tuotanto-Vercelissä:** avaa sama lista selaimessa tai `curl -I https://<projekti>.vercel.app/home` jne.

**Mobiili:** avaa deploy-URL puhelimella (tai DevTools device mode) ja varmista että päänavigaatio ja päivänäkymä toimivat.

## Mikä voisi estää deployn

- `npm run build` epäonnistuu CI:ssä / Vercelissä → korjaa build-virheet ensin.
- Puuttuva `package-lock.json` tai eri Node-versio → Vercel **Settings** → **Node.js Version** vastaamaan paikallista (tai käytä `engines` `package.json`:ssa).
- Salainen arvo commitoituna → poista historiasta / kierrätä avaimet.

Build voi näyttää Turbopack-varoituksen `next.config.ts` / content-store -ketjusta; se ei estänyt onnistunutta buildia (ks. build-loki).

## Localhost clientissä

Sovellus ei käytä client-bundleissa kiinteää `localhost`-APIa. `http://localhost:3000` on vain **palvelinpuolen** fallback `getPublicSiteUrl()`:ssa kun ei ole `NEXT_PUBLIC_SITE_URL` eikä `VERCEL_URL` (paikallinen dev). Tuotannossa Vercel asettaa `VERCEL_URL`.

Skriptit (`scripts/capture-screenshots.mjs`) eivät ole osa tuotantobundlea.
