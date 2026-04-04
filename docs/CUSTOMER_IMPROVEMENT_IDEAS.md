# Asiakasnäkökulman parannusideat (koko sovellus)

Dokumentti kokoaa ideat **käyttäjän kokemuksen** näkökulmasta: vähemmän arvailua, selkeämpi päivittäinen polku, luottamus ja lopputulos. Linjassa `PROJECT_BRIEF.md` ja `docs/PRODUCT_DIRECTION_NOTES.md` kanssa.

**Huom:** Tämä ei ole toteutuslista; priorisoi sprinteissä.

### Viittaus sprinttikortissa

Merkitse korttiin kopioitavalla viitteellä, esim. **`docs/CUSTOMER_IMPROVEMENT_IDEAS.md §3`** — näin priorisointi ja keskustelu pysyvät jäljiteltynä samaan kohtaan.

| § | Aihe |
|---|------|
| §1 | Ensikosketus (`/`, `/home`, `/app`) |
| §2 | Onboarding (`/start`) |
| §3 | Tänään — ydin |
| §4 | Alapalkki ja Lisää |
| §5 | Treeni |
| §6 | Ruoka |
| §7 | Kehitys, katsaus, säätö |
| §8 | Paywall ja raha |
| §9 | Skannaus |
| §10 | Asetukset, kieli, data |
| §11 | Palaute |
| §12 | Poikkeustilanteet ja luottamus |
| §PRI | Tiivis prioriteetti (lista 1–5 alla) |
| §JATKO | Mahdolliset jatkot |

Pykälät vastaavat alla olevia lukunumeroituja osioita (1–12), §PRI ja §JATKO omat loppukohdat.

**Copy-paste yksi rivi korttiin** (GitHub / Linear / Jira — kuvaus tai label):

```
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §1 — Ensikosketus
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §2 — Onboarding
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §3 — Tänään
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §4 — Alapalkki ja Lisää
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §5 — Treeni
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §6 — Ruoka
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §7 — Kehitys, katsaus, säätö
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §8 — Paywall ja raha
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §9 — Skannaus
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §10 — Asetukset, kieli, data
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §11 — Palaute
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §12 — Poikkeustilanteet ja luottamus
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §PRI — Tiivis prioriteetti
docs/CUSTOMER_IMPROVEMENT_IDEAS.md §JATKO — Mahdolliset jatkot
```

---

## 1. Ensikosketus: `/` → `/home` / `/app`

- **Tyhjä tai jumiutunut juuri:** `EntryGate` näyttää latauksen ja jos jotain menee pieleen, tumma “stuck” -näkymä. Asiakkaalle tämä tuntuu “sovellus ei käynnisty” -kokemukselta — lyhyt selitys heti (“Haetaan suunnitelmaa…”) ja **yksi ensisijainen jatko** vähentää paniikkia.
- **Markkinointi vs. app:** `/home` on erillinen kuin coach-shell. Asiakas voi **eksyä polun** “luinko jo aloituksen / missä teen tänään” -kysymyksessä — vahvista yksi **selkeä CTA** (“Aloita suunnitelma”) ja toista sama sanasto kuin appissa (“Tänään”, ei sekavia synonyymejä).

---

## 2. Onboarding (`/start`)

- **Pituus ja lupaus:** Monta askelta + henkilökohtaisuus on hyvä, mutta asiakas haluaa **nähdä lopputuloksen nopeasti**: “Mitä saan seuraavaksi?” yhdellä ruudulla ennen kuin syöttää lisää.
- **Tuotesuunnassa mainitut:** ateriat, ruokavalio, rajoitteet, rytmi (`PRODUCT_DIRECTION_NOTES`) — jos osa puuttuu käyttökokemuksesta, asiakas kokee että “sovellus ei tunne minua” verrattuna lupaukseen.
- **Epäonnistuminen / keskeytys:** Jos käyttäjä sulkee välilehden kesken, **paluu** pitäisi tuntua turvalliselta (jatkanko samaa vai aloitan alusta) — pelkkä tekninen jatko ei riitä, tarvitaan **inhimillinen copy**.

---

## 3. Tänään — ydin (`/app`, Today)

- **Yksi pääasia:** Tuotteen lupaus on “mitä teen tänään”. Jos ruudulla on monta hubia (fokus, ruoka, treeni, status, paywall), osa käyttäjistä **skannaa kaiken** eikä tee mitään. Parannus: **yksi “tee nyt” -blokki** ja muut “kun ehdit”.
- **Päivän valmis vs. huono omatunto:** “Päivä tehty” -logiikka kannustaa, mutta jos sävy on **rankaiseva**, motivaatio putoaa — sävy: **“Hyvä — huomenna jatkuu”** tms.
- **Poikkeuspäivät:** Poikkeus / minimum day -logiikka on arvokas; asiakkaan pitää **ymmärtää yhdellä lauseella** miksi ehdotus muuttui (matka, kipeä, kiire) ilman debug-tasoa.

---

## 4. Alapalkki ja “Lisää” (AppShell, `/more` + alireitit)

