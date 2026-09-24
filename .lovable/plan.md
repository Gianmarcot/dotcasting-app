# Pulsante di caricamento a sinistra nelle finestre foto e video

Nelle finestre "Tutte le foto" e "Tutti i video", la riga sotto la griglia cambia così:
- il pulsante "Aggiungi foto" / "Sostituisci la foto" (e le versioni video) va a sinistra;
- la descrizione della categoria e l'eventuale avviso sul minimo stanno alla sua destra, a 3rem di distanza da desktop;
- su schermi piccoli resta tutto in colonna: prima il pulsante a tutta larghezza, poi il testo.

## Dettagli tecnici
File: `src/components/profile/v2/photos/MediaGalleryModal.tsx` (blocco "Requisito minimo + aggiungi").
- Container: rimuovere `sm:justify-between`, usare `flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-12`.
- Spostare il `<Button>` prima del blocco testo, con `shrink-0`.
- Nessun'altra modifica alla finestra.
