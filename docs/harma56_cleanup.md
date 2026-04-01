# HÄRMÄ56 — CLEANUP

Lähde: `HARMA56_CLEANUP.txt` — sisältö vain **CLEAN** (ei tehtävälistaa).

## Versio

Tuoteversio ja build-fingerprint: **`src/config/version.ts`** — `APP_VERSION = "HÄRMÄ56"`, `HARMÄ_BUILD = 56`, `BUILD_SYNC_FINGERPRINT`, `BUILD_DISPLAY_LINE` (päivä/aika `buildInfo.generated.ts` kautta `npm run build`).

## Mitä «cleanup» tarkoittaa tässä kontekstissa

Konkreettista listaa ei ollut lähteessä. Yleinen hygienia repossa:

| Tyyppi | Viite |
|--------|--------|
| Reitit / smoke | `docs/harma17_qa.md` — `npm run qa:routes`, build |
| Kuollut koodi | Poista vain kun varmistettu käyttämättömäksi (ei laajaa refaktorointia ilman syytä) |
| Dokumentit | `docs/feature-audit.md`, `MASTER_BUILD_AUDIT` — päivitä kun featuret muuttuvat |

## Viimeaikaiset tuotepolut (konteksti)

Food / workout / progress -yksinkertaistukset ja HARMA-dokumentit (`docs/harma52_*` … `docs/harma55_*`) — ks. kyseiset tiedostot; ei automaattista siivouslistaa tässä tiedostossa.
