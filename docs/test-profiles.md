# Testiprofiilit (HÄRMÄ34)

Vakioita, joilla ulkoinen arvio voi toistaa tilanteita **ilman** että keskustelussa jaetaan jatkuvasti screenshotteja. Asetukset tehdään sovelluksessa (onboarding / Lisää / Asetukset) — alla omat nimet ja kentät.

## 1. Full Coach — aloitteleva

- **Tavoite:** kunto / hyvinvointi tai laihtuminen (matala kynnys)
- **Taso:** aloitteleva
- **Treeni:** 2–3 pv / vk, sali tai sekä koti
- **Arki:** säännöllinen päivärytmi
- **Tila:** Full Coach (`appUsageMode`: full coach)

## 2. Kiireinen rasvanpoltto

- **Tavoite:** laihtuminen
- **Taso:** keskitaso
- **Treeni:** 2–4 pv / vk, kiireinen arki / vähemmän sessioita
- **Ruoka:** kevyt rakenne, 3–4 ateriaa
- **Tila:** Full Coach

## 3. Vuorotyö

- **Arki / vuorot:** vuorotyö tai myöhäinen rytmi
- **Tavoite:** painonhallinta tai kunto
- **Treeni:** 2–4 pv, joustava
- **Ruoka:** vuoroon sopiva rakenne (jos ruokakirjastossa)
- **Tila:** Full Coach

## 4. Vain ruoka (Food Only)

- **Tila:** Food Only (`appUsageMode`: food only)
- **Tavoite:** laihtuminen tai painon suunta
- **Odotus:** treenivälilehti piilossa, Today painottaa kaloria / proteiinia / painolinjaa

## 5. Paluu treeniin (comeback)

- **Taso:** keskitaso tai aloitteleva
- **Tavoite:** lihas / kunto
- **Haaste / elämä:** paluu tauon jälkeen tai epäsäännöllinen treeni
- **Tila:** Full Coach
- **Ohjelma:** kirjastosta “paluu” / kevyt rytmi -tyyppi (kun valittavissa)

---

**Huom:** Tarkat kenttänimet koodissa: `OnboardingAnswers` (`src/types/coach.ts`). Profiili tallennetaan laitteelle — testaaja voi tallentaa viisi profiilia eri selaimissa tai käyttää export/importia jos toteutettu.
