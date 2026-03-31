# HÄRMÄ20 — muistutukset

## Käyttö

- **Asetukset** → *Muistutukset* → selainmuistutukset (opt-in, `Notification.requestPermission`).
- Logiikka: `src/lib/notifications/reminderStorage.ts`, `reminderSchedule.ts`.
- Ajastin: `CoachReminderNotifications` (root layout) — tarkistus ~60 s + kun välilehti tulee näkyviin.

## Tyypit

1. **Treeni** — treenipäivä, päivä ei merkitty, klo ≥ oletus 17, ei lepopäivä.
2. **Ruoka** — päivä ei merkitty, klo ≥ oletus 12.
3. **Päivä kesken** — päivä ei merkitty, klo ≥ oletus 20.

## Ei spämmiä

- Max **3** ilmoitusta / kalenteripäivä.
- Vähintään **90 min** kahden ilmoituksen väli (kun yksi on jo lähetetty).
- **Hiljaiset tunnit** oletuksena 22–7.
- `silent: true` ilmoituksissa (kevyempi ääni).

## Rajat

- Ei taustatyöntöä ilman service workeria — luotettavin kun selain on auki tai välilehti herää.
- iOS: selain-/PWA-rajoitukset voivat rajoittaa ilmoituksia.