- **Kognitiivinen kuorma:** Viisi päävälilehteä + Lisää-kohdan alla monta polkua (settings, preferences, plans, packages, pro, scan, paywall jne.). Asiakas kysyy: **“Missä muutan X:n?”** — parannus: **hakusanoja / ryhmittely** (“Tili ja maksu”, “Suunnitelma”, “Sovellus”) tai vähemmän samantasoisia kohteita päänavissa.
- **Ruoka-välilehti:** Yhdistää food/day, scan, food-library — hyvä jatkuvuus, mutta riski **sekoittaa** “päivän ruoka” ja “kirjasto” — selkeä **nimi ja etusijainen linkki** tämän päivän ruokaan.

---

## 5. Treeni (`/workout`, sessio)

- **Ohjeet ja varmuus:** Liikeohjeet, sarjat, painot, korvaukset — jos kokemus on ohut, asiakas tuntee **turvattomuutta** tai “tämä on vain lista”.
- **Viikon kokonaiskuva:** “Mitä tällä viikolla tulee?” auttaa **sitoutumista**; pelkkä tämän päivän kortti voi tuntua irralliselta.

---

## 6. Ruoka (`/food`, päivänäkymä, ostoslista)

- **Määrät ja käytännön rajat:** Selkeät grammat / annokset, realistiset rasva-prosentit — ilman niitä asiakas tekee **omia oletuksia** ja pettyy tuloksiin.
- **Kauppalista:** Sekavuus mainittu tuotesuunnassa — asiakas haluaa **yksi lista / yksi nappi** (“osta tämän viikon tärkein”), ei pitkää scrollia ilman järjestystä.

---

## 7. Kehitys, katsaus, säätö (`/progress`, `/review`, `/adjustments`)

- **Näkyvä eteneminen:** “Ei dashboard-täyttöä” on linjaus, mutta asiakas silti haluaa **tuntea edistymisen** (viikko, toistot, ruokarytmi) — yksi selkeä graafi tai luku voi riittää.
- **Viikkokatsaus:** Jos copy on pitkä tai konsulttimainen, se **väsyttää** — tiivis “3 kohtaa tällä viikolla” -malli sopii kohderyhmälle (ei optimoijille).

---

## 8. Paywall ja raha (`/paywall`, gate, overlay)

- **Mock vs. oikea maksu:** Kehityksessä mock-tila — **oikea asiakas** tarvitsee **hinnoittelun, luottamuksen, peruutuksen, tukikanavan** näkyvästi. Ilman niitä paywall tuntuu “demolta”.
- **Trial loppu:** Tunne **“menetin kaiken”** on riski. **Mitä säilyy ilmaiseksi** vs. **mikä lukittuu** pitää olla **1–2 lauseessa** selvä.
- **Overlay (esim. engagement-milestone):** Voi tuntua **hyökkäävältä** jos timing tai sävy on väärä — testaa oikeilla käyttäjillä.

---

## 9. Skannaus (`/scan`, placeholder)

- **Odotukset:** Jos UI lupaa skannauksen mutta kokemus on **placeholder / rajattu**, osa käyttäjistä kokee **pettymyksen** heti — joko **rehellinen “tulossa”** tai piilota syvälle kunnes valmista.

---

## 10. Asetukset, kieli, data

- **localStorage V1:** Riski: **uusi laite = tyhjä**. Ilman synkkaa: **kerro** (“Tiedot tallentuvat tähän laitteeseen”) — vähentää tukipyyntöjä ja luottamuspresiä.
- **Kieli:** Kriittiset polut (paywall, turvallisuus) **yhtä hyviä** molemmilla kielillä.

---

## 11. Palaute (`/feedback`)

- **Suljettu silmukka:** Vahvistus (“Kiitos, tämä meni tiimille”) ja mahdollinen **seuranta** parantaa tunnetta, että appi ei ole musta aukko.

---

## 12. Poikkeustilanteet ja luottamus (koko sovellus)

- **Virheet verkossa:** Yksi ystävällinen “ei yhteyttä / yritä uudelleen” -malli kriittisille näkymille.
- **Yhtenäinen ääni:** Coach-ääni / kielletyt fraasit — asiakas tuntee **ristiriidan** heti jos sävy vaihtelee näkymästä toiseen.

---

## Tiivis prioriteetti (asiakas ensin)

1. **Yksi selkeä päivittäinen askel** ja vähemmän “kaikki kerralla” -tunnetta Tänään-näkymässä.
2. **Ruoka + treeni:** konkreettiset määrät / ohjeet / viikon näkymä — vähentää “en tiedä teinkö oikein”.
3. **Paywall + data:** luottamus (maksu, säilyvyys, mitä tapahtuu trialin jälkeen).
4. **Navigaatio / Lisää:** vähemmän etsimistä, enemmän ryhmittelyä tai suppeampi pinta.
5. **Odotusten hallinta:** skannaus, mock-maksu, paikallinen tallennus — rehellinen viestintä.

---

## Mahdolliset jatkot (ei automaattisesti toteutusta)

- Yksi **testihenkilö** (esim. vuorotyö, laihdutus): kävele **päivä 1 → päivä 3 → paywall** läpi vain teksteinä — kitka-kohdat listaksi.
- Lyhyt **asiakas-FAQ** (data laitteessa, trial, peruutus) ilman uusia featureita.

---

*Lähde: keskustelun kooste + repo-kartoitus. Päivitä kun prioriteetit muuttuvat.*

---

## Katso myös

- [UX_SIMPLICITY_PRINCIPLES.md](./UX_SIMPLICITY_PRINCIPLES.md) — selkeys- ja yksinkertaisuusperiaatteet (yksi pääpolku, progressiivinen syvyys, mobiili ensin).
