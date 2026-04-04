# Ostoslista + tuoteskannaus — seuraava passi (roadmap)

Tämä dokumentti on **suunnitelma**, ei toteutettua koodia. Nykyinen `generateShoppingList(days, locale)` (`src/lib/food/shoppingList.ts`) jää toistaiseksi ennalleen; seuraava passi laajentaa kerroksen alla kuvatulla tavalla **rikkomatta buildia askel kerrallaan**.

---

## 1. FatSecret ja kolmannet osapuolet — projektin linja

| Sallittu | Ei sallittu |
|----------|-------------|
| Oma data, käyttäjän syöttämä data | FatSecretin (tai vastaavan) tietokannan, tuotelistan tai makrojen **kopiointi** |
| Oma tuote- ja skannausmalli | UI:n tai palvelun **peilaaminen** |
| **Virallinen** API / lisensoitu integraatio, kun käyttöehdot sen sallivat | Käsin kopioitu data, scraping, epäviralliset peilit |

**FatSecret-vaihtoehto myöhemmin = vain integraatio**, ei kopiointi. Jos API + lisenssi + ehdot täyttyvät, tuotedata voidaan hakea **sallitusti** ja yhdistää omaan kerrokseen.

---

## 2. Ostoslista — tavoiterunko (`shoppingList.ts`)

**Tuleva allekirjoitus (luonnos):**

```ts
// Tavoite seuraavassa passissa — ei vielä pakollinen riippuvuus:
generateShoppingList(days: number, mealPlan: MealPlanInput): ShoppingListResultV2
```

**Palautteen rakenne (tavoite):**

- Ryhmät: proteiinit, hiilarit, rasvat, vihannekset, lisät (tms.)
- Rivikohta:
  - **nimi** (geneerinen raaka-aine / tuotetyyppi)
  - **määrä** + **yksikkö** (`g` | `ml` | `kpl` | `pkt`)
  - **käyttöpäivät** (esim. jakautuu N päivään)
  - **vaihtoehtoinen ostosmuoto** (esim. pakaste vs. tuore)

Esimerkkimuoto (ei toteutettu vielä):

- kanafilee 800 g  
- riisi 500 g  
- rahka 4 kpl  
- marjat 600 g  

**Kaksi tasoa ehdotuksissa (myöhemmin):**

- **A — perusraaka-aine:** kana, riisi, rahka (geneerinen)
- **B — kauppaystävällinen kuvaus:** korkea proteiini, nopea vaihtoehto, helppo arkeen — **ilman automaattisia brändejä** ilman omaa dataa / oikeuksia

---

## 3. Tuotemalli — oma kerros (`GroceryProduct`)

Seuraavassa passissa tyyppi omaan tiedostoon, esim. `src/types/groceryProduct.ts` (luonnos):

```ts
type GroceryProduct = {
  id: string;
  barcode?: string;
  nameFi: string;
  brand?: string;
  category:
    | "protein"
    | "carb"
    | "fat"
    | "vegetable"
    | "snack"
    | "dairy"
    | "drink"
    | "other";
  unit: "g" | "ml" | "piece";
  macrosPer100?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags?: string[];
  substitutes?: string[]; // viittaukset muihin id:ihin tai geneerisiin vaihtoehtoihin
};
```

Tavoite: **ei FatSecret-rakennetta** — kategoriat ja kentät palvelevat **omaan** sopivuus- ja korvaavuuslogiikkaa.

---

## 4. Skannauslogiikka (flow, myöhemmin)

1. Käyttäjä skannaa viivakoodi.
2. **Jos** tuote löytyy **omasta** katalogista (local / backend myöhemmin):
   - näytä **sopivuus** päivän rakenteeseen / tavoitteeseen
   - näytä **mihin ateriaan** istuu
   - näytä **mitä voi korvata** (geneeriset vaihtoehdot tekstinä tai id-listana)
3. **Jos ei löydy:**
   - käyttäjä voi syöttää perustiedot (nimi, makrot / annos, yksikkö)
   - tallennus **omaan** paikalliseen katalogiin (tai myöhemmin sync)

Esimerkkilinja copylle (ei ulkoista dataa):

- *"Proteiinirahka — sopii aamun ankkuriin"*
- *"Voit korvata tällä: rahka / vanukas / raejuusto"*

---

## 5. Kuukausisuunnittelu — kevyt kerros (myöhemmin)

Ei uutta monimutkaista näkymää ensimmäisellä kierroksella.

**Konsepti: "Kuukausirunko"**

- tavoite  
- ohjelmasuunta  
- tärkeät tapahtumat  
- painon / suorituskyvyn suunta (laadullinen)  
- tausta rakentaa **viikot**; **päivän päätökset** pysyvät automaattisina

---

## 6. Periaate: automaatio vs. käyttäjä

**Automaatio:** treenirytmi, ruokarytmi, vaihtoehdot, ostoslista, kuukausitason runko (kun kerros on valmis).

**Käyttäjä antaa:** tavoitteen, tason, rajoitteet, tapahtumat, mieltymykset — ei jokaista makroa käsin.

---

## 7. Ammattilaismateriaali

Saadaan käyttöön **periaatteina, rakenteina, progression ja ravinnon logiikkana** — ei suorina kopioina samoista tekstiblokkeista, taulukoista tai ohjelmanimistä. Engine on **oma**.

---

## 8. Seuraava järkevä toteutuskomento (kun nykyinen build vihreä)

**TEE OSTOSLISTA + SKANNAUSRUNKO**

- Päivitä / laajenna `shoppingList.ts` tavoitesignatuurin ja rivirakenteen mukaan (migration vaiheittain).
- Lisää `GroceryProduct`-tyypit + skannaus-placeholder (UI-rakenne oikein, ei ulkoista FatSecret-dataa).
- Sopivuus päivän ateriaan + korvaavuus geneerisesti.
- Dokumentoi tässä tiedostossa tehdyt muutokset lyhyesti.

---

## 9. Linkit

- Nykyinen demo-ostoslista: `src/lib/food/shoppingList.ts`
- Ruoka-näkymä: `src/components/FoodScreen.tsx`
