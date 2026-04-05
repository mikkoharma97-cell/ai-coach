# Mobile build (iOS / Capacitor)

## 1) Dev-app iPhoneen (LAN, sama WiFi)

**Yksi komento (suositeltu):** tappaa portin 3000, poistaa `.next`, käynnistää Nextin `0.0.0.0:3000`, odottaa vastauksen, kirjoittaa `CAPACITOR_SERVER_URL` (LAN-IP `scripts/lib/lan-ip.mjs`), synkkaa iOS:n ja avaa Xcoden.

```bash
cd /Users/mikkoharma/ai-coach
npm run mobile:dev
```

**Live vs vanha bundle:** kun WebView lataa dev-palvelimen, näet sivulla cyan **DEV MARKER: HOT-RELOAD TEST** ja rivin jossa `window.location.origin` (esim. `http://192.168.x.x:3000`). Jos näet vain `out/index.html` -placeholderin (musta teksti ilman Next-appia), `server.url` puuttuu tai on väärin — aja `npm run mobile:dev` uudestaan tai `npm run cap:sync:dev` oikealla URL:lla.

**Manuaalinen polku:**

```bash
cd /Users/mikkoharma/ai-coach
npm run dev:lan
export CAPACITOR_SERVER_URL="http://<LAN-IP>:3000"
npm run cap:sync:dev
npm run cap:open:ios
```

Huomio:
- IP: `scripts/lib/lan-ip.mjs` / `ipconfig getifaddr en0` (tai aseta `CAPACITOR_SERVER_URL` käsin)
- `mobile:dev` käyttää kiinteää porttia **3000** (vapauttaa sen ensin)
- `ios/App/App/Info.plist` sallii LAN HTTP:n (`NSAllowsLocalNetworking`)
- **Safari / WKWebView:** devissä `src/middleware.ts` asettaa dokumentille `Cache-Control: no-store` (ei vaikuta production-buildiin)

## 2) Oikea asennettava iOS-build (ei selain/placeholder)

```bash
cd /Users/mikkoharma/ai-coach
export CAPACITOR_SERVER_URL="https://oma-tuotanto-url.tld"
npm run cap:sync:prod
npm run cap:open:ios
```

Tarkeaa:
- ilman `CAPACITOR_SERVER_URL` WebView avaa vain fallbackin `out/index.html` (ei taytta appia)
- `cap:sync:prod` blokkaa localhost/LAN/dev-hostit TestFlight-polussa
- tuotantoon: `NEXT_PUBLIC_SHOW_BUILD_MARKER=0` ja `NEXT_PUBLIC_COACH_DEV_TOOLS=0`

## 3) Tarvittavat envit

- `CAPACITOR_SERVER_URL` (pakollinen, kun haluat oikean appin WebViewhin)
- `NEXT_PUBLIC_SHOW_BUILD_MARKER=0` (piilottaa build markerin productionissa)
- `NEXT_PUBLIC_COACH_DEV_TOOLS=0` (piilottaa Home/Refresh debug-tyokalut productionissa)

## 4) Mahdollinen blocker

- jos tuotanto-URL puuttuu tai on vaarin, iOS-appi avaa fallback-placeholderin
- jos puhelin ei ole samassa verkossa LAN-devissa, appi ei tavoita dev-serveria

## 5) Palaute iPhonesta (dev)

Lähetä palaute **Parannukset**-napista kun WebView osoittaa dev-palvelimeen. Data menee `localStorage`-jonoon ja **lisäksi** (vain `next dev`) tiedostoon `docs/feedback-log.json` — katso [feedback-log.md](./feedback-log.md).

## 6) Miten estaa dev-URL commitissa

- ennen commitia varmista `ios/App/App/capacitor.config.json`, ettei `server.url` osoita LAN-osoitteeseen
- aja tarvittaessa uudestaan tuotanto-URL:lla:

```bash
export CAPACITOR_SERVER_URL="https://oma-tuotanto-url.tld"
npm run cap:sync:prod
```
