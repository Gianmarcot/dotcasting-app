## Problema

Nel drawer di dettaglio talent vengono mostrate tutte le foto (fino a `2 + photoCount`, o tutte se il preset non ha limite), ma nel PDF alcune di queste stesse foto non compaiono. Due cause distinte, entrambe da risolvere:

1. **Rendering fallito silenziosamente.** `resolvePhotoUrl` verifica solo che l'URL risponda, poi lascia scaricare l'immagine a `@react-pdf/renderer`. Se il secondo fetch (fatto da react-pdf con il suo path Buffer) fallisce per timeout/rate-limit/redirect/MIME non standard, la cella resta vuota senza errori.

2. **Cap silenzioso lato PDF.** `resolveCard` limita le pagine galleria a `preset.photoCount` foto _oltre_ le 2 di copertina. Se il drawer mostra tutte le foto (perché il preset non impone un cap o perché il talent ne ha più del cap), il PDF ne omette una parte.

## Soluzione

Modifiche circoscritte a due file, nessuna modifica alla UI del drawer, al template PDF, allo schema DB.

### 1) `src/lib/casting/generateRound.tsx` — pre-download come data URL

Sostituire `resolvePhotoUrl` con `fetchPhotoAsDataUrl(url)`:
- prova prima l'URL trasformato, poi l'originale (stesso fallback attuale);
- scarica il blob e lo converte in `data:<mime>;base64,...` con `FileReader`;
- normalizza `image/jpg` → `image/jpeg`;
- timeout 20s per candidato; ritorna `null` solo se entrambi falliscono davvero.

Nel loop `generateRoundPdfs`, mappare `talent.photos` con la nuova funzione, filtrare i `null`, e passare i data URL a `resolveCard`. Così react-pdf non fa più network durante il rendering: se la foto è nel drawer, sarà nel PDF.

### 2) `src/lib/casting/roundPreset.ts` — allineare il cap del PDF a quello del drawer

Il drawer usa `2 + photoCount` come cap totale (cover incluse). Il PDF invece usa `photoCount` come cap _solo sulla galleria_, oltre alle 2 cover: totali diversi quando il talent ha molte foto.

Cambiare `resolveCard` in modo che `photoCount` (quando definito) rappresenti il **totale** di foto (cover + gallery), coerente col drawer:
- `coverPhotos` = prime 2 (invariato);
- `gallery` = `talent.photos.slice(2, photoCount ?? Infinity)`;
- se `photoCount == null` → nessun cap, come oggi nel drawer.

Aggiornare il commento del campo `photoCount` in `RoundPreset` per riflettere il nuovo significato (totale foto, non solo galleria). Verificare che l'unico consumer sia `resolveCard` — nessun altro codice attualmente moltiplica/somma su `photoCount`.

## Verifica

- Rigenerare un invio esistente e controllare che ogni foto visibile nel drawer sia presente nel PDF (numero e ordine).
- Talent con foto irraggiungibile lato Storage: la cella resta vuota (nessun "buco nero"), le altre foto restano visibili, generazione non si interrompe.
- Test con talent che ha più foto del `photoCount`: drawer e PDF ora mostrano lo stesso numero di foto.
