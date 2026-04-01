# HÄRMÄ54 — SALES VIDEO

Lähde: `HARMA54_SALES_VIDEO.txt` — sisältö vain **SALES** (ei videolinkkiä, ei käsikirjoitusta).

## Toteutus tänään (koodi)

Myynti on **teksti + polku**, ei erillistä upotettua myyntivideota:

| Sivu | Komponentit | Tekstit |
|------|-------------|---------|
| `/launch` | `LaunchHeroPage` | `launch.*` (`i18n.messages.ts`) — kiire, kipu, ratkaisu, luottamus, CTA |
| `/demo` | `DemoPreviewPage`, `SalesPitchDemo` | `demo.*` — myyntipuhe + esikatselu (~2 min, ks. `docs/harma18_sales_demo.md`) |

**Video:** `launch` / `demo` -hakemistoissa ei ole iframe-/YouTube-upotusta. `HelpVideoCard` on coach-näkymissä (eri tarkoitus).

## Liittyvät docs

- `docs/harma15_sales.md` — myyntipsykologia, lyhyet lauseet
- `docs/harma18_sales_demo.md` — demo-flow ja rakenne

## Jos myyntivideo lisätään

- Päätä: host (esim. upotettu player) + sijainti (`/launch` yläosa, `/demo` intro, tai molemmat).
- Lisää saavutettavuus: tekstitys / poster, ei autoplaya äänellä ilman käyttäjän tekoa (käytännön minimi).

## Versio

`src/config/version.ts` — ei sidosta HÄRMÄ54:ään.
