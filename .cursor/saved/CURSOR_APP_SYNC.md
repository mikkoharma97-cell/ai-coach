# Cursor-sovellus vs. repo — miten käytät näitä

**Lähde totuudelle tiimille:** tämän projektin kansio  
`ai-coach/.cursor/saved/`  
on tarkoitus pitää **Gitissä**, jotta sama ohjeistus löytyy jokaisesta kloonista ilman keskusteluhistoriaa.

## Cursorin oma “Saved” / tallennetut promptit

Cursor tallentaa osan tilasta sovelluksen dataan (macOS: tyypillisesti `~/Library/Application Support/Cursor/`), usein tietokantoihin — **ei** yhtä selkeää “kopioi tämä tiedosto” -polkua kuin repossa.

Käytännössä:

1. **Avaa** haluamasi tiedosto reposta (esim. `agent-ohjeistus-chatgpt.md`).
2. **Kopioi** sisältö Cursorin **Rules for AI**, **Notepad**, tai **Saved prompts** -toimintoon, jos haluat sen aina näkyviin ilman repoa.
3. **Pidä repo** auennussa: moni tiimi käyttää vain `.cursor/saved/` -tiedostoja viitteinä — ne päivittyvät kun vedät `main`-haaran.

## Symbolilinkki (vain jos haluat paikallisen “peilin”)

Voit luoda **omaan** hakemistoosi peilinkin repoon (polku omaan klooniisi):

```bash
ln -sf "/polku/ai-coach/.cursor/saved" "$HOME/ai-coach-agent-saved"
```

Tämä ei synkronoi Cursorin sisäistä Saved-tietokantaa; se vain helpottaa pääsyä Finderissa / terminaalissa.

## Uusi kehittäjä / uusi malli — mistä aloittaa

1. [README.md](./README.md) (tämän kansion indeksi)  
2. [agent-ohjeistus-chatgpt.md](./agent-ohjeistus-chatgpt.md)  
3. Projektin viralliset säännöt: `../rules/` ja juuren `PROJECT_BRIEF.md`
