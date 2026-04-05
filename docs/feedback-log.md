# Palauteloki (dev)

Kun ajat **`npm run dev`** / **`npm run mobile:dev`** ja lähetät palautteen **Parannukset**-napista, merkintä menee:

1. **`localStorage`** (`coach-feedback-v2`) — kuten ennen  
2. Tiedostoon **`docs/feedback-log.json`** (vain `NODE_ENV=development`) — helppo avata editorissa / Cursorissa

Tiedosto **luodaan ensimmäisellä palautteella** projektin juureen `docs/`-kansioon. Se on **`.gitignore`**:ssa, jotta satunnaiset testimerkinnät eivät täytä commiteja; kopioi tarvittaessa manuaalisesti.

**Rakenne:** JSON, `entries`-taulukko uusin ensin (sama järjestys kuin localStoragessa).

**API:** `POST /api/dev/feedback-log` (vain development — tuotannossa 403).
