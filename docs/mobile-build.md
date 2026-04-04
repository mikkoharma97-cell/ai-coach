# Mobile build (iOS / Capacitor)

## 1) Dev-app iPhoneen (LAN, sama WiFi)

```bash
cd /Users/mikkoharma/ai-coach
npm run dev:lan
export CAPACITOR_SERVER_URL="http://192.168.0.203:3000"
npm run cap:sync:dev
npm run cap:open:ios
```

Huomio:
- vaihda IP omasi mukaan
- jos portti ei ole 3000, aseta oikea portti URL:iin
- `ios/App/App/Info.plist` sallii LAN HTTP:n (`NSAllowsLocalNetworking`)

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

## 5) Miten estaa dev-URL commitissa

- ennen commitia varmista `ios/App/App/capacitor.config.json`, ettei `server.url` osoita LAN-osoitteeseen
- aja tarvittaessa uudestaan tuotanto-URL:lla:

```bash
export CAPACITOR_SERVER_URL="https://oma-tuotanto-url.tld"
npm run cap:sync:prod
```
