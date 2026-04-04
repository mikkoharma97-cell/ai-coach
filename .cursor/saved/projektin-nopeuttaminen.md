# Projektin valmistumisen nopeuttaminen

Käytännön nopeuttimet ilman “tee koko arkkitehtuuri uusiksi” -fantasiaa.

## Vähemmän copy/pastea

- **Yksi lähde teksteille:** Jos sama fraasi elää 3+ paikassa, siirrä `src/lib/i18n.messages.ts` (tai vastaavaan) ja käytä avainta. Yksi muutos päivittää kaiken.
- **UI-toistot → pieni komponentti:** Toistuva “kortti + otsikko + CTA” -blokki kannattaa nostaa yhdeksi komponentiksi heti kun toistuu kahdesti — ei vasta viidennellä kerralla.
- **Editor-snippetit (Cursor/VS Code):** Yksi snippet esim. `"use client"`-sivulle, yksi `Link`-navigaatiolle, yksi tyypilliselle `props`-rakenteelle. Säästää minuutteja päivässä.
- **Layout-mallit:** Jos useat näkymät jakavat saman paddingin / max-widthin / otsikkorivin, käytä yhteistä wrapperia tai CSS-luokkaa `globals.css`:ssa (`page-shell`, `section-title`) sen sijaan että kopioit Tailwind-rivejä.

## Projektin “valmistuminen” nopeammin (tuotepäätökset)

- **Yksi “ship”-lista:** 5–10 kohtaa jotka *täytyy* olla; kaikki muu backlogiin. Linjassa: poista → tiivistä ennen kuin lisäät.
- **“Hyväksytty” = yksi onnellinen polku:** Esim. landing → onboarding → today → yksi treeni/ruoka → paywall. Jos muu on “nice”, se ei saa blokata julkaisua.
- **Stub vs. oikea:** Skannaus, analytics, edge-case — merkitse TODO:ksi tai yksinkertainen placeholder; älä hiosta kahta näkymää samaan aikaan.

## Koodi / työkalut

- **`npm run build` ennen mergeä:** Halvin tapa välttää “toimii devissä” -yllätykset.
- **Pienet generaattorit:** Jos luotte paljon samankaltaisia tiedostoja (esim. uusi screen), yksi `scripts/new-screen.mjs` tai manuaalinen kopio **template-tiedostosta** repossa vähentää virheitä copy/pasteen verrattuna.
- **Tyypit ja yhteiset rajapinnat:** Jos sama `Props`-muoto toistuu, yksi `types/`-alias — vähemmän driftiä kuin kahdesti liimatut objektit.

## Mitä *en* ehdottaisi juuri “nopeuteen” nimissä

- Laaja refaktorointi kesken featurea (hidastaa riskillä).
- Barrel-export -viidakko joka sekoittaa importit ilman selkeää hyötyä.

## Lyhyt loppuhuomio (vapaaehtoinen)

- **Koodi:** Valitse *yksi* toistuva UI-kuvio tällä viikolla ja pura komponentiksi — mittaa vaikutus copy/pasteen.
- **Lisäys:** 3–5 rivin “ship checklist” README:n loppuun (vain jos tiimi käyttää sitä oikeasti).
- **Käyttäjä:** Päivittäinen ohjaus — nopeus tulee selkeydestä ja yhdestä pääpolusta, ei feature-listan pituudesta.
