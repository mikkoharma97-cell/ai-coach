# Dev / preview — uusi deploy, sama URL

Vercelissä **sama osoite** päivittyy uuteen buildiin automaattisesti uuden deployn jälkeen. Jos puhelin näyttää vanhaa:

1. **Tarkista build-marker** — `/home` (hero alla) tai **Asetukset** / **Säädöt** näyttää `v{versio}` ja päiväyksen.
2. **Sulje välilehti** tai käytä **incognito / yksityinen**-ikkunaa (Service Worker / välimuisti).
3. Lisää URL:iin manuaalinen cache-testi: `?v=123` tai sovelluksen `appendBuildQuery()` lisää `?b={versio}` (esim. marketing-CTA:t).
4. **Esikatselu-buildissa** (`NEXT_PUBLIC_PREVIEW_BUILD=1`) Asetuksissa näkyy **Päivitä näkymä (täysi reload)**.

## Ympäristömuuttujat (valinnaiset)

| Muuttuja | Käyttö |
|----------|--------|
| `NEXT_PUBLIC_APP_VERSION` | Korvaa näkyvän version (esim. Git tag tai `1.0.3`). Jos tyhjä → `package.json` / build-info. |
| `NEXT_PUBLIC_BUILD_TIME` | ISO-aikaleima näyttöön. Jos tyhjä → generoitu build-aika. |
| `NEXT_PUBLIC_PREVIEW_BUILD` | `1` = preview-diagnostiikka + kova reload -nappi. |

Joku näistä puuttuu → **fallback**, build ei hajoa.

## Uusi versio ladattu

Sovellus tallentaa viimeksi nähdyn version `localStorage`-avaimella `coach_seen_build_version`. Kun deploy vaihtaa version, näkyy kevyt ilmoitus: **Uusi versio ladattu** (ei automaattista reloadia).
