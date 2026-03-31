# Puhelin-preview — aina tuore tuotantoversio

Tavoite: ei vanhaa `.next`-cachea, ei jumiin jäänyttä `next start` / tunnelia, ei vanhaa trycloudflare-linkkiä.

## A) Tuotantopreview paikallisesti

1. Puhdas tila + uusi build + käynnistys:

   ```bash
   npm run preview:full
   ```

   Tai vaiheittain:

   ```bash
   npm run preview:clean
   npm run preview:start
   ```

   - `preview:clean` sammuttaa tyypilliset `next dev` / `next start` / `cloudflared tunnel` -prosessit (macOS/Linux) ja poistaa `.next`-kansion.
   - `preview:start` asettaa `NEXT_PUBLIC_PREVIEW_BUILD=1`, ajaa `npm run build` ja `npm run start` (oletusportti **3000**).

2. Varmista että sovelluksessa näkyy **Preview build** -merkki (keltainen nauha navin yläpuolella) ja **Asetukset** näyttää build-ajan ja originin.

## B) Uusi cloudflared-tunneli

Toisessa terminaalissa (kun `next start` pyörii):

```bash
./.tools/cloudflared tunnel --url http://localhost:3000
```

Kopioi terminaaliin tulostuva **uusi** `https://….trycloudflare.com` -osoite.

## C) Käytä aina uutta trycloudflare-linkkiä

Jokainen `cloudflared`-ajo antaa uuden satunnaisen alidomainin. **Älä** käytä eilistä tai tallennettua URL:ia — vanha linkki tai kuollut tunneli voi näyttää välimuistia tai tyhjää näkymää ilman selkeää virhettä.

## D) Testaa puhelimella

- **Chrome / Safari — yksityinen välilehti** (tai tyhjä profiili), jotta vältät aggressiivisen välimuistin.
- Varmista että **build-aika** asetuksissa vastaa juuri ajettua `preview:start` / `preview:full` -buildia.

## Nopein rutiini tiimille

```bash
npm run preview:full
# toinen terminaali:
./.tools/cloudflared tunnel --url http://localhost:3000
```

→ avaa uusin trycloudflare-URL puhelimella (private tab).

## Tekninen huomio (Windows)

`preview:clean` ei käytä `pkill`-vastausta Windowsissa; sulje Node/cloudflared Tehtäväpalkista tarvittaessa. `NEXT_PUBLIC_PREVIEW_BUILD=1` vaatii Git Bash / WSL tai `cross-env` (ei pakollinen macOS/Linux).
