# Kritiikki ja seuraavat parannukset (AI Coach / Flow Engine)

Tämä tiedosto on tarkoituksella **sisäinen**: mitä viime töissä jäi heikoksi, mitä riskiä on, ja mitä tekisin paremmin koodissa. Päivitä tarvittaessa.

---

## 1. Kritiikki viimeisistä parannuksista

### Tausta, gradientti, grain

- **Hyvä:** Gradientti + grain rikkovat “tasaisen SaaS-taustan” ilman tummaa gym-UI:ta.
- **Heikko:** `body`-gradientti + `background-attachment: fixed` voi aiheuttaa **visuaalista nykimistä** joissain selaimissa (erityisesti mobiili + scroll) tai eri näyttötiloissa. Ei välttämättä bugi, mutta kannattaa testata oikeilla laitteilla.
- **Heikko:** Grain on **globaali** (`fixed`, koko viewport). Jos myöhemmin tulee modaaleja, fullscreen-kuvia tai tummia pintoja, `mix-blend-mode: multiply` + z-index voivat vaatia tarkistusta (kerrostuminen).
- **Riski:** Grain SVG data-URI on “magic string” CSS:ssä — vaikea lukea ja säätää ilman kommenttia tai tokenia.

### Spotlight Today-kortin takana

- **Hyvä:** Ankkuroi katseen yhteen pääelementtiin (briefin mukainen).
- **Heikko:** Kaksi erillistä blur/radiaalilähdettä herossa (ylä + kortin takana) — **kilpailu valonlähteistä** ilman selkeää hierarkiaa. Yksi dominoiva hehku voisi riittää.
- **Heikko:** Absoluuttiset `%`-sijainnit (`top-[42%]`) ovat herkkiä **sisällön pituuden muutoksille** eri kielillä / fonteilla.

### Today-mock (“control panel”)

- **Hyvä:** Yksi paneeli + väliviivat = “järjestelmä”, ei kolme erillistä korttia.
- **Heikko:** Paljon **inline-arvoja** (`from-[#fcfdff]`, `bg-[linear-gradient(...)]`) — sama visuaalinen kieli ei toistu automaattisesti oikealla `/app` Today-näkymällä. Riski: **mock ei enää näytä samalta kuin tuote**.
- **Heikko:** CTA-teksti vaihtui **“Complete day”** — jos muualla tuotteessa on edelleen “Mark as done”, syntyy **terminologinen epäjohdonmukaisuus** (ei välttämättä väärin, mutta pitää hallita tietoisesti).

### Mikrokopi ja rivimäärä hero-sarakkeessa

- **Hyvä:** “Built for your goal” + progression vahvistavat “ei geneeristä ohjelmaa”.
- **Heikko:** Luettavaa on paljon (trust + progression + kaksi riviä kortin alla). Brief sanoo vähentää kilpailua huomiolle — **yksi** näistä voisi olla valinnainen tai lyhyempi.

---

## 2. Mitä tekisin paremmin tässä projektissa (koodi ja rakenne)

### A. Yksi totuus Today-UI:lle

- Poimisi **jaetut tokenit** (`--today-panel-bg`, `--today-divider`, `--shadow-today`) ja käyttäisi niitä sekä `HeroTodayLiving` (landing) että oikea dashboard-komponentti.
- Tavoite: mock ei ole erillinen “demo-skin”, vaan **sama järjestelmä**, eri data.

### B. CSS: vähemmän magiaa, enemmän nimiä

- Siirto: pitkät `linear-gradient(...)` ja inset-shadowit **`globals.css`**:ään nimetyiksi muuttujiksi.
- Hyöty: helpompi säätää “discipline / premium” -linjaa yhdestä paikasta.

### C. Hero: yksi valonlähde

- Yhdistäisin ylä-blurin ja kortin spotlightin **yhteen suunnitelmaan** (tai poistaisin toisen), jotta hierarkia pysyy yhdellä ankkurilla.

### D. Responsiivinen spotlight

- Korvaisin magic `top-[42%]` **container-queryllä** tai ankkuroinnilla suhteessa kortti-wrapperiin (`inset` suhteessa `relative`-vanhempaan), jotta layout ei hajoa käännöksissä.

### E. Grain opt-in tai kevennys

- Harkitsisin grainia vain **landing-sivulla** (`page.tsx` wrapper) tai `prefers-reduced-motion` / `prefers-contrast` -huomioilla — vähemmän riskiä ylläpidossa ja saavutettavuudessa.

### F. Terminologia

- Päätös dokumenttiin: käytetäänkö globaalisti **“Complete day”** vai **“Mark as done”**, ja näytetäänkö toinen alatekstinä. Yksi primääri tuotteessa.

### G. Suorituskyky

- Tarkistaisin, ettei useita isoja `blur`-kerroksia + fixed grain + fixed gradientti tee turhaa **paint-kuormaa** matalilla laitteilla (yksi blur riittää usein).

### H. Testaus

- Yksinkertaiset **visuaaliset regressiot**: hero + app + start samalla breakpointilla (ei tarvitse full Percyä aluksi — manuaalinen checklist riittää).

---

## 3. Tiivis “jos vain yksi asia seuraavaksi”

**Synkronoi Today-mock ja oikea Today samaan design-token- ja komponenttipohjaan** — muuten kaunis landing ei lupaa samaa kuin app näyttää.

---

*Luotu agentin toimesta; päivitä kun tuote etenee.*
