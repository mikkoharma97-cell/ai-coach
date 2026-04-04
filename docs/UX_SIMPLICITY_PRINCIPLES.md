# Selkeys ja yksinkertaisuus — UX-periaatteet

Tämä dokumentti täydentää [CUSTOMER_IMPROVEMENT_IDEAS.md](./CUSTOMER_IMPROVEMENT_IDEAS.md): sama **daily guidance** -linja, painotuksena *vähemmän päätöksiä, enemmän tekoja*.

**Viittaus sprinttikortissa:** `docs/UX_SIMPLICITY_PRINCIPLES.md`

---

## 1. Yksi pääpolku päivässä

- **Ensimmäinen näkyvä asia** on aina sama tyyppi: “Tee tämä seuraavaksi” (yksi nappi tai yksi kortti). Muu on toissijaista (“Myöhemmin”, “Lisää”).
- **Älä kilpaile itseäsi vastaan:** monta saman painoista CTA:ta samalla ruudulla → käyttäjä jäätyy.

## 2. Progressiivinen paljastus

- Näytä **vain tämän hetken taso** (esim. ateria nyt vs. koko viikko). “Näytä lisää” avaa syvemmän — oletuksena ei pitkä scrolli.
- **Asetukset ja Lisää:** ryhmittele niin, että suurin osa käyttäjistä ei tarvitse “edistyneitä” kohtia päivittäin.

## 3. Sama kaava toistuvissa teoissa

- Treeni / ruoka / merkintä: **sama rakenne** (otsikko → lyhyt ohje → yksi päätoiminto → Valmis). Kun käyttäjä oppii yhden näkymän, hän osaa muut.
- **Yksi termi per asia** koko appissa (esim. aina “Tänään”, ei vuorotellen “Etusivu” / “Dashboard”).

## 4. Vähemmän valintoja, älykkäämpi oletus

- Jokainen uusi kysymys onboardingissa tai asetuksissa **maksaa** — kysy vain kun se muuttaa ohjetta oikeasti.
- **Oletus aina esitäytetty** (“Suositus: …”) ja vaihtoehto “Muuta vain jos tarvitset”.

## 5. Ahdistuksen poisto

- **“Ei tänään” / kevyempi päivä** näkyvästi: yksi napin painallus, ei pitkää selitystä ensin.
- **Ei häpeäcopya** kun päivä menee penkin alle — lyhyt “Huomenna jatkuu” riittää massalle.

## 6. Heti palaute teosta

- Kun käyttäjä merkkaa jotain tehdyksi, **varma vähäinen vahvistus** (check, lyhyt lause). Hiljainen UI = “tapahtuiko mitään?”
- Jos tallennus epäonnistuu, **yksi selkeä virheilmoitus** + toiminto, ei tekninen koodi.

## 7. Mobiili ensin

- **Yksi sarake**, isot kosketusalueet, tärkein peukaloalueella jos se on primary CTA.
- **Ei hover-riippuvia** vihjeitä — kaikki näkyvissä kosketuksella.

## 8. Luottamus ilman small talkia

- Lyhyet lauseet: **mitä tapahtuu**, **mitä maksaa**, **mitä data säilyttää**. Vältä pehmeää “voit halutessasi” -tyyliä; katso `src/config/coachVoice.ts`.

## 9. “Tyhjä tila” on suunniteltu

- Ei tummia tyhjiä ruutuja: **yksi lause + yksi CTA** (“Aloita suunnitelma”, “Palaa tänään”).

## 10. Mittaa yksi asia käyttäjälle

- Esim. “Tänään yksi asia kerrallaan” tai “Tämä viikko: X / Y” — **yksi numero tai yksi progress**, ei useita graafia samalla näytöllä.

---

## Tiivistelmä yhdellä lauseella

> Yksi pää-CTA, sama toistuva kaava, progressiivinen syvyys, oletukset, lempeä poikkeuspäivä, välitön vahvistus teosta.

---

*Päivitä tätä, kun tuotteen linja tiivistyy tai sprintit tuovat uusia rajoja.*
