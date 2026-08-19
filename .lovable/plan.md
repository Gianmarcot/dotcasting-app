Modifica preview "Galleria e media" nella card profilo

## Stato attuale
In `src/components/profile/v2/MediaCard.tsx` la preview mostra al massimo un'immagine per categoria foto, limitata a 4 elementi, e un tile "+ n foto" con il residuo. Questo:
- non mostra tutte le foto disponibili,
- limita artificialmente a 4 il numero di anteprime,
- spreca spazio quando la riga potrebbe ospitare più elementi.

## Obiettivo
Nella sezione "Galleria e media" mostrare, in un'unica riga, tante anteprime quante ne stanno realmente nello spazio disponibile. L'ultimo slot della riga deve essere sempre il tile "+ n foto" (come ora), che indica quante foto non sono mostrate in preview. Se tutte le foto stanno nella riga, il tile count non deve apparire.

## Modifiche previste
File interessato: `src/components/profile/v2/MediaCard.tsx`.

1. **Sorgente delle anteprime**
   - Sostituire l'array corrente `previews` (una foto per categoria) con l'array completo delle foto `photos`, ordinato per `sort_order`.
   - Conservare le etichette di categoria solo dove ha senso, oppure rimuoverle per semplificare la preview. La card apre la modale "Tutte le foto" per i dettagli completi.

2. **Calcolo della capacità della riga**
   - Aggiungere un `ref` al contenitore della preview e un `ResizeObserver` (o fallback `window.resize`) per misurare la larghezza disponibile.
   - Tile: larghezza fissa `140px`, aspect ratio `2/3`, gap `16px` (come oggi).
   - Capacità: `Math.floor((containerWidth + gap) / (tileWidth + gap))`, con minimo `1`.

3. **Logica di rendering**
   - Se `photos.length <= capacity`: mostrare tutte le foto, nessun tile count.
   - Se `photos.length > capacity`: mostrare `capacity - 1` foto e l'ultimo tile con `+ {photos.length - (capacity - 1)} foto`.
   - Mantenere `aspect-[2/3]`, `rounded-xl`, `object-cover` e l'overlay di categoria se necessario.

4. **Layout a riga singola**
   - Usare `flex flex-nowrap` per evitare che il count tile vada a capo su una seconda riga.
   - Non aggiungere scroll orizzontale: le foto che non stanno devono essere indicate dal count tile.

5. **Integrazione modale e pulsante**
   - Lasciare invariato il pulsante "Tutte le foto" e la modale `PhotoGalleryModal`.
   - Cliccando sul tile count si apre la stessa modale della galleria.

## Verifica
- Catturare uno screenshot della pagina `/talent/profile` con varie quantità di foto (es. 3, 10, 20+) per verificare che:
  - la riga si riempia correttamente,
  - l'ultimo slot sia sempre il count tile quando ci sono foto nascoste,
  - il count tile non appaia quando tutte le foto sono visibili,
  - su mobile/tablet la capacità si adatti senza scroll orizzontale.

## Fuori scope
- Nessuna modifica allo schema database, ai servizi di upload, né alla modale di gestione foto.
