# CURSOR AGENTTIPAKETTI — AI COACH / FLOW ENGINE

Tämä paketti on tehty niin, että agentti ymmärtää heti mitä rakennetaan, miltä sen pitää näyttää ja mitä EI saa tehdä.

---

## 1. PROJEKTIN YDIN

Rakennamme uuden tuotteen nimeltä **AI Coach / Flow Engine**.

- Tämä **EI** ole perinteinen valmennusappi.
- Tämä **EI** ole PDF-ohjelma.
- Tämä **EI** ole vinkkisovellus.

Tämä on **päivittäinen ohjaus**, joka tekee käyttäjälle selväksi:

- mitä tehdä tänään
- mitä tehdä seuraavaksi
- miten pysyä polulla

**Ydinajatus:** Käyttäjä ei tarvitse lisää tietoa. Käyttäjä tarvitsee selkeän ohjauksen oikeisiin tekoihin joka päivä.

**Tuotteen tärkein arvo:**

- poistaa arvailun
- poistaa päätösväsymyksen
- tekee etenemisestä näkyvää
- tuntuu henkilökohtaiselta valmentajalta ilman valmentajaa

**Tuotesuunta (seuraavat tarpeet, ei automaattista toteutusta):** `docs/PRODUCT_DIRECTION_NOTES.md`

---

## 2. TAVOITE ENSIMMÄISELLE VERSIOLLE

Rakennetaan nopeasti toimiva, myytävän näköinen demo-MVP, joka voidaan näyttää heti käyttäjille ja jota voidaan käyttää ensimmäisessä mainonnassa.

Ensimmäisen version tavoite **EI** ole täydellinen kokonaisuus. Ensimmäisen version tavoite on:

- näyttää valmiilta tuotteelta
- toimia uskottavasti
- luoda käyttäjälle henkilökohtainen suunnitelma
- näyttää päivän tehtävät selkeästi
- antaa vahva premium-fiilis

---

## 3. KOHDERYHMÄ

Ensimmäinen kohderyhmä:

- tavalliset ihmiset, jotka haluavat laihtua, saada paremman kunnon tai päästä liikkeelle
- ihmiset, joilla motivaatio putoaa helposti
- ihmiset, jotka ovat kyllästyneet maksamaan kalliista valmennuksista
- ihmiset, jotka eivät tarvitse lisää tietoa vaan selkeän päivittäisen etenemisen

Älä rakenna tätä kehonrakentajille tai hardcore-optimoijille. Rakennetaan tämä ensin massalle.

---

## 4. TUOTEPOSITIOINTI

Tätä ei positioida “AI antaa sinulle vinkkejä” -tuotteena.

**Oikea positiointi:**

- henkilökohtainen ohjaus ilman henkilökohtaista valmentajaa
- joka päivä tiedät mitä tehdä
- yksinkertainen, selkeä, pakottava flow

Vältä geneerisiä sanoja. Suosi suoraa kieltä: Aloita, Tänään, Tee tämä, Seuraava askel, Pysy polulla.

---

## 5. DESIGN-SUUNTA

- premium SaaS, Apple light -henkinen, vaalea UI, pehmeät siniset accentit
- yksi selkeä pääelementti per näkymä — ei sekavaa dashboard-räjähdystä

---

## 6. ENSIMMÄISEN VERSION SIVUT

- `/` — Landing / myyntisivu
- `/start` — Onboarding (5 kysymystä, “Luo suunnitelma”)
- `/app` — Päädashboard (iso Tänään-kortti, viikko, coach-viesti)

---

## 7. ONBOARDING-KYSYMYKSET

1. Tavoite: Laihtua / Lihasta / Parempi kunto  
2. Taso: Aloittelija / Keskitaso / Edistynyt  
3. Päiviä viikossa: 1–6  
4. Syöminen: Epäsäännöllinen / Ihan ok / Hyvä perusta  
5. Suurin este: Motivaatio / Ajanpuute / En tiedä mitä tehdä / Pysyn hetken mukana mutta tipun pois  

Lopuksi: **Luo minun suunnitelma**

---

## 8–16. LOGIIKKA, COPY, TEKNINEN STACK, KIELLETYT ASIAT

Katso toteutus: `src/lib/plan.ts`, komponentit `src/components/`, sivut `src/app/`.

**Stack:** Next.js, TypeScript, Tailwind, localStorage V1.

**Älä:** geneerinen dashboard-täyte, tumma cyberpunk-UI, fitness-neon, liikaa featureita, monimutkainen käyttäjätili / käyttöoikeuskerros V1.

---

**Ydin:** oikea seuraava askel näkyy heti.
