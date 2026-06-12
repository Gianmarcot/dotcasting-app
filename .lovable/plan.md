# Fix "Unknown font format" nel PDF della Talent Card

## Causa

`src/lib/casting/TalentCardPDF.tsx` registra il font con:

```ts
Font.register({ family: "TenorSans", src: "/fonts/TenorSans-Regular.ttf" });
```

Ma la cartella `public/fonts/` non esiste nel progetto. Quando `@react-pdf/renderer` richiede quel path, Vite risponde con l'`index.html` di fallback (HTML, non TTF). Il parser font legge bytes che non sono né TTF né OTF né WOFF e solleva **"Unknown font format"**, che viene mostrato come errore in `/dev/card-preview`.

Il path è corretto come convenzione (file in `public/` serviti dalla root), manca solo il file fisico.

## Soluzione

Scaricare il TTF ufficiale di Tenor Sans (Google Fonts, licenza OFL) e committarlo in `public/fonts/TenorSans-Regular.ttf`. Nessun cambiamento di codice necessario: `TalentCardPDF.tsx` resta com'è, e anche `CardPreview.tsx` resta intatto.

## Passi

1. Creare la cartella `public/fonts/`.
2. Scaricare il TTF di Tenor Sans Regular da Google Fonts (`https://fonts.gstatic.com/.../TenorSans-Regular.ttf`) in `public/fonts/TenorSans-Regular.ttf`.
3. Verificare in preview che `/fonts/TenorSans-Regular.ttf` ritorni il binario corretto (header `00 01 00 00` per TTF) e che `/dev/card-preview` generi il PDF senza errori, mostrando il nome in Tenor Sans uppercase nel pannello scuro.

## Note

- Tenor Sans è disponibile solo nel peso Regular: un singolo file basta.
- Nessuna modifica a `src/lib/casting/` o ad altri file dell'app.
- Se in futuro servisse offline-first totale, lo stesso file copre anche eventuali altri usi PDF.
