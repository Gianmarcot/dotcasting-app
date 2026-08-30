# Galleria video con la stessa interfaccia delle foto

## Obiettivo

Nella sezione "Galleria e media" del profilo talent, sostituire i due riquadri separati per il video di presentazione e lo showreel con un secondo blocco identico a quello delle foto, con pulsante "Tutti i video" che apre una modale di gestione uguale a quella delle fotografie.

## Cosa cambia per l'utente

1. **Blocco video nella card "Galleria e media"**
   - Sotto il blocco foto compare un blocco con la stessa struttura: anteprime dei video già caricati, tessera "+ N video" quando non ci stanno tutti, testo vuoto "Non hai ancora caricato nessun video", e pulsante centrale "Tutti i video".
   - Le anteprime dei video sono **quadrate (1:1)**, non più in formato verticale.

2. **Modale "Video"**
   - Stessa struttura della modale "Fotografie": titolo, selettore categorie in alto, pulsante "Aggiungi video", griglia con drag & drop per l'ordinamento, frecce avanti/indietro, eliminazione con annulla entro pochi secondi.
   - Categorie: "Video di presentazione", "Showreel professionale", "Altri video".
   - Le tessere della griglia e le miniature del selettore categorie sono quadrate.
   - Ogni tessera mostra il fotogramma di anteprima del video (nessuna riproduzione automatica); il video parte solo su azione esplicita.
   - Nessun ritaglio: il pulsante di crop presente sulle foto non compare sui video.
   - Nessun badge "Foto profilo"/"Copertina" e nessuna sincronizzazione con la foto profilo.

3. **Limiti**
   - "Video di presentazione" e "Showreel professionale" restano a un solo video ciascuno: caricandone uno nuovo si sostituisce quello esistente.
   - "Altri video" accetta più video.

## Note tecniche

- Nessuna migrazione, nessun nuovo campo: le categorie `intro_video`, `showreel`, `other_videos` esistono già in `src/lib/mediaCategories.ts`; si aggiunge solo l'export `VIDEO_CATEGORIES`.
- `PhotoGalleryModal.tsx` viene generalizzato in un componente unico parametrizzato per tipo di media (`photo` | `video`) — stessa logica di upload, riordino, delete-with-undo — con differenze: aspect ratio delle tessere (`aspect-[2/3]` vs `aspect-square`), accept del file input, assenza di crop e della sincronizzazione avatar per i video. La modale foto attuale resta invariata nel comportamento.
- `MediaCard.tsx`: rimozione dei due `VideoBlock`, aggiunta del blocco video riutilizzando la stessa griglia di anteprime del blocco foto, con `<video preload="metadata">` (o `thumbnail_url` quando presente) come anteprima.
- Riuso di `useTalentMedia`, `useUploadMedia`, `useDeleteMedia`, `useUpdateMediaOrder` senza modifiche, salvo la sostituzione del video esistente nelle due categorie a slot singolo.
- Il deep link `?photos=<categoria>` resta funzionante; si aggiunge l'equivalente `?videos=<categoria>`.
