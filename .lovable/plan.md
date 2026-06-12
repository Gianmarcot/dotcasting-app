# Sbloccare la generazione PDF della preview card

## Problema

In `/dev/card-preview` (sia Mock che Corrie) il PDF resta su "Generazione PDF…". Console mostra ripetutamente:

```
Cannot read properties of undefined (reading 'isBuffer')
  at fetchImage (@react-pdf/renderer)
```

`@react-pdf/renderer` chiama `Buffer.isBuffer(...)` quando scarica le immagini nel browser. Senza `Buffer` globale, `fetchImage()` non risolve mai → `pdf(...).toBlob()` non termina → nessun PDF renderizzato → la card appare vuota anche se i dati nel DB ci sono. Il tentativo attuale (`import("buffer")` dentro `CardPreview.tsx`) non funziona perché il pacchetto `buffer` non è installato tra le dipendenze, quindi Vite restituisce un modulo vuoto.

Verificato in DB per Corrie: tutti i campi indicati (175cm, 70kg, Marroni, Rosso, Lunghi, Mossi, Lentiggini, M, IT 42|EU 36, IT 46|EU 36, vita 80, petto 95, fianchi 95, scarpe 39, collo 40, spalle 45, Spagnolo, Inglese, Canto) sono popolati. Il problema è puramente di rendering PDF.

## Modifiche

1. **Installare il pacchetto `buffer`** come dipendenza runtime (`bun add buffer`). È la build browser-friendly del modulo Node, già usata in molti progetti Vite per polyfillare `@react-pdf/renderer`.

2. **`src/dev/CardPreview.tsx`** — sostituire l'import asincrono dentro `ensureBufferPolyfill` con un import statico in cima al file:

   ```ts
   import { Buffer } from "buffer";
   if (!(globalThis as { Buffer?: unknown }).Buffer) {
     (globalThis as { Buffer?: unknown }).Buffer = Buffer;
   }
   ```

   Rimuovere `ensureBufferPolyfill()` e la sua chiamata `await` nell'effetto PDF: con l'import statico il polyfill è già attivo al primo render.

3. **`src/lib/casting/generateRound.tsx`** — stesso polyfill in cima al file, così la generazione PDF in produzione (round reali, non solo la preview dev) gode dello stesso fix. Verificare con `code--view` la presenza dell'import `pdf` da `@react-pdf/renderer` per confermare che è il punto giusto.

## Fuori scope

- Nessuna modifica a registry, preset, template PDF/Web, mapper `fetchRoundTalents`.
- Nessuna modifica ai dati di Corrie.
- Nessuna modifica a Vite config: l'import diretto del pacchetto `buffer` non richiede alias né `define`.

## Verifica

- `/dev/card-preview` con Mock + Completo: PDF renderizzato, foto Unsplash visibili.
- Toggle su Corrie: foto reali da Supabase Storage visibili, pannello scuro popolato con Altezza 175cm, Peso 70kg, Occhi Marroni, Capelli Rosso, Lunghezza Lunghi, Tipo Mossi, Segni Lentiggini, tutte le taglie (M, IT 42|EU 36, IT 46|EU 36), Vita 80cm, Petto 95cm, Fianchi 95cm, Spalle 45cm, Collo 40cm, Scarpe 39, Lingue "Spagnolo, Inglese", Abilità "Canto", Email/Telefono, Disponibilità "Disponibile: Europa".
- Console pulita: nessun warning `isBuffer`.
- Toggle Mock ↔ Corrie e Essenziale ↔ Completo continuano a funzionare.
