# Galleria e media: pulsante staccato e allineato in basso

## Cosa cambia

- I pulsanti "Tutte le foto" e "Tutti i video" tornano sotto al mazzo di immagini, staccati (non più sovrapposti all'immagine), con la stessa distanza usata tra la riga del conteggio e il mazzo.
- Le due aree si allineano tra loro: il pulsante resta sempre appoggiato in basso all'area, così le due colonne (foto e video) hanno la stessa altezza anche se le anteprime hanno proporzioni diverse (2:3 per le foto, quadrata per i video).
- Nessun'altra modifica: conteggio, indicazione dei minimi, stato vuoto, click sull'intera area e modali restano come ora.

## Dettagli tecnici

In `src/components/profile/v2/MediaCard.tsx`, dentro `MediaArea`:
- il pulsante esce dal wrapper della pila (rimosso `absolute -bottom-5 left-1/2 -translate-x-1/2`) e torna elemento in flusso della colonna;
- l'area usa `justify-between` con il gruppo conteggio + pila in alto e il pulsante in basso, mantenendo `gap-8` come distanza minima;
- rimosso il `pb-14` extra, si torna al padding `p-8`;
- il contenitore delle due aree (`md:flex-row`) usa `items-stretch` così entrambe le colonne condividono l'altezza.
